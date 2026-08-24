import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LocaleTabs from "./LocaleTabs";

const { mockUsePathname, mockUseSearchParams, mockRouterReplace } = vi.hoisted(
  () => ({
    mockUsePathname: vi.fn(),
    mockUseSearchParams: vi.fn(),
    mockRouterReplace: vi.fn(),
  })
);

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ replace: mockRouterReplace }),
}));

describe("LocaleTabs", () => {
  beforeEach(() => {
    mockUsePathname.mockReset().mockReturnValue("/en/admin/pages/home");
    mockUseSearchParams.mockReset().mockReturnValue(
      new URLSearchParams("tab=en")
    );
    mockRouterReplace.mockReset();
  });

  it("renders EN and ZH tabs with the ?tab= active state", () => {
    render(<LocaleTabs />);

    // tab= en → EN is selected
    const enTab = screen.getByLabelText("English");
    const zhTab = screen.getByLabelText("Chinese");
    expect(enTab.getAttribute("aria-selected")).toBe("true");
    expect(zhTab.getAttribute("aria-selected")).toBe("false");
  });

  it("uses router.replace to switch the tab search param", () => {
    render(<LocaleTabs />);
    screen.getByLabelText("Chinese").click();

    expect(mockRouterReplace).toHaveBeenCalledWith(
      "/en/admin/pages/home?tab=zh"
    );
  });

  it("does not switch when onBeforeChange returns false", () => {
    render(<LocaleTabs onBeforeChange={() => false} />);
    screen.getByLabelText("Chinese").click();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("defaults to EN when no ?tab param is present", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));
    render(<LocaleTabs />);
    expect(screen.getByLabelText("English").getAttribute("aria-selected")).toBe(
      "true"
    );
  });
});