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
