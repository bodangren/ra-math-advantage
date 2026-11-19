import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LessonChatbot } from "@/components/student/LessonChatbot";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LessonChatbot", () => {
  const defaultProps = {
    lessonId: "lesson-1-1",
    phaseNumber: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the chat button in closed state", () => {
    render(<LessonChatbot {...defaultProps} />);

    const button = screen.getByRole("button", { name: /open lesson help/i });
    expect(button).toBeInTheDocument();
  });

  it("opens chat when clicking the chat button", () => {
    render(<LessonChatbot {...defaultProps} />);

    const button = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(button);

    expect(screen.getByPlaceholderText(/ask a question about this lesson/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("closes chat when clicking the close button", async () => {
    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const closeButton = screen.getByRole("button", { name: /close lesson help/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/ask a question/i)).not.toBeInTheDocument();
    });
  });

  it("shows loading state while waiting for response", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is a quadratic function?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    mockFetch.mockRestore();
  });

  it("displays response when API returns successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "A quadratic function is of the form f(x) = ax² + bx + c" }),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is a quadratic function?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/a quadratic function is of the form/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /ask another question/i })).toBeInTheDocument();
  });

  it("displays error message when API returns error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Not enrolled in a class that has access to this lesson" }),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is a quadratic function?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText(/not enrolled in a class that has access to this lesson/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("displays generic error when response has no error message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is a quadratic function?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it("resets and opens chat when clicking Ask Another Question", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "A quadratic function answer" }),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is a quadratic function?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /ask another question/i })).toBeInTheDocument();
    });

    const askAnotherButton = screen.getByRole("button", { name: /ask another question/i });
    fireEvent.click(askAnotherButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    });
  });

  it("resets and opens chat when clicking Try Again after error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Not enrolled" }),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is a quadratic function?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    });
  });

  it("does not submit empty question", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Answer" }),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();

    fireEvent.click(sendButton);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls API with correct payload", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Answer" }),
    });

    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: "What is the discriminant?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/student/lesson-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: "lesson-1-1",
          phaseNumber: 1,
          question: "What is the discriminant?",
        }),
      });
    });
  });

  it("displays lesson helper title in open state", () => {
    render(<LessonChatbot {...defaultProps} />);

    const openButton = screen.getByRole("button", { name: /open lesson help/i });
    fireEvent.click(openButton);

    expect(screen.getByText(/lesson helper/i)).toBeInTheDocument();
  });
});
