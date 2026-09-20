import csv
import tempfile
import unittest
from pathlib import Path

from plot_sweep import plot_success_rate_sweep


class PlotSweepTests(unittest.TestCase):
    def test_plot_writes_a_png_from_growth_sweep_csv(self):
        with tempfile.TemporaryDirectory() as directory:
            csv_path = Path(directory) / "growth.csv"
            output_path = Path(directory) / "growth.png"
            with csv_path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=["demand_growth_cap", "start_profile", "strategy", "completion_rate"],
                )
                writer.writeheader()
                writer.writerow({"demand_growth_cap": 1.35, "start_profile": "challenge", "strategy": "solar_first", "completion_rate": 0.57})
                writer.writerow({"demand_growth_cap": 1.35, "start_profile": "challenge", "strategy": "wind_first", "completion_rate": 0.64})

            plot_success_rate_sweep(csv_path, output_path, start_profile="challenge")

            self.assertTrue(output_path.exists())
            self.assertGreater(output_path.stat().st_size, 0)


if __name__ == "__main__":
    unittest.main()
