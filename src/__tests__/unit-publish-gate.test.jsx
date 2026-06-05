import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublishButton from "../components/dashboard/PublishButton";

function renderBtn(props = {}) {
  const defaults = { projectId: "p1", isPublished: false, slug: "my-site", onPublish: vi.fn() };
  return render(<MemoryRouter><PublishButton {...defaults} {...props} /></MemoryRouter>);
}

describe("PublishButton", () => {
  it("renders 'Publish' for drafts", () => {
    renderBtn();
    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
  });

  it("renders 'Update Site' when published", () => {
    renderBtn({ isPublished: true });
    expect(screen.getByRole("button", { name: /update site/i })).toBeInTheDocument();
  });

  it("shows subscription modal on no_subscription", async () => {
    const onPublish = vi.fn().mockResolvedValue({ success: false, reason: "no_subscription" });
    renderBtn({ onPublish });
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => {
      expect(screen.getByText("Subscription Required")).toBeInTheDocument();
    });
    expect(screen.getByText("View Plans")).toHaveAttribute("href", "/dashboard/billing");
  });

  it("shows confirmation with URL on success", async () => {
    const onPublish = vi.fn().mockResolvedValue({ success: true, url: "https://sites.adversesolutions.com/my-site" });
    renderBtn({ onPublish });
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => {
      expect(screen.getByText("Site Published!")).toBeInTheDocument();
    });
    expect(screen.getByText("https://sites.adversesolutions.com/my-site")).toBeInTheDocument();
  });
});
