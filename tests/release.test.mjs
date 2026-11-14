import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProductionApiOrigin } from '../scripts/release-config.mjs';

test('production API configuration accepts the real HTTPS origin', () => {
  assert.equal(validateProductionApiOrigin(' https://api.elparaisohotelltd.com/ '), 'https://api.elparaisohotelltd.com');
});
test('missing or development API settings cannot silently ship to production', () => {
  for (const value of ['', undefined, 'http://127.0.0.1:8000', 'https://localhost', '/api', 'https://user:password@api.example.test', 'https://api.example.test/api', 'https://api.example.test?key=secret', 'https://api.example.test#hash']) {
    assert.throws(() => validateProductionApiOrigin(value), value);
  }
});

const { analyticsPath, allowsAnalytics } = await import('../src/analytics/privacy.js');
test('analytics excludes private routes and only records normalized public paths', () => {
  assert.equal(analyticsPath('/staff/admin'), null);
  assert.equal(analyticsPath('/account/profile'), null);
  assert.equal(analyticsPath('/review'), null);
  assert.equal(analyticsPath('/booking?email=private@example.test'), null);
  assert.equal(analyticsPath('/airbnb/'), '/private-stays');
  assert.equal(analyticsPath('/booking'), '/booking');
});
test('analytics respects browser privacy preferences without visitor identifiers', () => {
  assert.equal(allowsAnalytics({ navigator: { doNotTrack: '1' } }), false);
  assert.equal(allowsAnalytics({ navigator: { globalPrivacyControl: true } }), false);
  assert.equal(allowsAnalytics({ navigator: {} }), true);
});
