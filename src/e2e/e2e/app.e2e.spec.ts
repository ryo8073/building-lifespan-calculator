import { test, expect } from '@playwright/test';

test.describe('建物耐用年数 判定・計算アプリ', () => {
  test('トップページが正しく表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /建物耐用年数 判定・計算アプリ/ })).toBeVisible();
    await expect(page.getByRole('form', { name: /法定耐用年数検索/ })).toBeVisible();
    await expect(page.getByRole('form', { name: /中古資産耐用年数計算/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /計算/ })).toBeVisible();
  });
}); 