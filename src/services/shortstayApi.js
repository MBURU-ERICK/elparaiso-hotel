
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail ?? data;
    const message =
      typeof detail === "string"
        ? detail
        : JSON.stringify(detail);

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const shortstayApi = {
  properties: () =>
    request("/api/shortstays/properties/"),

  units: () =>
    request("/api/shortstays/units/"),

  availability: (unitId, checkIn, checkOut) => {
    const params = new URLSearchParams({
      unit_id: String(unitId),
      check_in: checkIn,
      check_out: checkOut,
    });

    return request(
      `/api/shortstays/availability/?${params}`
    );
  },

  createBooking: (payload) =>
    request("/api/shortstays/bookings/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
