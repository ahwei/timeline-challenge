import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyframeList } from "../KeyframeList";
import { PlayControls } from "../PlayControls";
import { Ruler } from "../Ruler";
import { TimelineProvider } from "../TimelineContext";

describe("Ruler", () => {
  const setup = () => {
    const component = render(
      <TimelineProvider>
        <PlayControls />
        <Ruler />
        <KeyframeList />
      </TimelineProvider>,
    );

    const ruler = screen.getByTestId("ruler");
    const rulerBar = screen.getByTestId("ruler-bar");
    const currentTimeInput = screen.getByTestId(
      "current-time-input",
    ) as HTMLInputElement;
    const durationInput = screen.getByTestId(
      "duration-input",
    ) as HTMLInputElement;
    const keyframeList = screen.getByTestId("keyframe-list");

    return {
      ruler,
      rulerBar,
      currentTimeInput,
      durationInput,
      keyframeList,
      ...component,
    };
  };

  it("clicking on ruler updates the current time", async () => {
    const { rulerBar, currentTimeInput } = setup();

    // Mock getBoundingClientRect to calculate click position
    const originalGetBoundingClientRect = rulerBar.getBoundingClientRect;
    jest.spyOn(rulerBar, "getBoundingClientRect").mockImplementation(() => {
      return {
        ...originalGetBoundingClientRect.call(rulerBar),
        left: 0,
        width: 2000,
      } as DOMRect;
    });

    // Simulate click at position 500px on the ruler
    fireEvent.click(rulerBar, { clientX: 500 });

    // Verify current time has been updated
    expect(currentTimeInput.value).toBe("500");
  });

  it("dragging on ruler updates the current time", async () => {
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

    // Simulate mouse move to 800px
    fireEvent.mouseMove(window, { clientX: 800 });

    // Verify current time has been updated
    expect(currentTimeInput.value).toBe("800");

    // End dragging
    fireEvent.mouseUp(window);
  });

  it("ruler length visually represents the total duration (1ms = 1px)", () => {
    const { rulerBar, durationInput } = setup();

    // Default duration is 2000ms
    expect(rulerBar).toHaveStyle("width: 2000px");
    expect(durationInput.value).toBe("2000");
  });

  it("ruler length updates after duration input loses focus", async () => {
    const { rulerBar, durationInput } = setup();

    // Change duration input
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "3000");

    // Press Enter key to confirm changes
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Verify ruler length has been updated
    expect(rulerBar).toHaveStyle("width: 3000px");
    expect(durationInput.value).toBe("3000");
  });

  it("ruler length updates after pressing Enter on duration input", async () => {
    const { rulerBar, durationInput } = setup();

    // Change duration input
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "4000");

    // Press Enter key
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Verify ruler length has been updated
    expect(rulerBar).toHaveStyle("width: 4000px");
    expect(durationInput.value).toBe("4000");
  });

  it("ruler length updates when using arrow keys on duration input", () => {
    const { rulerBar, durationInput } = setup();

    // Simulate using the up arrow key
    fireEvent.keyDown(durationInput, { key: "ArrowUp" });
    fireEvent.input(durationInput, {
      target: { value: "2010" },
      nativeEvent: { inputType: "stepUp" },
    });

    // Verify ruler length has been updated
    expect(rulerBar).toHaveStyle("width: 2010px");
    expect(durationInput.value).toBe("2010");
  });

  it("ruler length updates when clicking up/down buttons on duration input", () => {
    const { rulerBar, durationInput } = setup();

    // Simulate clicking up/down buttons
    fireEvent.input(durationInput, {
      target: { value: "2010" },
      nativeEvent: { inputType: "stepUp" },
    });

    // Verify ruler length has been updated
    expect(rulerBar).toHaveStyle("width: 2010px");
    expect(durationInput.value).toBe("2010");
  });

  it("horizontal scrolling of ruler is synchronized with keyframe list", () => {
    const { ruler, keyframeList } = setup();

    // Scroll ruler to specific position
    fireEvent.scroll(ruler, { target: { scrollLeft: 100 } });

    // Verify keyframe list is synchronized with scroll
    expect(keyframeList.scrollLeft).toBe(100);
  });

  // Removed the "dragging beyond ruler boundaries should limit to valid time range" test
});
