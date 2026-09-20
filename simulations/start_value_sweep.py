"""Compare starting-value profiles against the current MVP simulation rules.

This module intentionally lives outside the web application.  It mirrors the
current weather, economy, production, subsidy, KPI, and loss rules closely
enough to answer balance questions without changing the frontend.
"""

from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, Sequence


MONTHS = 60
STARTING_BUDGET = 18_000_000
IMPORT_COST_PER_UNIT = 70_000
REVENUE_PER_UNIT = 38_000
PRIVATE_ASSET_THRESHOLD = 600_000
PRIVATE_STORAGE_DISCHARGE_RATE = 0.25


@dataclass(frozen=True)
class StartValues:
    budget: int
    energy_autarky: int
    citizen_satisfaction: int
    supply_security: int


DEFAULT_START_VALUES = StartValues(
    budget=STARTING_BUDGET,
    energy_autarky=18,
    citizen_satisfaction=72,
    supply_security=58,
)

CHALLENGE_START_VALUES = StartValues(
    budget=STARTING_BUDGET,
    energy_autarky=0,
    citizen_satisfaction=50,
    supply_security=0,
)


@dataclass(frozen=True)
class AssetDefinition:
    cost: int
    production: float
    storage: float
    operating_cost: int
    citizen_impact: float
    capacity: int


ASSETS = {
    "solar": AssetDefinition(1_200_000, 7, 0, 35_000, 1, 59),
    "wind": AssetDefinition(2_800_000, 14, 0, 400_000, -3, 6),
    "storage": AssetDefinition(1_700_000, 0, 10, 45_000, 0, 24),
}


@dataclass(frozen=True)
class PlannedAsset:
    item_type: str
    citizen_multiplier: float
    zone_id: str


SOLAR = PlannedAsset("solar", 1.0, "wattenscheid")
WIND = PlannedAsset("wind", 0.5, "nord")
STORAGE = PlannedAsset("storage", 1.0, "wattenscheid")


MONTHLY_DEMAND = (95, 90, 80, 72, 65, 60, 60, 63, 70, 78, 88, 100)
BASE_WEATHER = (
    (0.55, 1.25), (0.65, 1.20), (0.85, 1.05), (1.00, 0.95),
    (1.20, 0.85), (1.35, 0.75), (1.40, 0.70), (1.30, 0.75),
    (1.05, 0.95), (0.80, 1.10), (0.60, 1.25), (0.50, 1.35),
)
BASE_WEATHER_TYPES = (
    "windy", "windy", "mixed", "mixed", "sunny", "sunny",
    "sunny", "sunny", "mixed", "cloudy", "windy", "stormy",
)
WEATHER_ADJUSTMENTS = {
    "sunny": (1.18, 0.78),
    "mixed": (1.00, 0.98),
    "cloudy": (0.82, 1.00),
    "windy": (0.68, 1.20),
    "stormy": (0.58, 1.32),
}
WEATHER_TYPES = ("sunny", "mixed", "cloudy", "windy", "stormy")
WEATHER_WEIGHTS = {
    "winter": (0.20, 0.10, 0.20, 0.30, 0.20),
    "spring": (0.35, 0.35, 0.15, 0.10, 0.05),
    "summer": (0.70, 0.15, 0.08, 0.05, 0.02),
    "autumn": (0.30, 0.25, 0.25, 0.15, 0.05),
}


@dataclass(frozen=True)
class SubsidyLevels:
    solar: int = 0
    storage: int = 0


SUBSIDY_MONTHLY_COST = {"solar": 250_000, "storage": 180_000}


@dataclass(frozen=True)
class MonthlyResult:
    month_index: int
    budget: int
    energy_autarky: int
    citizen_satisfaction: int
    supply_security: int
    demand: int
    production: float
    energy_balance: float
    import_cost: float
    operating_costs: int
    subsidy_costs: int
    weather_type: str


@dataclass(frozen=True)
class SessionResult:
    start_profile: str
    strategy: str
    weather_seed: int
    demand_growth_cap: float
    initial_values: StartValues
    status: str
    loss_reason: str | None
    months_played: int
    final_budget: int
    final_energy_autarky: int
    final_citizen_satisfaction: int
    final_supply_security: int
    final_score: int
    history: tuple[MonthlyResult, ...]


@dataclass(frozen=True)
class StrategySummary:
    start_profile: str
    strategy: str
    sessions: int
    completed_sessions: int
    completion_rate: float
    bankrupt_sessions: int
    voted_out_sessions: int
    average_score: float
    average_final_budget: float
    average_final_energy_autarky: float
    average_final_citizen_satisfaction: float
    average_final_supply_security: float
    average_months_played: float


