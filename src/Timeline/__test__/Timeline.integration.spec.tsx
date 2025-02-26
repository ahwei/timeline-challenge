import { fireEvent, render, screen } from "@testing-library/react";
import { Timeline } from "../Timeline";

describe("Timeline Integration Tests", () => {
  const setup = () => {
    const component = render(<Timeline />);

    const ruler = screen.getByTestId("ruler");
    const rulerBar = screen.getByTestId("ruler-bar");
    const currentTimeInput = screen.getByTestId(
      "current-time-input",
    ) as HTMLInputElement;
    const durationInput = screen.getByTestId(
      "duration-input",
    ) as HTMLInputElement;
    const keyframeList = screen.getByTestId("keyframe-list");
    const trackList = screen.getByTestId("track-list");
    const timeline = screen.getByTestId("timeline");
    const segments = screen.getAllByTestId("segment");

    return {
      ruler,
      rulerBar,
      currentTimeInput,
      durationInput,
      keyframeList,
      trackList,
      timeline,
      segments,
      ...component,
    };
  };

  it("dragging beyond ruler boundaries should limit to valid time range", async () => {
    const { rulerBar, currentTimeInput } = setup();

    // Mock getBoundingClientRect
    const originalGetBoundingClientRect = rulerBar.getBoundingClientRect;
    jest.spyOn(rulerBar, "getBoundingClientRect").mockImplementation(() => {
      return {
        ...originalGetBoundingClientRect.call(rulerBar),
        left: 0,
        width: 2000,
      } as DOMRect;
    });

    // Simulate mouse down to start dragging
    fireEvent.mouseDown(rulerBar);

    // Simulate mouse move to negative value
    fireEvent.mouseMove(window, { clientX: -50 });

    // Verify current time is limited to valid range
    expect(currentTimeInput.value).toBe("0");

    // Simulate mouse move beyond maximum value
    fireEvent.mouseMove(window, { clientX: 3000 });

    // Verify current time is limited to maximum duration
    expect(currentTimeInput.value).toBe("2000");

    // End dragging
    fireEvent.mouseUp(window);
  });

  it("segment length should visually represent the total duration (1ms = 1px)", () => {
    const { durationInput, rulerBar } = setup();

    // Set duration to specific value
    fireEvent.input(durationInput, { target: { value: "1500" } });
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Check ruler bar width matches duration
    expect(rulerBar).toHaveStyle("width: 1500px");
  });
});
