import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackForm from "../src/FeedbackForm.jsx";

afterEach(cleanup);

describe("FeedbackForm", () => {
  it("shows no errors initially", () => {
    render(<FeedbackForm />);
    expect(screen.queryByTestId("name-error")).toBeNull();
    expect(screen.queryByTestId("email-error")).toBeNull();
    expect(screen.queryByTestId("rating-error")).toBeNull();
  });

  it("shows all errors on empty submit", async () => {
    render(<FeedbackForm />);
    await userEvent.click(screen.getByTestId("submit-btn"));
    expect(screen.getByTestId("name-error")).toBeTruthy();
    expect(screen.getByTestId("email-error")).toBeTruthy();
    expect(screen.getByTestId("rating-error")).toBeTruthy();
    expect(screen.queryByTestId("success-msg")).toBeNull();
  });

  it("only shows errors for invalid fields", async () => {
    render(<FeedbackForm />);
    await userEvent.type(screen.getByTestId("name-input"), "Aman");
    await userEvent.type(screen.getByTestId("email-input"), "not-an-email");
    await userEvent.selectOptions(screen.getByTestId("rating-select"), "4");
    await userEvent.click(screen.getByTestId("submit-btn"));
    expect(screen.queryByTestId("name-error")).toBeNull();
    expect(screen.getByTestId("email-error")).toBeTruthy();
    expect(screen.queryByTestId("rating-error")).toBeNull();
  });

  it("submits successfully with thank-you message", async () => {
    render(<FeedbackForm />);
    await userEvent.type(screen.getByTestId("name-input"), "Aman");
    await userEvent.type(screen.getByTestId("email-input"), "aman@example.com");
    await userEvent.selectOptions(screen.getByTestId("rating-select"), "5");
    await userEvent.click(screen.getByTestId("submit-btn"));
    expect(screen.getByTestId("success-msg").textContent).toBe(
      "Thank you, Aman! Feedback submitted."
    );
  });

  it("limits comment to 200 characters and shows counter", async () => {
    render(<FeedbackForm />);
    const box = screen.getByTestId("comment-input");
    await userEvent.type(box, "a".repeat(10));
    expect(screen.getByTestId("comment-count").textContent).toBe("10/200");
    expect(box.getAttribute("maxlength")).toBe("200");
  });

  it("rejects an over-long comment", async () => {
    render(<FeedbackForm />);
    await userEvent.type(screen.getByTestId("name-input"), "Aman");
    await userEvent.type(screen.getByTestId("email-input"), "aman@example.com");
    await userEvent.selectOptions(screen.getByTestId("rating-select"), "3");
    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "x".repeat(201) } });
    await userEvent.click(screen.getByTestId("submit-btn"));
    expect(screen.getByTestId("comment-error")).toBeTruthy();
    expect(screen.queryByTestId("success-msg")).toBeNull();
  });
});
