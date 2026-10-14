import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi } from "vitest";
import eventsReducer from "../features/events/eventsSlice";
import authReducer from "../features/auth/authSlice";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({ data: { items: [], page: 1, totalPages: 1, total: 0 } })
    ),
  },
}));

import EventList from "../pages/EventList";

describe("EventList", () => {
  it("renders events already present in the Redux store", () => {
    const preloadedState = {
      auth: { user: { role: "STUDENT" }, accessToken: "fake-token", status: "idle", error: null },
      events: {
        items: [
          { _id: "1", title: "Tech Fest", date: "2026-11-05" },
          { _id: "2", title: "Cultural Night", date: "2026-11-10" },
        ],
        page: 1,
        totalPages: 1,
        search: "",
        status: "succeeded",
        unreadAnnouncements: 0,
      },
    };
    const store = configureStore({
      reducer: { auth: authReducer, events: eventsReducer },
      preloadedState,
    });
    render(
      <Provider store={store}>
        <EventList />
      </Provider>
    );
    expect(screen.getByText(/Tech Fest/)).toBeInTheDocument();
    expect(screen.getByText(/Cultural Night/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /rsvp/i })).toHaveLength(2);
  });
});
