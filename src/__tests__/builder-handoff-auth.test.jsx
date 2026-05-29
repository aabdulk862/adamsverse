import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HandoffButton from "../components/builder/HandoffButton";

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Clerk — authenticated user
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isSignedIn: true, userId: "user_2abc123" }),
}));

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

const mockSupabase = {
  from: vi.fn(() => ({
    insert: mockInsert,
  })),
};

// Mock useSupabaseClient
vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => mockSupabase,
}));

describe("HandoffButton — Authenticated Flow", () => {
  const mockConfig = {
    slug: "restaurant",
    name: "Restaurant",
    category: "Food & Hospitality",
    sections: { hero: { headline: "Test" } },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: { id: "proj_123" }, error: null });
  });

  it("renders 'Save & Go to Dashboard' button when signed in", () => {
    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    expect(screen.getByLabelText("Save & Go to Dashboard")).toBeInTheDocument();
  });

  it("creates project in Supabase and navigates to dashboard on click", async () => {
    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    fireEvent.click(screen.getByLabelText("Save & Go to Dashboard"));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockInsert).toHaveBeenCalledWith({
        client_id: "user_2abc123",
        name: "Restaurant",
        service_tier: "Food & Hospitality",
        intake_data: mockConfig,
        status: "active",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/projects/proj_123");
    });
  });

  it("shows error message when Supabase save fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "RLS policy violation" },
    });

    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    fireEvent.click(screen.getByLabelText("Save & Go to Dashboard"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not save project"
      );
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows loading state while saving", async () => {
    // Make the promise hang
    mockSingle.mockReturnValue(new Promise(() => {}));

    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    fireEvent.click(screen.getByLabelText("Save & Go to Dashboard"));

    await waitFor(() => {
      expect(screen.getByText("Saving…")).toBeInTheDocument();
    });
  });
});
