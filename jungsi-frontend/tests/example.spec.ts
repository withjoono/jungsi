import { test, expect } from '@playwright/test';

test('메인 페이지 로드', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/거북스쿨|GeobukSchool/i);
});

test('페이지가 정상적으로 렌더링됨', async ({ page }) => {
  await page.goto('/');
  // 페이지가 로드되었는지 확인
  await expect(page.locator('body')).toBeVisible();
});