@dataclass(frozen=True)
class SweepReport:
    runs: tuple[SessionResult, ...]
    summaries: dict[tuple[str, str], StrategySummary]


def _clamp_score(value: float) -> int:
    return max(0, min(100, round(value)))


def demand_for_month(month_index: int, base_demand: int, growth_cap: float = 2.0) -> int:
    """Grow a base month's demand linearly to ``growth_cap`` in month 60."""
    if growth_cap < 1:
        raise ValueError("growth_cap must be at least 1.0")
    growth_factor = 1 + (growth_cap - 1) * month_index / (MONTHS - 1)
    return int(base_demand * growth_factor + 0.5)


def zone_congestion_penalty(public_asset_count: int) -> int:
    """Return the one-time citizen penalty for assets beyond the first two."""
    return max(0, public_asset_count - 2)


def private_asset_capacity(item_type: str, count: int) -> float:
    """Return grid relief from private assets using the equivalent public asset."""
    if item_type == "solar":
        return ASSETS["solar"].production * count
    if item_type == "storage":
        return ASSETS["storage"].storage * count
    raise ValueError(f"Unsupported private asset type: {item_type}")


def city_revenue_for_public_supply(private_supply: float, demand: int) -> int:
    """Private energy relieves the city's revenue-producing supply demand."""
    public_supply_demand = max(0, demand - max(0, private_supply))
    return round(public_supply_demand * REVENUE_PER_UNIT)


def _season(month_of_year: int) -> str:
    if month_of_year in (11, 0, 1):
        return "winter"
    if month_of_year in (2, 3, 4):
        return "spring"
    if month_of_year in (5, 6, 7):
        return "summer"
    return "autumn"


def weather_profile(month_index: int, weather_seed: int) -> tuple[str, float, float]:
    month_of_year = month_index % 12
    target = ((weather_seed % 100) + month_of_year * 37) % 100 / 100
    weights = WEATHER_WEIGHTS[_season(month_of_year)]
    cumulative = 0.0
    weather_index = len(WEATHER_TYPES) - 1
    for index, weight in enumerate(weights):
        cumulative += weight
        if target < cumulative:
            weather_index = index
            break

    weather_type = WEATHER_TYPES[weather_index]
    base_solar, base_wind = BASE_WEATHER[month_of_year]
    base_adjustment = WEATHER_ADJUSTMENTS[BASE_WEATHER_TYPES[month_of_year]]
    selected_adjustment = WEATHER_ADJUSTMENTS[weather_type]
    solar_factor = round(base_solar * selected_adjustment[0] / base_adjustment[0], 2)
    wind_factor = round(base_wind * selected_adjustment[1] / base_adjustment[1], 2)
    return weather_type, solar_factor, wind_factor


def _strategy_plan(strategy: str, month: int, state: dict) -> tuple[PlannedAsset, ...]:
    if strategy == "solar_first":
        if month < 8:
            return (SOLAR,)
        if month < 11:
            return (STORAGE,)
        return ()

    if strategy == "wind_first":
        if month < 2:
            return (WIND,)
        if month < 7:
            return (SOLAR,)
        if month < 10:
            return (STORAGE,)
        return ()

    if strategy == "balanced":
        sequence = (SOLAR, STORAGE, WIND, SOLAR, STORAGE, SOLAR, WIND, SOLAR, STORAGE, SOLAR, WIND, SOLAR)
        return (sequence[month],) if month < len(sequence) else ()

    if strategy == "storage_first":
        if month < 3:
            return (STORAGE,)
        if month < 10:
            return (SOLAR,)
        return ()

    if strategy == "subsidy_first":
        if month < 4:
            return ()
        if month < 10:
            return (SOLAR,)
        return (STORAGE,)

    if strategy == "adaptive":
        forecast = [weather_profile(month + offset, state["weather_seed"]) for offset in range(3)]
        wind_advantage = sum(profile[2] - profile[1] for profile in forecast)
        if wind_advantage > 0.45 and state["counts"]["wind"] < 2:
            return (WIND,)
        if state["stored_energy"] < 4 and state["counts"]["storage"] < 4 and month % 3 == 2:
            return (STORAGE,)
        if state["counts"]["solar"] < 9:
            return (SOLAR,)
        if state["counts"]["storage"] < 4:
            return (STORAGE,)
        return ()

    raise ValueError(f"Unknown strategy: {strategy}")


