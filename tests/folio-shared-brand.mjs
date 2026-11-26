import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const get = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('portfolio navigation uses the shared brand and not homepage-only overrides', () => {
  assert.match(get('components/alternative-navigation.tsx'), /alt-navigation folio-nav/);
  assert.match(get('components/portfolio-navigation.css'), /\.folio-nav\s*\{[^}]*position:\s*sticky/s);
  assert.doesNotMatch(get('app/folio-home.css'), /\.alt-navigation/);
  assert.match(get('components/alternative-navigation.tsx'), /aria-controls="folio-mobile-nav"/);
  assert.match(get('components/alternative-navigation.tsx'), /href="\/resume\.pdf"/);
});
test('shared footer and palette stay local to portfolio-specific elements', () => {
  assert.match(get('components/ui.tsx'), /folio-footer/);
  assert.match(get('app/globals.css'), /--folio-navy:\s*#1c1b37/);
  assert.match(get('app/globals.css'), /--folio-link:\s*#006763/);
});
