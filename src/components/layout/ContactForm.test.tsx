import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