STRATEGIES = (
    "solar_first",
    "wind_first",
    "balanced",
    "storage_first",
    "subsidy_first",
    "adaptive",
)


def _add_planned_assets(state: dict, planned_assets: Iterable[PlannedAsset]) -> None:
    for planned in planned_assets:
        definition = ASSETS[planned.item_type]
        if state["counts"][planned.item_type] >= definition.capacity:
            continue
        if state["budget"] < definition.cost:
            continue
        state["budget"] -= definition.cost
        state["counts"][planned.item_type] += 1
        previous_zone_count = state["zone_counts"].get(planned.zone_id, 0)
        state["zone_counts"][planned.zone_id] = previous_zone_count + 1
        penalty_delta = zone_congestion_penalty(previous_zone_count + 1) - zone_congestion_penalty(previous_zone_count)
        state["kpis"]["citizen_satisfaction"] = max(
            0,
            state["kpis"]["citizen_satisfaction"] - penalty_delta,
        )
        state["assets"].append(
            {
                "item_type": planned.item_type,
                "citizen_multiplier": planned.citizen_multiplier,
                "zone_id": planned.zone_id,
                "active_at": state["month"] + 1,
            }
        )


def _final_score(state: dict) -> int:
    return (
        state["budget"] // 1_000_000
        + state["kpis"]["energy_autarky"] // 10
        + state["kpis"]["citizen_satisfaction"] // 10
        + state["kpis"]["supply_security"] // 10
    )


def _subsidy_levels_for(strategy: str) -> SubsidyLevels:
    if strategy == "subsidy_first":
        return SubsidyLevels(solar=3, storage=3)
    return SubsidyLevels()


