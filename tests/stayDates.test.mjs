import test from 'node:test';
import assert from 'node:assert/strict';
import { todayInNairobi, nextStayDate } from '../src/utils/stayDates.js';
test('Nairobi arrival dates respect local midnight', () => {
  assert.equal(todayInNairobi(new Date('2026-11-14T21:30:00Z')), '2026-11-15');
});
test('departure advances over month, leap-year and year boundaries', () => {
  assert.equal(nextStayDate('2028-02-28'), '2028-02-29');
  assert.equal(nextStayDate('2026-12-31'), '2027-01-01');
  assert.equal(nextStayDate('2026-04-30'), '2026-05-01');
});
test('missing dates do not produce a departure', () => {
  assert.equal(nextStayDate(''), '');
});
