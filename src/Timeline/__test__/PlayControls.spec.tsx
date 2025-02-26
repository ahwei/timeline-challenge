import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayControls } from "../PlayControls";
import { TimelineProvider } from "../TimelineContext";

describe("PlayControls", () => {
  const setup = () => {
    render(
      <TimelineProvider>
        <PlayControls />
      </TimelineProvider>,
    );
    const input = screen.getByTestId("current-time-input") as HTMLInputElement;
    return { input };
  };

  it("displays typed value immediately but does not update context until confirmed", async () => {
    const { input } = setup();
    await userEvent.clear(input);
    await userEvent.type(input, "120");
    expect(input.value).toBe("120");
    fireEvent.blur(input);
    expect(input.value).toBe("0");
  });

  it("confirms new value and removes focus on Enter", async () => {
    const { input } = setup();
    await userEvent.clear(input);
    await userEvent.type(input, "150");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).not.toHaveFocus();
    expect(input.value).toBe("150");
  });

  it("reverts to original value and removes focus on Escape", async () => {
    const { input } = setup();
    const original = input.value;
    await userEvent.clear(input);
    await userEvent.type(input, "180");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).not.toHaveFocus();
    expect(input.value).toBe(original);
  });

  it("handles native step button events", () => {
    const { input } = setup();
    fireEvent.input(input, {
      target: { value: "10" },
      nativeEvent: { inputType: "stepUp" },
    });
    expect(input.value).toBe("10");
  });

  it("handles arrow key events with stepUp", () => {
    const { input } = setup();
    fireEvent.input(input, {
      target: { value: "20" },
      nativeEvent: { inputType: "insertText" },
    });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.input(input, {
      target: { value: "30" },
      nativeEvent: { inputType: "stepUp" },
    });
    expect(input.value).toBe("30");
  });

  it("attempts to select entire text on focus", async () => {
    const { input } = setup();
    const selectSpy = jest.spyOn(input, "select");

    await userEvent.click(input);

    expect(selectSpy).toHaveBeenCalled();
  });

  it("removes leading zeros on Enter", async () => {
    const { input } = setup();
    await userEvent.clear(input);
    await userEvent.type(input, "0070");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("70");
  });

  it("adjusts negative values to minimum", async () => {
    const { input } = setup();
    await userEvent.clear(input);
    await userEvent.type(input, "-50");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("0");
  });

  it("rounds decimal values to nearest valid step", async () => {
    const { input } = setup();
    await userEvent.clear(input);
    await userEvent.type(input, "15.7");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("20");
  });

  it("reverts on invalid non-numeric input", async () => {
    const { input } = setup();
    const original = input.value;
    await userEvent.clear(input);
    await userEvent.type(input, "abc");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe(original);
  });
});
