import unittest

from start_value_sweep import (
    CHALLENGE_START_VALUES,
    DEFAULT_START_VALUES,
    compare_start_values,
    demand_for_month,
    city_revenue_for_public_supply,
    private_asset_capacity,
    sweep_demand_caps,
    zone_congestion_penalty,
    simulate_session,
)


class StartValueSweepTests(unittest.TestCase):
    def test_start_profiles_match_the_current_and_challenge_values(self):
        self.assertEqual(DEFAULT_START_VALUES.budget, 18_000_000)
        self.assertEqual(DEFAULT_START_VALUES.energy_autarky, 18)
        self.assertEqual(DEFAULT_START_VALUES.citizen_satisfaction, 72)
        self.assertEqual(DEFAULT_START_VALUES.supply_security, 58)

        self.assertEqual(CHALLENGE_START_VALUES.energy_autarky, 0)
        self.assertEqual(CHALLENGE_START_VALUES.citizen_satisfaction, 50)
        self.assertEqual(CHALLENGE_START_VALUES.supply_security, 0)

    def test_simulation_keeps_initial_values_and_monthly_history(self):
        result = simulate_session(DEFAULT_START_VALUES, "solar_first", weather_seed=1)

        self.assertEqual(result.initial_values, DEFAULT_START_VALUES)
        self.assertGreaterEqual(result.months_played, 1)
        self.assertLessEqual(result.months_played, 60)
        self.assertEqual(result.history[0].month_index, 1)
        self.assertIn(result.status, {"finished", "lost"})

    def test_comparison_returns_one_summary_per_profile_and_strategy(self):
        report = compare_start_values(
            weather_seeds=[1, 2],
            strategies=["solar_first", "wind_first"],
        )

        self.assertEqual(len(report.runs), 8)
        self.assertEqual(
            set(report.summaries),
            {
                ("current", "solar_first"),
                ("current", "wind_first"),
                ("challenge", "solar_first"),
                ("challenge", "wind_first"),
            },
        )
        self.assertTrue(all(0 <= summary.completion_rate <= 1 for summary in report.summaries.values()))

    def test_demand_reaches_double_at_the_end_of_the_game(self):
        self.assertEqual(demand_for_month(0, 95), 95)
        self.assertEqual(demand_for_month(59, 95), 190)
        self.assertEqual(demand_for_month(59, 95, growth_cap=1.5), 143)

    def test_demand_cap_sweep_returns_a_report_for_each_cap(self):
        reports = sweep_demand_caps(
            growth_caps=[1.5, 2.0],
            weather_seeds=[1],
            strategies=["solar_first"],
        )

        self.assertEqual(set(reports), {1.5, 2.0})
        self.assertEqual(len(reports[1.5].runs), 2)
        self.assertEqual(len(reports[2.0].runs), 2)

    def test_zone_penalty_starts_with_the_third_public_asset(self):
        self.assertEqual(zone_congestion_penalty(2), 0)
        self.assertEqual(zone_congestion_penalty(3), 1)
        self.assertEqual(zone_congestion_penalty(5), 3)

    def test_private_assets_match_the_equivalent_public_asset_capacity(self):
        self.assertEqual(private_asset_capacity("solar", 1), 7)
        self.assertEqual(private_asset_capacity("storage", 1), 10)
        self.assertEqual(private_asset_capacity("solar", 3), 21)

    def test_private_supply_does_not_create_city_revenue(self):
        self.assertEqual(city_revenue_for_public_supply(private_supply=0, demand=100), 3_800_000)
        self.assertEqual(city_revenue_for_public_supply(private_supply=40, demand=100), 2_280_000)
        self.assertEqual(city_revenue_for_public_supply(private_supply=120, demand=100), 0)


if __name__ == "__main__":
    unittest.main()
