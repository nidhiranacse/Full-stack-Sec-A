import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import authReducer from "../features/auth/authSlice";
import eventsReducer from "../features/events/eventsSlice";

vi.mock("../api/axios", () => ({
  default: {
    post: vi.fn(() =>
      Promise.reject({ response: { data: { error: "Invalid email or password" } } })
    ),
  },
}));
vi.mock("../socket", () => ({ connectSocket: vi.fn() }));

import Login from "../pages/Login";

function renderWithStore(ui) {
  const store = configureStore({ reducer: { auth: authReducer, events: eventsReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
}

describe("Login form", () => {
  it("renders email and password fields", () => {
    renderWithStore(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows an error message when login fails", async () => {
    renderWithStore(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@campus.edu" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/invalid email or password/i);
    });
  });
});
