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

import { validateStaySearch } from '../src/utils/reservationValidation.js';
import { estimateBooking } from '../src/utils/bookingQuote.js';
const search = { start_date: '2027-01-02', end_date: '2027-01-04', guests: '2', children: '0', requested_rooms: '1' };
test('reservation search rejects reversed, same-day, past and invalid calendar dates', () => {
  assert.deepEqual(validateStaySearch(search, '2027-01-01'), {});
  for (const end_date of ['2027-01-01', '2027-01-02', 'not-a-date', '2027-02-30']) assert.ok(validateStaySearch({ ...search, end_date }, '2027-01-01').end_date);
  assert.ok(validateStaySearch(search, '2027-01-03').start_date);
  assert.ok(validateStaySearch({ ...search, start_date: '2027-02-30' }, '2027-01-01').start_date);
});
test('reservation search rejects invalid guest and preferred-room counts', () => {
  for (const guests of ['0','-1','1.5','101','no']) assert.ok(validateStaySearch({ ...search, guests }, '2027-01-01').guests);
  for (const children of ['','-1','1.5']) assert.ok(validateStaySearch({ ...search, children }, '2027-01-01').children);
  assert.ok(validateStaySearch({ ...search, requested_rooms: '0' }, '2027-01-01').requested_rooms);
});
test('private-stay estimates do not treat missing, zero or invalid prices as a free stay', () => {
  const form = { service: 'airbnb', guests: '2', occupancy: '2', unit: '1', facility: '1', start_date: '2027-01-02', end_date: '2027-01-04' };
  for (const nightly_rate of [null, '0', 'NaN', '-10', 'Infinity']) assert.equal(estimateBooking(form, { units: [{ id: 1, facility: 1, max_guests: 2, nightly_rate }] }), null);
  const quote = estimateBooking(form, { units: [{ id: 1, facility: 1, max_guests: 2, name: 'API fixture', nightly_rate: '1200' }] });
  assert.equal(quote.total, '2400.00');
});

import { validateGuestDetails } from '../src/utils/reservationValidation.js';
test('guest details reject blank names, invalid emails and invalid phone numbers', () => {
  const guest = { first: 'Guest', last: 'Test', email: 'guest@example.test', phone: '+254 708 231 994', company: '' };
  assert.deepEqual(validateGuestDetails(guest), {});
  assert.ok(validateGuestDetails({ ...guest, first: ' ' }).first);
  assert.ok(validateGuestDetails({ ...guest, email: 'invalid' }).email);
  for (const phone of ['+254', 'not-a-number', '+254+708231994']) assert.ok(validateGuestDetails({ ...guest, phone }).phone);
  assert.ok(validateGuestDetails(guest, true).company);
});
