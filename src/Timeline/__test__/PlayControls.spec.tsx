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

    const currentTimeInput = screen.getByTestId(
      "current-time-input",
    ) as HTMLInputElement;
    const durationInput = screen.getByTestId(
      "duration-input",
    ) as HTMLInputElement;

    return {
      currentTimeInput,
      durationInput,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays typed value immediately but does not update context until confirmed", async () => {
    const { currentTimeInput } = setup();
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "120");
    expect(currentTimeInput.value).toBe("120");
    fireEvent.blur(currentTimeInput);
    expect(currentTimeInput.value).toBe("0");
  });

  it("confirms new value and removes focus on Enter", async () => {
    const { currentTimeInput } = setup();
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "150");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput).not.toHaveFocus();
    expect(currentTimeInput.value).toBe("150");
  });

  it("reverts to original value and removes focus on Escape", async () => {
    const { currentTimeInput } = setup();
    const original = currentTimeInput.value;
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "180");
    fireEvent.keyDown(currentTimeInput, { key: "Escape" });
    expect(currentTimeInput).not.toHaveFocus();
    expect(currentTimeInput.value).toBe(original);
  });

  it("handles native step button events", () => {
    const { currentTimeInput } = setup();
    fireEvent.input(currentTimeInput, {
      target: { value: "10" },
      nativeEvent: { inputType: "stepUp" },
    });
    expect(currentTimeInput.value).toBe("10");
  });

  it("handles arrow key events with stepUp", () => {
    const { currentTimeInput } = setup();
    fireEvent.input(currentTimeInput, {
      target: { value: "20" },
      nativeEvent: { inputType: "insertText" },
    });
    fireEvent.keyDown(currentTimeInput, { key: "ArrowUp" });
    fireEvent.input(currentTimeInput, {
      target: { value: "30" },
      nativeEvent: { inputType: "stepUp" },
    });
    expect(currentTimeInput.value).toBe("30");
  });

  it("attempts to select entire text on focus", async () => {
    const { currentTimeInput } = setup();
    const selectSpy = jest.spyOn(currentTimeInput, "select");

    await userEvent.click(currentTimeInput);

    expect(selectSpy).toHaveBeenCalled();
  });

  it("removes leading zeros on Enter", async () => {
    const { currentTimeInput } = setup();
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "0070");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("70");
  });

  it("adjusts negative values to minimum", async () => {
    const { currentTimeInput } = setup();
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "-50");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("0");
  });

  it("rounds decimal values to nearest valid step", async () => {
    const { currentTimeInput } = setup();
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "15.7");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("20");
  });

  it("reverts on invalid non-numeric input", async () => {
    const { currentTimeInput } = setup();
    const original = currentTimeInput.value;
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "abc");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe(original);
  });

  it("keeps Current Time between 0ms and Duration", async () => {
    const { currentTimeInput } = setup();
    await userEvent.clear(currentTimeInput);
    // Attempt to set time higher than max duration (2000 by default)
    await userEvent.type(currentTimeInput, "3000");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("2000");
  });

  it("adjusts Current Time if it exceeds newly set Duration", async () => {
    const { currentTimeInput, durationInput } = setup();

    // Set current time to 1500
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "1500");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("1500");

    // Set duration to 1000 (lower than current time)
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "1000");
    fireEvent.keyDown(durationInput, { key: "Enter" });

    // Current time should be adjusted to match the new duration
    expect(currentTimeInput.value).toBe("1000");
  });

  it("keeps Duration between 100ms and 6000ms", async () => {
    const { durationInput } = setup();

    // Test minimum boundary
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "50");
    fireEvent.keyDown(durationInput, { key: "Enter" });
    expect(durationInput.value).toBe("100");

    // Test maximum boundary
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "7000");
    fireEvent.keyDown(durationInput, { key: "Enter" });
    expect(durationInput.value).toBe("6000");
  });

  it("ensures Current Time and Duration are multiples of 10ms", async () => {
    const { currentTimeInput, durationInput } = setup();

    // Test Current Time rounding
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "123");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("120");

    // Test Duration rounding
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "1234");
    fireEvent.keyDown(durationInput, { key: "Enter" });
    expect(durationInput.value).toBe("1230");
  });

  it("ensures Current Time and Duration are positive integers", async () => {
    const { currentTimeInput, durationInput } = setup();

    // Non-integer Current Time
    await userEvent.clear(currentTimeInput);
    await userEvent.type(currentTimeInput, "123.45");
    fireEvent.keyDown(currentTimeInput, { key: "Enter" });
    expect(currentTimeInput.value).toBe("120");

    // Negative Duration
    await userEvent.clear(durationInput);
    await userEvent.type(durationInput, "-200");
    fireEvent.keyDown(durationInput, { key: "Enter" });
    expect(durationInput.value).toBe("100");
  });
});
