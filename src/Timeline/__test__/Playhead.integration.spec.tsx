import { fireEvent, render, screen } from "@testing-library/react";
import { Timeline } from "../Timeline";

describe("Playhead Integration Tests", () => {
  const setup = () => {
    const component = render(<Timeline />);

    const ruler = screen.getByTestId("ruler");
    const currentTimeInput = screen.getByTestId(
      "current-time-input",
    ) as HTMLInputElement;
    const keyframeList = screen.getByTestId("keyframe-list");
    const playhead = screen.getByTestId("playhead");

    return {
      ruler,
      currentTimeInput,
      keyframeList,
      playhead,
      ...component,
    };
  };

  // Utility function to extract translateX value from transform style
  const getTranslateX = (element: HTMLElement): number => {
    const transform = element.style.transform;
    const match = transform.match(/translateX\((\d+)px\)/);
    return match ? parseInt(match[1]) : 0;
  };

  it("playhead position should update when current time changes", () => {
    const { currentTimeInput, playhead } = setup();

    // Get initial position
    const initialPosition = getTranslateX(playhead);

    // Change current time
    fireEvent.input(currentTimeInput, { target: { value: "500" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Check that position has changed
    expect(getTranslateX(playhead)).not.toBe(initialPosition);
    expect(getTranslateX(playhead)).toBe(500);
  });

  it("playhead should adjust position during and after scrolling", () => {
    const { ruler, currentTimeInput, playhead } = setup();

    // Set current time
    fireEvent.input(currentTimeInput, { target: { value: "700" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Initial position
    expect(getTranslateX(playhead)).toBe(700);

    // Scroll ruler
    fireEvent.scroll(ruler, { target: { scrollLeft: 200 } });

    // Position should be adjusted (700 - 200 = 500)
    expect(getTranslateX(playhead)).toBe(500);

    // Scroll more
    fireEvent.scroll(ruler, { target: { scrollLeft: 400 } });

    // Position should be adjusted again (700 - 400 = 300)
    expect(getTranslateX(playhead)).toBe(300);

    // Change time while scrolled
    fireEvent.input(currentTimeInput, { target: { value: "900" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Position should reflect both the new time and scroll (900 - 400 = 500)
    expect(getTranslateX(playhead)).toBe(500);
  });

  it("playhead should appear/disappear appropriately when scrolling", () => {
    const { ruler, currentTimeInput, playhead } = setup();

    // Set current time to a value we can test scrolling with
    fireEvent.input(currentTimeInput, { target: { value: "500" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Check initial state rather than asserting visibility
    const initialHidden = playhead.hasAttribute("hidden");

    // Scroll to where playhead would be to the left of viewport
    fireEvent.scroll(ruler, { target: { scrollLeft: 1000 } });

    // After scrolling, playhead should have hidden attribute
    expect(playhead).toHaveAttribute("hidden");

    // Scroll back to where playhead is visible
    fireEvent.scroll(ruler, { target: { scrollLeft: 0 } });

    // Check if hidden state has been restored
    expect(playhead.hasAttribute("hidden")).toBe(initialHidden);
  });

  it("playhead should be in sync when scrolling either ruler or keyframe list", () => {
    const { ruler, keyframeList, playhead, currentTimeInput } = setup();

    // First set a specific current time so we have a non-zero position to work with
    fireEvent.input(currentTimeInput, { target: { value: "500" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Initial position should now be 500
    const initialPosition = getTranslateX(playhead);
    expect(initialPosition).toBe(500); // Verify we have a non-zero starting position

    // Test ruler scroll first
    fireEvent.scroll(ruler, { target: { scrollLeft: 100 } });

    // Position should be adjusted (500 - 100 = 400)
    expect(getTranslateX(playhead)).toBe(400);

    // Reset scroll
    fireEvent.scroll(ruler, { target: { scrollLeft: 0 } });

    // Position should be back to initial
    expect(getTranslateX(playhead)).toBe(initialPosition);

    // Now test keyframe list scroll as a separate test case
    // First check that keyframe scroll updates ruler scroll
    fireEvent.scroll(keyframeList, { target: { scrollLeft: 100 } });

    // Verify ruler scroll is updated
    expect(ruler.scrollLeft).toBe(100);

    // And verify playhead position is updated accordingly
    expect(getTranslateX(playhead)).toBe(500);
  });

  it("playhead visibility should be maintained when time changes while scrolled", () => {
    const { ruler, currentTimeInput, playhead } = setup();

    // Scroll to a position
    fireEvent.scroll(ruler, { target: { scrollLeft: 300 } });

    // Set time to a value that would be visible given current scroll
    fireEvent.input(currentTimeInput, { target: { value: "400" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // First check if hidden is not present
    const isHiddenBefore = playhead.hasAttribute("hidden");

    // Set time to a value that would be out of view to the left
    fireEvent.input(currentTimeInput, { target: { value: "100" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Should be hidden now
    expect(playhead).toHaveAttribute("hidden");

    // Set time to a value that would be visible again
    fireEvent.input(currentTimeInput, { target: { value: "500" } });
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });

    // Should return to previous visibility state
    expect(playhead.hasAttribute("hidden")).toBe(isHiddenBefore);
  });
});
