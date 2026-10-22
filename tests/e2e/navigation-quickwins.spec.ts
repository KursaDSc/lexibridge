import { test, expect } from '@playwright/test';

test.describe('LexiBridge - Navigation & Aşama A Quick Wins', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    // Wait for app initialization
    await page.waitForFunction(() => window.__activeTab === 'dictionary');
  });

  test.describe('1. Navigation & Bottom Nav', () => {
    test('Sözlük sekmesi varsayılan aktif', async ({ page }) => {
      const dictView = page.locator('#viewDictionary');
      const practiceView = page.locator('#viewPractice');
      const favoritesView = page.locator('#viewFavorites');
      const settingsView = page.locator('#viewSettings');

      await expect(dictView).toBeVisible();
      await expect(practiceView).toBeHidden();
      await expect(favoritesView).toBeHidden();
      await expect(settingsView).toBeHidden();

      const activeTab = page.locator('#navTabDictionary');
      await expect(activeTab).toHaveClass(/active/);
    });

    test('Bottom nav - Pratik sekmesine geçiş', async ({ page }) => {
      await page.click('#navTabPractice');
      await expect(page.locator('#viewPractice')).toBeVisible();
      await expect(page.locator('#viewDictionary')).toBeHidden();
      // Flashcards should auto-init
      await expect(page.locator('#flashcardElement')).toBeVisible();
    });

    test('Bottom nav - Kelimelerim sekmesine geçiş', async ({ page }) => {
      await page.click('#navTabFavorites');
      await expect(page.locator('#viewFavorites')).toBeVisible();
      await expect(page.locator('#favoritesList')).toBeVisible();
    });

    test('Bottom nav - Ayarlar sekmesine geçiş', async ({ page }) => {
      await page.click('#navTabSettings');
      await expect(page.locator('#viewSettings')).toBeVisible();
      await expect(page.locator('#providerButtonGroup')).toBeVisible();
    });

    test('Sekme değiştirince scroll top\'a gider', async ({ page }) => {
      // Scroll down first
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.click('#navTabPractice');
      const scrollPos = await page.evaluate(() => window.scrollY);
      expect(scrollPos).toBe(0);
    });
  });

  test.describe('2. Dark Mode Contrast', () => {
    test.use({ colorScheme: 'dark' });

    test('Provider tabs metin okunabilir', async ({ page }) => {
      await page.click('#navTabSettings');
      const googleTab = page.locator('.provider-tab[data-provider="google"]');
      await expect(googleTab).toBeVisible();

      // Check computed styles - text should not be transparent/invisible
      const color = await googleTab.locator('.text-slate-800').first().evaluate(el => 
        getComputedStyle(el).color
      );
      // Should not be dark text on dark background
      expect(color).not.toBe('rgb(30, 41, 59)'); // slate-800 on dark bg
    });

    test('Seed chips contrast', async ({ page }) => {
      const seedChip = page.locator('.seed-chip').first();
      if (await seedChip.count() > 0) {
        await expect(seedChip).toBeVisible();
        const bg = await seedChip.evaluate(el => getComputedStyle(el).backgroundColor);
        const color = await seedChip.evaluate(el => getComputedStyle(el).color);
        // Both should be defined and not transparent
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
    });

    test('Topic chips contrast', async ({ page }) => {
      const topicChip = page.locator('.topic-chip').first();
      if (await topicChip.count() > 0) {
        await expect(topicChip).toBeVisible();
        const bg = await topicChip.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      }
    });

    test('History modal items contrast', async ({ page }) => {
      await page.click('#historyBtn');
      await expect(page.locator('#historyModal')).toBeVisible();
      const items = page.locator('.history-item');
      if (await items.count() > 0) {
        const color = await items.first().evaluate(el => getComputedStyle(el).color);
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
      await page.click('#closeHistoryBtn');
    });

    test('Autocomplete dropdown contrast', async ({ page }) => {
      await page.fill('#searchInput', 'ge');
      await page.waitForTimeout(100);
      const dropdown = page.locator('#autocompleteDropdown');
      if (await dropdown.isVisible()) {
        const bg = await dropdown.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      }
    });

    test('Favorites search input contrast', async ({ page }) => {
      await page.click('#navTabFavorites');
      const input = page.locator('#favSearchFilterInput');
      const bg = await input.evaluate(el => getComputedStyle(el).backgroundColor);
      const color = await input.evaluate(el => getComputedStyle(el).color);
      expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  test.describe('3. Flashcards Keyboard Shortcuts', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('#navTabPractice');
      await page.waitForSelector('#flashcardElement');
    });

    test('Space/Enter - kartı çevirir', async ({ page }) => {
      const card = page.locator('#flashcardElement');
      const inner = page.locator('#flashcardInner');

      // Initial state - not flipped
      await expect(inner).not.toHaveClass(/flipped/);

      await card.press('Space');
      await expect(inner).toHaveClass(/flipped/);

      await card.press('Enter');
      await expect(inner).not.toHaveClass(/flipped/);
    });

    test('ArrowRight - Biliyorum (sonraki kart)', async ({ page }) => {
      const counterBefore = await page.locator('#flashcardCounter').textContent();
      await page.keyboard.press('ArrowRight');
      const counterAfter = await page.locator('#flashcardCounter').textContent();
      expect(counterAfter).not.toBe(counterBefore);
    });

    test('ArrowLeft - Tekrar Lazım (sonraki kart)', async ({ page }) => {
      const counterBefore = await page.locator('#flashcardCounter').textContent();
      await page.keyboard.press('ArrowLeft');
      const counterAfter = await page.locator('#flashcardCounter').textContent();
      expect(counterAfter).not.toBe(counterBefore);
    });

    test('? tuşu - kısayol legendı açar/kapatır', async ({ page }) => {
      const legend = page.locator('#kbdLegend');
      await expect(legend).toBeHidden();

      await page.keyboard.press('?');
      await expect(legend).toBeVisible();

      await page.keyboard.press('?');
      await expect(legend).toBeHidden();

      // / tuşu da çalışmalı
      await page.keyboard.press('/');
      await expect(legend).toBeVisible();
    });

    test('Esc tuşu - sözlüğe döner', async ({ page }) => {
      await page.keyboard.press('Escape');
      await expect(page.locator('#viewDictionary')).toBeVisible();
      await expect(page.locator('#viewPractice')).toBeHidden();
    });

    test('Legend kapat butonu çalışır', async ({ page }) => {
      await page.keyboard.press('?');
      await expect(page.locator('#kbdLegend')).toBeVisible();
      await page.click('#kbdLegendClose');
      await expect(page.locator('#kbdLegend')).toBeHidden();
    });
  });

  test.describe('4. Reduced Motion', () => {
    test('prefers-reduced-motion: animasyonlar durur', async ({ page }) => {
      // Emulate reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const card = page.locator('#flashcardElement');
      await page.click('#navTabPractice');
      await page.waitForSelector('#flashcardElement');

      // Check transition duration is near zero
      const transitionDuration = await page.locator('#flashcardInner').evaluate(el => 
        getComputedStyle(el).transitionDuration
      );
      // Should be 0.01ms or 0s
      expect(['0s', '0.01ms']).toContain(transitionDuration);
    });

    test('Quick peek sheet transition disabled', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const sheet = page.locator('#quickPeekSheet');
      const transition = await sheet.evaluate(el => getComputedStyle(el).transitionDuration);
      expect(['0s', '0.01ms']).toContain(transition);
    });
  });

  test.describe('5. High Contrast Mode', () => {
    test('prefers-contrast: high - focus outline 3px', async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' }); // Simulates high contrast
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const btn = page.locator('#searchBtn');
      await btn.focus();
      const outline = await btn.evaluate(el => getComputedStyle(el).outlineWidth);
      // Should be 3px or more
      const px = parseInt(outline);
      expect(px).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('6. ARIA Live Regions', () => {
    test('resultsContainer aria-live=polite', async ({ page }) => {
      const container = page.locator('#resultsContainer');
      await expect(container).toHaveAttribute('aria-live', 'polite');
    });
  });

  test.describe('7. Haptic Feedback (Vibration API)', () => {
    test('Seed chip tıklandığında vibrate çağrılır', async ({ page }) => {
      // Mock navigator.vibrate
      await page.addInitScript(() => {
        window.vibrateCalls = [];
        navigator.vibrate = (pattern) => {
          window.vibrateCalls.push(pattern);
          return true;
        };
      });

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const seedChip = page.locator('.seed-chip').first();
      if (await seedChip.count() > 0) {
        await seedChip.click();
        const calls = await page.evaluate(() => window.vibrateCalls);
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0]).toBe(10);
      }
    });

    test('Topic chip tıklandığında vibrate çağrılır', async ({ page }) => {
      await page.addInitScript(() => {
        window.vibrateCalls = [];
        navigator.vibrate = (pattern) => {
          window.vibrateCalls.push(pattern);
          return true;
        };
      });

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const topicChip = page.locator('.topic-chip').first();
      if (await topicChip.count() > 0) {
        await topicChip.click();
        const calls = await page.evaluate(() => window.vibrateCalls);
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0]).toBe(10);
      }
    });
  });

  test.describe('8. Keyboard Navigation (Tab Order)', () => {
    test('Bottom nav tab ile erişilebilir', async ({ page }) => {
      await page.keyboard.press('Tab');
      // Should focus first focusable element (search input or header buttons)
      const focused = await page.evaluate(() => document.activeElement?.id);
      expect(focused).toBeTruthy();
    });

    test('Search input odaklanabilir', async ({ page }) => {
      await page.click('#searchInput');
      await expect(page.locator('#searchInput')).toBeFocused();
    });
  });
});