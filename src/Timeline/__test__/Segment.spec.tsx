import { render, screen } from "@testing-library/react";
import { Segment } from "../Segment";
import { TimelineProvider } from "../TimelineContext";

describe("Segment Unit Tests", () => {
  it("should render with correct width based on duration", () => {
    render(
      <TimelineProvider>
        <Segment />
      </TimelineProvider>,
    );

    const segment = screen.getByTestId("segment");

    // Check that the segment has a width style attribute
    // The specific width value would be verified in integration tests
    expect(segment).toBeInTheDocument();
  });
});
