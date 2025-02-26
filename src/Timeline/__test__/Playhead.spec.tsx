import { render, screen } from "@testing-library/react";
import { Playhead } from "../Playhead";
import * as TimelineContextModule from "../TimelineContext";
import { TimelineProvider } from "../TimelineContext";

// Mock the useTimeline hook
jest.mock("../TimelineContext", () => {
  const originalModule = jest.requireActual("../TimelineContext");
  return {
    ...originalModule,
    useTimeline: jest.fn(),
  };
});

describe("Playhead Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should position correctly based on current time", () => {
    // Mock the useTimeline hook to return controlled values
    const mockUseTimeline = jest.spyOn(TimelineContextModule, "useTimeline");
    mockUseTimeline.mockReturnValue({
      time: 500,
      scrollRefs: {
        ruler: {
          current: {
            scrollLeft: 0,
            offsetWidth: 500,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
        },
        keyframeList: { current: null },
        trackList: { current: null },
      },
    } as any);

    render(
      <TimelineProvider>
        <Playhead />
      </TimelineProvider>,
    );

    const playhead = screen.getByTestId("playhead");

    // Verify playhead has correct transform style for positioning
    expect(playhead).toHaveStyle("transform: translateX(500px)");

    // Verify playhead is visible
    expect(playhead).not.toHaveAttribute("hidden");
  });

  it("should adjust position when scrolling", () => {
    // Mock the useTimeline hook with scrollLeft value
    const mockUseTimeline = jest.spyOn(TimelineContextModule, "useTimeline");
    mockUseTimeline.mockReturnValue({
      time: 700,
      scrollRefs: {
        ruler: {
          current: {
            scrollLeft: 200,
            offsetWidth: 500,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
        },
        keyframeList: { current: null },
        trackList: { current: null },
      },
    } as any);

    render(
      <TimelineProvider>
        <Playhead />
      </TimelineProvider>,
    );

    const playhead = screen.getByTestId("playhead");

    // Verify playhead position is adjusted for scroll (700 - 200 = 500)
    expect(playhead).toHaveStyle("transform: translateX(500px)");
  });

  it("should be hidden when out of view (to the left)", () => {
    // Mock useTimeline to simulate playhead out of view to the left
    const mockUseTimeline = jest.spyOn(TimelineContextModule, "useTimeline");
    mockUseTimeline.mockReturnValue({
      time: 100,
      scrollRefs: {
        ruler: {
          current: {
            scrollLeft: 500,
            offsetWidth: 500,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
        },
        keyframeList: { current: null },
        trackList: { current: null },
      },
    } as any);

    render(
      <TimelineProvider>
        <Playhead />
      </TimelineProvider>,
    );

    const playhead = screen.getByTestId("playhead");

    // offsetX would be -400, which is less than 0, so it should be hidden
    expect(playhead).toHaveAttribute("hidden");
  });

  it("should be hidden when out of view (to the right)", () => {
    // Mock useTimeline to simulate playhead out of view to the right
    const mockUseTimeline = jest.spyOn(TimelineContextModule, "useTimeline");
    mockUseTimeline.mockReturnValue({
      time: 1200,
      scrollRefs: {
        ruler: {
          current: {
            scrollLeft: 200,
            offsetWidth: 500,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          },
        },
        keyframeList: { current: null },
        trackList: { current: null },
      },
    } as any);

    render(
      <TimelineProvider>
        <Playhead />
      </TimelineProvider>,
    );

    const playhead = screen.getByTestId("playhead");

    // offsetX would be 1000, which is greater than ruler width (500), so it should be hidden
    expect(playhead).toHaveAttribute("hidden");
  });
});
