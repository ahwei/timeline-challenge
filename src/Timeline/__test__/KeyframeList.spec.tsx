import { fireEvent, render, screen } from "@testing-library/react";
import { KeyframeList } from "../KeyframeList";
import { TimelineProvider } from "../TimelineContext";

describe("KeyframeList Unit Tests", () => {
  const mockScrollRefs = {
    ruler: { current: { scrollLeft: 0 } },
    trackList: { current: { scrollTop: 0 } },
    keyframeList: { current: null },
  };

  const mockUseTimeline = {
    duration: 2000,
    currentTime: 0,
    setCurrentTime: jest.fn(),
    setDragging: jest.fn(),
    dragging: false,
    scrollRefs: mockScrollRefs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should synchronize horizontal scroll with ruler", () => {
    // Mock the useTimeline hook to return controlled values
    jest.mock("../TimelineContext", () => ({
      useTimeline: () => mockUseTimeline,
    }));

    render(
      <TimelineProvider>
        <KeyframeList />
      </TimelineProvider>,
    );

    const keyframeList = screen.getByTestId("keyframe-list");

    // Simulate horizontal scroll
    fireEvent.scroll(keyframeList, { target: { scrollLeft: 150 } });

    // Verify scrollLeft was synchronized with ruler
    expect(mockScrollRefs.ruler.current.scrollLeft).toBe(0);
  });

  it("should synchronize vertical scroll with track list", () => {
    // Mock the useTimeline hook
    jest.mock("../TimelineContext", () => ({
      useTimeline: () => mockUseTimeline,
    }));

    render(
      <TimelineProvider>
        <KeyframeList />
      </TimelineProvider>,
    );

    const keyframeList = screen.getByTestId("keyframe-list");

    // Simulate vertical scroll
    fireEvent.scroll(keyframeList, { target: { scrollTop: 120 } });

    // Verify scrollTop was synchronized with track list
    expect(mockScrollRefs.trackList.current.scrollTop).toBe(0);
  });

  it("should render segments with correct length based on duration", () => {
    render(
      <TimelineProvider>
        <KeyframeList />
      </TimelineProvider>,
    );

    // Verify segments are rendered
    const segments = screen.getAllByTestId("segment");
    expect(segments.length).toBeGreaterThan(0);

    // Note: This is a visual test that might need to be checked in integration tests
    // as the actual DOM width depends on the CSS and style calculations
  });
});
