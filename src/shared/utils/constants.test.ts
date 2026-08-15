import { describe, expect, it } from 'vitest';
import { CATEGORY_THEMES, DEFAULT_THEME, DRUG_CATEGORIES } from './constants';

describe('CATEGORY_THEMES and DEFAULT_THEME semantic mapping', () => {
  it('defines themes for all drug categories in DRUG_CATEGORIES', () => {
    const categoryNames = Object.keys(DRUG_CATEGORIES);
    for (const cat of categoryNames) {
      expect(CATEGORY_THEMES[cat]).toBeDefined();
      const theme = CATEGORY_THEMES[cat];
      expect(theme.activeBg).toMatch(/^bg-category-/);
      expect(theme.activeRing).toMatch(/^ring-category-/);
      expect(theme.headerText).toMatch(/^text-category-/);
      expect(theme.headerBorder).toMatch(/^border-category-/);
      expect(theme.btnSelected).toMatch(/bg-category-/);
      expect(theme.btnHover).toMatch(/hover:border-category-/);
      expect(theme.pulse).toMatch(/^bg-category-/);
      expect(theme.rowBorder).toMatch(/^border-l-category-/);
      expect(theme.actionText).toMatch(/^text-category-/);
    }
  });

  it('defines DEFAULT_THEME with semantic default category classes', () => {
    expect(DEFAULT_THEME.activeBg).toBe('bg-category-default-bg');
    expect(DEFAULT_THEME.activeRing).toBe('ring-category-default-ring');
    expect(DEFAULT_THEME.headerText).toBe('text-category-default-text');
    expect(DEFAULT_THEME.headerBorder).toBe('border-category-default-border');
    expect(DEFAULT_THEME.pulse).toBe('bg-category-default-pulse');
    expect(DEFAULT_THEME.rowBorder).toBe('border-l-category-default-solid');
    expect(DEFAULT_THEME.actionText).toBe('text-category-default-action');
  });

  it('maintains expected category theme structure and tokens for each category', () => {
    const muscleRelaxants = CATEGORY_THEMES['Muscle Relaxants'];
    expect(muscleRelaxants.activeBg).toBe('bg-category-muscle-relaxants-bg');
    expect(muscleRelaxants.activeRing).toBe('ring-category-muscle-relaxants-ring');
    expect(muscleRelaxants.headerText).toBe('text-category-muscle-relaxants-text');

    const penicillins = CATEGORY_THEMES['Penicillins'];
    expect(penicillins.activeBg).toBe('bg-category-penicillins-bg');
    expect(penicillins.activeRing).toBe('ring-category-penicillins-ring');

    const cephalosporins = CATEGORY_THEMES['Cephalosporins'];
    expect(cephalosporins.activeBg).toBe('bg-category-cephalosporins-bg');
    expect(cephalosporins.activeRing).toBe('ring-category-cephalosporins-ring');
  });

  it('ensures each drug category maps to unique distinct theme token classes', () => {
    const categoryNames = Object.keys(DRUG_CATEGORIES);
    const activeBgs = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].activeBg));
    const activeRings = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].activeRing));
    const headerTexts = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].headerText));
    const headerBorders = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].headerBorder));
    const btnSelecteds = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].btnSelected));
    const pulses = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].pulse));
    const rowBorders = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].rowBorder));
    const actionTexts = new Set(categoryNames.map(cat => CATEGORY_THEMES[cat].actionText));

    expect(activeBgs.size).toBe(categoryNames.length);
    expect(activeRings.size).toBe(categoryNames.length);
    expect(headerTexts.size).toBe(categoryNames.length);
    expect(headerBorders.size).toBe(categoryNames.length);
    expect(btnSelecteds.size).toBe(categoryNames.length);
    expect(pulses.size).toBe(categoryNames.length);
    expect(rowBorders.size).toBe(categoryNames.length);
    expect(actionTexts.size).toBe(categoryNames.length);
  });

  it('ensures index.css defines distinct category token values across all 10 drug categories in both light and dark themes', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const cssPath = path.resolve(process.cwd(), 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    const categorySlugs = [
      'muscle-relaxants',
      'penicillins',
      'cephalosporins',
      'hypnotics',
      'local-anaesthetics',
      'opioids',
      'antiseptics',
      'others',
      'reversal-agents',
      'proton-pump-inhibitors',
    ];

    const [lightSection, darkSection] = cssContent.split('.dark {');
    expect(lightSection).toBeDefined();
    expect(darkSection).toBeDefined();

    const lightSolidTokens = categorySlugs.map(slug => {
      const match = lightSection.match(new RegExp(`--cat-${slug}-solid:\\s*([^;]+);`));
      expect(match, `missing light --cat-${slug}-solid in index.css`).not.toBeNull();
      return match![1].trim();
    });
    expect(new Set(lightSolidTokens).size).toBe(categorySlugs.length);

    const darkSolidTokens = categorySlugs.map(slug => {
      const match = darkSection.match(new RegExp(`--cat-${slug}-solid:\\s*([^;]+);`));
      expect(match, `missing dark --cat-${slug}-solid in index.css`).not.toBeNull();
      return match![1].trim();
    });
    expect(new Set(darkSolidTokens).size).toBe(categorySlugs.length);
  });
});