def simulate_session(
    initial_values: StartValues,
    strategy: str,
    weather_seed: int,
    demand_growth_cap: float = 2.0,
) -> SessionResult:
    if strategy not in STRATEGIES:
        raise ValueError(f"Unknown strategy: {strategy}")

    profile_name = "current" if initial_values == DEFAULT_START_VALUES else "challenge"
    subsidy_levels = _subsidy_levels_for(strategy)
    state = {
        "month": 0,
        "weather_seed": weather_seed,
        "budget": initial_values.budget,
        "kpis": {
            "energy_autarky": initial_values.energy_autarky,
            "citizen_satisfaction": initial_values.citizen_satisfaction,
            "supply_security": initial_values.supply_security,
        },
        "assets": [],
        "counts": {"solar": 0, "wind": 0, "storage": 0},
        "zone_counts": {},
        "stored_energy": 0.0,
        "private_asset_counts": {"solar": 0, "storage": 0},
        "spend_accumulator": {"solar": 0.0, "storage": 0.0},
    }
    history: list[MonthlyResult] = []
    loss_reason: str | None = None

    for month in range(MONTHS):
        state["month"] = month
        _add_planned_assets(state, _strategy_plan(strategy, month, state))
        next_month = month + 1
        active_assets = [asset for asset in state["assets"] if asset["active_at"] <= next_month]
        weather_type, solar_factor, wind_factor = weather_profile(month, weather_seed)

        for program, level in (("solar", subsidy_levels.solar), ("storage", subsidy_levels.storage)):
            state["spend_accumulator"][program] += level * SUBSIDY_MONTHLY_COST[program]
            generated_private_assets = int(state["spend_accumulator"][program] // PRIVATE_ASSET_THRESHOLD)
            state["spend_accumulator"][program] -= generated_private_assets * PRIVATE_ASSET_THRESHOLD
            state["private_asset_counts"][program] += generated_private_assets

        production = 0.0
        storage_capacity = 0.0
        citizen_impact = 0.0
        has_solar = False
        has_wind = False
        operating_costs = 0
        for asset in active_assets:
            definition = ASSETS[asset["item_type"]]
            operating_costs += definition.operating_cost
            citizen_impact += definition.citizen_impact * asset["citizen_multiplier"]
            if asset["item_type"] == "solar":
                production += definition.production * solar_factor
                has_solar = True
            elif asset["item_type"] == "wind":
                production += definition.production * wind_factor
                has_wind = True
            else:
                storage_capacity += definition.storage

        demand = demand_for_month(month, MONTHLY_DEMAND[month % 12], demand_growth_cap)
        private_solar_production = private_asset_capacity(
            "solar", state["private_asset_counts"]["solar"]
        ) * solar_factor
        raw_balance = production + state["stored_energy"] + private_solar_production - demand
        private_storage_capacity = private_asset_capacity(
            "storage", state["private_asset_counts"]["storage"]
        )
        private_storage_discharge = 0.0
        if raw_balance < 0:
            private_storage_discharge = min(
                abs(raw_balance),
                private_storage_capacity * PRIVATE_STORAGE_DISCHARGE_RATE,
            )
        energy_balance = raw_balance + private_storage_discharge
        import_cost = abs(energy_balance) * IMPORT_COST_PER_UNIT if energy_balance < 0 else 0
        subsidy_costs = (
            subsidy_levels.solar * SUBSIDY_MONTHLY_COST["solar"]
            + subsidy_levels.storage * SUBSIDY_MONTHLY_COST["storage"]
        )
        revenue = city_revenue_for_public_supply(
            private_solar_production + private_storage_discharge,
            demand,
        )
        state["budget"] = max(
            0,
            round(state["budget"] + revenue - import_cost - operating_costs - subsidy_costs),
        )
        state["stored_energy"] = min(energy_balance, storage_capacity) if energy_balance >= 0 else 0

        subsidy_citizen_bonus = subsidy_levels.solar * 0.4 + subsidy_levels.storage * 0.25
        private_security_bonus = min(4, private_storage_capacity * 0.08)
        mixed_generation_bonus = 2 if has_solar and has_wind else 0
        imported_energy = max(0, -energy_balance)
        covered_demand = max(0, demand - imported_energy)
        monthly_energy_autarky = covered_demand / demand * 100 if demand > 0 else 0
        state["kpis"] = {
            "energy_autarky": _clamp_score(monthly_energy_autarky),
            "citizen_satisfaction": _clamp_score(
                state["kpis"]["citizen_satisfaction"] + citizen_impact + subsidy_citizen_bonus
            ),
            "supply_security": _clamp_score(
                storage_capacity * 0.5 + mixed_generation_bonus + private_security_bonus
            ),
        }

        history.append(
            MonthlyResult(
                month_index=next_month,
                budget=state["budget"],
                energy_autarky=state["kpis"]["energy_autarky"],
                citizen_satisfaction=state["kpis"]["citizen_satisfaction"],
                supply_security=state["kpis"]["supply_security"],
                demand=demand,
                production=round(production, 2),
                energy_balance=round(energy_balance, 2),
                import_cost=round(import_cost, 2),
                operating_costs=operating_costs,
                subsidy_costs=subsidy_costs,
                weather_type=weather_type,
            )
        )

        if state["budget"] <= 0:
            loss_reason = "bankrupt"
            break
        if state["kpis"]["citizen_satisfaction"] <= 0:
            loss_reason = "voted_out"
            break

    status = "lost" if loss_reason else "finished"
    return SessionResult(
        start_profile=profile_name,
        strategy=strategy,
        weather_seed=weather_seed,
        demand_growth_cap=demand_growth_cap,
        initial_values=initial_values,
        status=status,
        loss_reason=loss_reason,
        months_played=len(history),
        final_budget=state["budget"],
        final_energy_autarky=state["kpis"]["energy_autarky"],
        final_citizen_satisfaction=state["kpis"]["citizen_satisfaction"],
        final_supply_security=state["kpis"]["supply_security"],
        final_score=_final_score(state),
        history=tuple(history),
    )


def _summary(profile: str, strategy: str, runs: Sequence[SessionResult]) -> StrategySummary:
    completed = sum(run.status == "finished" for run in runs)
    return StrategySummary(
        start_profile=profile,
        strategy=strategy,
        sessions=len(runs),
        completed_sessions=completed,
        completion_rate=round(completed / len(runs), 4) if runs else 0,
        bankrupt_sessions=sum(run.loss_reason == "bankrupt" for run in runs),
        voted_out_sessions=sum(run.loss_reason == "voted_out" for run in runs),
        average_score=round(sum(run.final_score for run in runs) / len(runs), 2) if runs else 0,
        average_final_budget=round(sum(run.final_budget for run in runs) / len(runs), 2) if runs else 0,
        average_final_energy_autarky=round(sum(run.final_energy_autarky for run in runs) / len(runs), 2) if runs else 0,
        average_final_citizen_satisfaction=round(sum(run.final_citizen_satisfaction for run in runs) / len(runs), 2) if runs else 0,
        average_final_supply_security=round(sum(run.final_supply_security for run in runs) / len(runs), 2) if runs else 0,
        average_months_played=round(sum(run.months_played for run in runs) / len(runs), 2) if runs else 0,
    )


def compare_start_values(
    weather_seeds: Iterable[int] = range(1, 101),
    strategies: Iterable[str] = STRATEGIES,
    demand_growth_cap: float = 2.0,
) -> SweepReport:
    seeds = tuple(weather_seeds)
    strategy_names = tuple(strategies)
    runs: list[SessionResult] = []
    for profile, start_values in (("current", DEFAULT_START_VALUES), ("challenge", CHALLENGE_START_VALUES)):
        for strategy in strategy_names:
            for seed in seeds:
                result = simulate_session(start_values, strategy, seed, demand_growth_cap)
                if result.start_profile != profile:
                    result = SessionResult(
                        start_profile=profile,
                        strategy=result.strategy,
                        weather_seed=result.weather_seed,
                        demand_growth_cap=result.demand_growth_cap,
                        initial_values=result.initial_values,
                        status=result.status,
                        loss_reason=result.loss_reason,
                        months_played=result.months_played,
                        final_budget=result.final_budget,
                        final_energy_autarky=result.final_energy_autarky,
                        final_citizen_satisfaction=result.final_citizen_satisfaction,
                        final_supply_security=result.final_supply_security,
                        final_score=result.final_score,
                        history=result.history,
                    )
                runs.append(result)

    summaries = {}
    for profile in ("current", "challenge"):
        for strategy in strategy_names:
            selected = tuple(run for run in runs if run.start_profile == profile and run.strategy == strategy)
            summaries[(profile, strategy)] = _summary(profile, strategy, selected)
    return SweepReport(runs=tuple(runs), summaries=summaries)


def sweep_demand_caps(
    growth_caps: Iterable[float] = (1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.6, 1.75, 2.0),
    weather_seeds: Iterable[int] = range(1, 101),
    strategies: Iterable[str] = STRATEGIES,
) -> dict[float, SweepReport]:
    return {
        float(growth_cap): compare_start_values(
            weather_seeds=weather_seeds,
            strategies=strategies,
            demand_growth_cap=float(growth_cap),
        )
        for growth_cap in growth_caps
    }


def _jsonable_report(report: SweepReport) -> dict:
    return {
        "runs": [asdict(run) for run in report.runs],
        "summaries": [asdict(summary) for summary in report.summaries.values()],
    }


def write_report(report: SweepReport, output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "start-value-sweep.json"
    csv_path = output_dir / "start-value-sweep.csv"
    json_path.write_text(json.dumps(_jsonable_report(report), indent=2), encoding="utf-8")

    fieldnames = [
        "start_profile", "strategy", "weather_seed", "status", "loss_reason", "months_played",
        "final_budget", "final_energy_autarky", "final_citizen_satisfaction",
        "final_supply_security", "final_score", "demand_growth_cap",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for run in report.runs:
            row = asdict(run)
            row.pop("initial_values")
            row.pop("history")
            writer.writerow(row)
    return json_path, csv_path


def write_growth_sweep(reports: dict[float, SweepReport], output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "demand-growth-sweep.json"
    csv_path = output_dir / "demand-growth-sweep.csv"
    summary_rows = [
        {"demand_growth_cap": growth_cap, **asdict(summary)}
        for growth_cap, report in reports.items()
        for summary in report.summaries.values()
    ]
    json_path.write_text(json.dumps(summary_rows, indent=2), encoding="utf-8")
    fieldnames = list(summary_rows[0]) if summary_rows else ["demand_growth_cap"]
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(summary_rows)
    return json_path, csv_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seeds", type=int, default=100, help="Number of deterministic weather seeds (default: 100).")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent / "results",
        help="Directory for CSV and JSON output.",
    )
    args = parser.parse_args()
    report = compare_start_values(weather_seeds=range(1, args.seeds + 1))
    json_path, csv_path = write_report(report, args.output_dir)
    growth_reports = sweep_demand_caps(weather_seeds=range(1, args.seeds + 1))
    growth_json_path, growth_csv_path = write_growth_sweep(growth_reports, args.output_dir)
    print(f"Wrote {len(report.runs)} runs")
    print(f"JSON: {json_path}")
    print(f"CSV:  {csv_path}")
    print(f"Growth sweep JSON: {growth_json_path}")
    print(f"Growth sweep CSV:  {growth_csv_path}")
    for summary in report.summaries.values():
        print(
            f"{summary.start_profile:9} {summary.strategy:14} "
            f"success={summary.completion_rate:.0%} "
            f"score={summary.average_score:.2f} "
            f"bankrupt={summary.bankrupt_sessions} "
            f"voted_out={summary.voted_out_sessions}"
        )


if __name__ == "__main__":
    main()
