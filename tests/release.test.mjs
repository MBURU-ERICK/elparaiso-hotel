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
