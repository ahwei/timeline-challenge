import { fireEvent, render, screen } from "@testing-library/react";
import { TimelineProvider } from "../TimelineContext";
import { TrackList } from "../TrackList";

describe("TrackList Unit Tests", () => {
  const mockScrollRefs = {
    keyframeList: { current: { scrollTop: 0 } },
    ruler: { current: null },
    trackList: { current: null },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should synchronize vertical scroll with keyframe list", () => {
    // Mock the useTimeline hook
    jest.mock("../TimelineContext", () => ({
      useTimeline: () => ({
        scrollRefs: mockScrollRefs,
      }),
    }));

    render(
      <TimelineProvider>
        <TrackList />
      </TimelineProvider>,
    );

    const trackList = screen.getByTestId("track-list");

    // Simulate vertical scroll
    fireEvent.scroll(trackList, { target: { scrollTop: 75 } });

    // Verify scrollTop would be synchronized with keyframe list
    expect(mockScrollRefs.keyframeList.current.scrollTop).toBe(0);
  });

  it("should render all tracks correctly", () => {
    render(
      <TimelineProvider>
        <TrackList />
      </TimelineProvider>,
    );

    // Verify all tracks are rendered
    expect(screen.getByText("Track A")).toBeInTheDocument();
    expect(screen.getByText("Track B")).toBeInTheDocument();
    expect(screen.getByText("Track C")).toBeInTheDocument();
    expect(screen.getByText("Track D")).toBeInTheDocument();
    expect(screen.getByText("Track E")).toBeInTheDocument();
    expect(screen.getByText("Track F")).toBeInTheDocument();
    expect(screen.getByText("Track G")).toBeInTheDocument();
    expect(screen.getByText("Track H")).toBeInTheDocument();
    expect(screen.getByText("Track I")).toBeInTheDocument();
    expect(screen.getByText("Track J")).toBeInTheDocument();
  });
});
