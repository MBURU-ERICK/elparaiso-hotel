
const API_URL =
  (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').trim().replace(/\/+$/, '');

let csrfToken = null;
function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}

export async function staffRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = {
    ...(options.headers || {}),
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
  const token = csrfToken || getCookie("csrftoken");

  if (!token) {
    throw new Error(
      "CSRF token unavailable. Check the Django CSRF endpoint and cookie settings."
    );
  }

  headers["X-CSRFToken"] = token;
}

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail || (Object.keys(data).length ? Object.entries(data).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(' ') : String(errors)}`).join(' · ') : null);

    const message =
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  return data;
}

async function initializeCsrf() {
  const data = await staffRequest("/api/staff/csrf/");

  csrfToken = data.csrfToken || getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(
      "Could not obtain CSRF token from Django."
    );
  }

  return csrfToken;
}
export const staffApi = {
  // Authentication
  csrf: initializeCsrf,

  login: async (username, password) => {
    await initializeCsrf();

    const data = await staffRequest("/api/staff/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // Django rotates the CSRF secret after login.
    csrfToken = null;
    await initializeCsrf();

    return data;
  },

  me: () => staffRequest("/api/staff/me/"),

  logout: async () => {
    await initializeCsrf();

    const data = await staffRequest("/api/staff/logout/", {
      method: "POST",
    });

    csrfToken = null;
    return data;
  },

  // Dashboard
  dashboard: () =>
    staffRequest("/api/reservations/dashboard/"),

  // Reservation list
  reservations: (search = "", status = "") => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const query = params.toString();

    return staffRequest(
      `/api/staff/reservations/${query ? `?${query}` : ""}`
    );
  },

  // Room availability
  availableRooms: (id) =>
    staffRequest(
      `/api/staff/reservations/${id}/available-rooms/`
    ),

  // Confirm a reservation
  confirmReservation: async (id, roomId) => {
    await initializeCsrf();

    return staffRequest(
      `/api/staff/reservations/${id}/confirm/`,
      {
        method: "POST",
        body: JSON.stringify({
          room_id: Number(roomId),
        }),
      }
    );
  },

  // Check in, check out, or cancel
  reservationAction: async (id, action) => {
    const allowedActions = [
      "check-in",
      "check-out",
      "cancel",
    ];

    if (!allowedActions.includes(action)) {
      throw new Error("Invalid reservation action.");
    }

    await initializeCsrf();

    return staffRequest(
      `/api/staff/reservations/${id}/${action}/`,
      {
        method: "POST",
      }
    );
  },

  // Airbnb / short-stay management
  airbnbBookings: (status = "") => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);

    const query = params.toString();

    return staffRequest(
      `/api/shortstays/staff/bookings/${query ? `?${query}` : ""}`
    );
  },

  airbnbAction: async (id, action) => {
    const allowed = [
      "confirm",
      "cancel",
      "check-in",
      "check-out",
    ];

    if (!allowed.includes(action)) {
      throw new Error("Invalid Airbnb booking action.");
    }

    await initializeCsrf();

    return staffRequest(
      `/api/shortstays/staff/bookings/${id}/${action}/`,
      { method: "POST" }
    );
  },
  reconciliation: (facilityId) =>
  staffRequest(
    `/api/payments/facilities/${facilityId}/reconciliation/`
  ),

reconciliationRows: (facilityId, status = "pending") =>
  staffRequest(
    `/api/payments/facilities/${facilityId}/reconciliation/rows/?status=${encodeURIComponent(status)}`
  ),

reviewStatementRow: async (facilityId, rowId, decision, notes) => {
  await initializeCsrf();

  return staffRequest(
    `/api/payments/facilities/${facilityId}/reconciliation/rows/${rowId}/review/`,
    {
      method: "POST",
      body: JSON.stringify({ decision, notes }),
    }
  );
},

};
