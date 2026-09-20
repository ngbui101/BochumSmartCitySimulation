import { expect, test } from '@playwright/test';

const storageKey = 'bochum-smart-city:mvp1:v1';

test('persists a real game action, resets it, and restarts the endscreen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('main', { name: 'Bochum Smart City Simulation' })).toBeVisible();
  await expect(page.getByTestId('dev-mock-harness')).not.toBeVisible();
  await expect(page.getByTestId('month-display')).toContainText('Monat 1 / 60');

  await page.getByRole('button', { name: 'Nächster Monat' }).click();
  await expect(page.getByTestId('month-display')).toContainText('Monat 2 / 60');

  await page.reload();
  await expect(page.getByTestId('month-display')).toContainText('Monat 2 / 60');

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('laufende Spiel wirklich zurücksetzen');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Spiel zurücksetzen' }).click();
  await expect(page.getByTestId('month-display')).toContainText('Monat 1 / 60');

  await page.reload();
  await expect(page.getByTestId('month-display')).toContainText('Monat 1 / 60');

  await page.evaluate((key) => {
    const rawState = localStorage.getItem(key);
    if (!rawState) {
      throw new Error('Expected the reset state to be persisted before endscreen setup.');
    }

    const stored = JSON.parse(rawState) as {
      version: number;
      state: Record<string, unknown>;
    };
    stored.state.status = 'finished';
    stored.state.finalScore = {
      totalScore: 72,
      breakdown: {
        energyAutarky: 70,
        budgetEfficiency: 68,
        citizenSatisfaction: 75,
        supplySecurity: 74
      },
      qualitativeSummary: 'Browser smoke test'
    };
    localStorage.setItem(key, JSON.stringify(stored));
  }, storageKey);

  await page.reload();
  await expect(page.getByTestId('endscreen-overlay')).toBeVisible();
  await page.getByRole('button', { name: 'Neustart' }).click();
  await expect(page.getByTestId('endscreen-overlay')).not.toBeVisible();
  await expect(page.getByTestId('month-display')).toContainText('Monat 1 / 60');
});
