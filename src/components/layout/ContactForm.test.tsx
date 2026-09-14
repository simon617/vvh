import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactForm from "./ContactForm";
import { renderWithLocale } from "@/test/utils";

describe("ContactForm", () => {
  it("renders the four fields and submit/reset buttons", () => {
    renderWithLocale(<ContactForm />);
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("shows validation messages on empty submit (English)", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Please Enter your Name")).toBeInTheDocument();
    expect(screen.getByText("Please Enter your Subject")).toBeInTheDocument();
    expect(screen.getByText("Please Enter your Email Address")).toBeInTheDocument();
    expect(screen.getByText("Please Enter your Message")).toBeInTheDocument();
  });

  it("shows validation messages on empty submit (Chinese)", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />, "zh");
    await user.click(screen.getByRole("button", { name: "遞交" }));
    expect(screen.getByText("請輸入姓名")).toBeInTheDocument();
    expect(screen.getByText("請輸入主旨")).toBeInTheDocument();
    expect(screen.getByText("請輸入電郵地址")).toBeInTheDocument();
    expect(screen.getByText("請輸入留言")).toBeInTheDocument();
  });

  it("clears errors as the user types", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Please Enter your Name")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Name/), "John");
    expect(screen.queryByText("Please Enter your Name")).not.toBeInTheDocument();
  });

  it("resets all fields on reset", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);
    await user.type(screen.getByLabelText(/^Name/), "John");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText(/^Name/)).toHaveValue("");
  });
});

describe("ContactForm submit wiring", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^Name/), "Ada Wong");
    await user.type(screen.getByLabelText(/^Subject/), "Website enquiry");
    await user.type(screen.getByLabelText(/^Email/), "ada@example.com");
    await user.type(screen.getByLabelText(/^Message/), "Please contact me.");
    await user.click(screen.getByRole("button", { name: "Submit" }));
  }

  it("POSTs the four fields to /api/contact/send and shows a success message", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);

    await fillAndSubmit(user);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact/send");
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      name: "Ada Wong",
      subject: "Website enquiry",
      email: "ada@example.com",
      message: "Please contact me.",
      company_website: "",
    });
    expect(
      screen.getByText(
        "Your message has been sent. We will get back to you as soon as possible."
      )
    ).toBeInTheDocument();
  });

  it("shows an error message when the API returns a failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: "Message could not be sent. Please try again later." }),
    });
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);

    await fillAndSubmit(user);

    expect(
      screen.getByText("Message could not be sent. Please try again later.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/has been sent/)).not.toBeInTheDocument();
  });

  it("shows an error message on a network failure", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);

    await fillAndSubmit(user);

    expect(
      screen.getByText("Message could not be sent. Please try again later.")
    ).toBeInTheDocument();
  });

  it("does NOT call the API when the honeypot field is filled", async () => {
    const user = userEvent.setup();
    renderWithLocale(<ContactForm />);

    const honeypot = document.querySelector('input[name="company_website"]');
    expect(honeypot).toBeTruthy();
    await user.type(honeypot as HTMLInputElement, "http://spam.example");

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Your message has been sent. We will get back to you as soon as possible."
      )
    ).toBeInTheDocument();
  });
});
