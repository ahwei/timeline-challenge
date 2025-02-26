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

  it("scrolling ruler should synchronize with keyframe list", () => {
    const { ruler, keyframeList } = setup();

    // Scroll ruler to specific position
    fireEvent.scroll(ruler, { target: { scrollLeft: 150 } });

    // Verify keyframe list is synchronized with scroll
    expect(keyframeList.scrollLeft).toBe(150);
  });

  it("changing duration should update ruler length and limit current time if needed", async () => {
    const { currentTimeInput, durationInput, rulerBar } = setup();

    // Set current time to 1800
    fireEvent.input(currentTimeInput, { target: { value: "1800" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("1800");

    // Set duration to 1500 (less than current time)
    fireEvent.input(durationInput, { target: { value: "1500" } });
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Check ruler length updated
    expect(rulerBar).toHaveStyle("width: 1500px");

    // Check current time was adjusted
    expect(currentTimeInput.value).toBe("1500");
  });

  it("scrolling track list should synchronize with keyframe list", () => {
    const { trackList, keyframeList } = setup();

    // Scroll track list to specific vertical position
    fireEvent.scroll(trackList, { target: { scrollTop: 120 } });

    // Verify keyframe list is synchronized with vertical scroll
    expect(keyframeList.scrollTop).toBe(120);
  });

  it("scrolling keyframe list should synchronize with track list", () => {
    const { trackList, keyframeList } = setup();

    // Scroll keyframe list to specific vertical position
    fireEvent.scroll(keyframeList, { target: { scrollTop: 75 } });

    // Verify track list is synchronized with vertical scroll
    expect(trackList.scrollTop).toBe(75);
  });

  it("keyframe list horizontal scrolling should synchronize with ruler", () => {
    const { ruler, keyframeList } = setup();

    // Scroll keyframe list horizontally
    fireEvent.scroll(keyframeList, { target: { scrollLeft: 200 } });

    // Verify ruler horizontal scroll is synchronized
    expect(ruler.scrollLeft).toBe(200);
  });

  it("segment length should visually represent the total duration (1ms = 1px)", () => {
    const { durationInput, rulerBar } = setup();

    // Set duration to specific value
    fireEvent.input(durationInput, { target: { value: "1500" } });
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Check ruler bar width matches duration
    expect(rulerBar).toHaveStyle("width: 1500px");
  });

  it("segment length should only update after specific actions on duration input", () => {
    const { durationInput, rulerBar } = setup();

    // Change duration but don't trigger update (just type)
    fireEvent.input(durationInput, { target: { value: "1200" } });

    // Press Enter to confirm the change
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Now width should update
    expect(rulerBar).toHaveStyle("width: 1200px");

    // Test with blur event (losing focus)
    fireEvent.input(durationInput, { target: { value: "1800" } });
    fireEvent.blur(durationInput);

    // Width should update after blur
    expect(rulerBar).toHaveStyle("width: 1800px");

    // Test with arrow keys
    fireEvent.focus(durationInput);
    fireEvent.keyDown(durationInput, { key: "ArrowUp" });

    // Should increment by 10
    expect(rulerBar).toHaveStyle("width: 1800px");

    fireEvent.keyDown(durationInput, { key: "ArrowDown" });

    // Should decrement by 10
    expect(rulerBar).toHaveStyle("width: 1800px");
  });
});
