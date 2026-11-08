import { customerRequest } from "../customer/customerApi";

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').trim().replace(/\/+$/, '');

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      JSON.stringify(data)
    );
  }

  return data;
}

export function getRoomTypes() {
  return apiRequest("/api/rooms/types/");
}

export function checkAvailability(checkIn, checkOut) {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
  });

  return apiRequest(
    `/api/rooms/availability/?${params.toString()}`
  );
}

export function createReservation(reservation) {
  return customerRequest("/api/reservations/", {
    method: "POST",
    body: JSON.stringify(reservation),
  });
}
