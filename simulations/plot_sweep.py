"""Plot strategy completion rates across demand-growth sweep values."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


STRATEGY_LABELS = {
    "solar_first": "Solar zuerst",
    "wind_first": "Wind zuerst",
    "balanced": "Ausgewogener Mix",
    "storage_first": "Speicher zuerst",
    "subsidy_first": "Förderung zuerst",
    "adaptive": "Adaptiv",
}

STRATEGY_COLORS = {
    "solar_first": "#d88916",
    "wind_first": "#4c83c3",
    "balanced": "#2f7a55",
    "storage_first": "#8c5aa8",
    "subsidy_first": "#c65b62",
    "adaptive": "#4f6d7a",
}

TABLE_GROWTH_CAPS = (1.35, 1.4, 1.45, 1.5, 1.6, 1.75, 2.0)


def plot_success_rate_sweep(
    csv_path: Path,
    output_path: Path,
    *,
    start_profile: str = "challenge",
) -> Path:
    rows = []
    with csv_path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            if row["start_profile"] == start_profile:
                rows.append(row)

    if not rows:
        raise ValueError(f"No sweep rows found for start profile: {start_profile}")

    growth_caps = sorted({float(row["demand_growth_cap"]) for row in rows})
    strategies = [strategy for strategy in STRATEGY_LABELS if any(row["strategy"] == strategy for row in rows)]

    figure, (axis, table_axis) = plt.subplots(
        2,
        1,
        figsize=(12, 8.8),
        dpi=160,
        gridspec_kw={"height_ratios": (4.2, 1.6), "hspace": 0.28},
    )
    for strategy in strategies:
        values = {
            float(row["demand_growth_cap"]): float(row["completion_rate"]) * 100
            for row in rows
            if row["strategy"] == strategy
        }
        axis.plot(
            [cap * 100 for cap in growth_caps],
            [values[cap] for cap in growth_caps],
            marker="o",
            linewidth=2,
            markersize=5,
            label=STRATEGY_LABELS[strategy],
            color=STRATEGY_COLORS[strategy],
        )

    axis.axvline(135, color="#bd6e22", linestyle="--", linewidth=1.8, label="Produktions-Sweet-Spot: 135 %")
    axis.axvspan(135, 200, color="#bd6e22", alpha=0.08, label="Prüfbereich 135–200 %")
    axis.set_title("Erfolgsquote nach Verbrauchswachstum und Strategie")
    axis.set_xlabel("Verbrauch am Spielende (% des Startverbrauchs)")
    axis.set_ylabel("Erfolgsquote (%)")
    axis.set_xlim(min(growth_caps) * 100 - 1, max(growth_caps) * 100 + 1)
    axis.set_ylim(0, 100)
    axis.set_xticks([cap * 100 for cap in growth_caps])
    axis.grid(axis="y", alpha=0.25)
    axis.legend(loc="upper right", frameon=True)

    table_rows = []
    for strategy in strategies:
        values = {
            float(row["demand_growth_cap"]): float(row["completion_rate"]) * 100
            for row in rows
            if row["strategy"] == strategy
        }
        table_rows.append(
            [
                STRATEGY_LABELS[strategy],
                *[f"{values.get(cap, 0):.0f} %" for cap in TABLE_GROWTH_CAPS],
            ]
        )

    table_axis.axis("off")
    table_axis.set_title(
        "Alle Strategien – Erfolgsquote im markierten Bereich",
        loc="left",
        fontsize=11,
        pad=8,
    )
    table = table_axis.table(
        cellText=table_rows,
        colLabels=["Strategie", *[f"{cap * 100:.0f} %" for cap in TABLE_GROWTH_CAPS]],
        cellLoc="center",
        colLoc="center",
        loc="center",
        colWidths=[0.22, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11],
    )
    table.auto_set_font_size(False)
    table.set_fontsize(8.5)
    table.scale(1, 1.45)
    for row_index, strategy in enumerate(strategies, start=1):
        label_cell = table[row_index, 0]
        label_cell.get_text().set_color(STRATEGY_COLORS[strategy])
        label_cell.get_text().set_weight("bold")

    figure.text(
        0.01,
        0.01,
        "Challenge-Startwerte: Autarkie 0 · Bürgerzufriedenheit 50 · Versorgungssicherheit 0",
        fontsize=9,
        color="#5f6b73",
    )
    figure.subplots_adjust(left=0.08, right=0.98, top=0.95, bottom=0.08, hspace=0.28)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    figure.savefig(output_path, bbox_inches="tight")
    plt.close(figure)
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--csv",
        type=Path,
        default=Path(__file__).parent / "results" / "demand-growth-sweep.csv",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).parent / "results" / "demand-growth-sweep-challenge.png",
    )
    parser.add_argument("--profile", default="challenge")
    args = parser.parse_args()
    result = plot_success_rate_sweep(args.csv, args.output, start_profile=args.profile)
    print(f"Plot: {result}")


if __name__ == "__main__":
    main()
