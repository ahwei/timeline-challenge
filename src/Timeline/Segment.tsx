import { useTimeline } from "./TimelineContext";

export const Segment = () => {
  const { maxDuration } = useTimeline();

  return (
    <div
      style={{ width: `${maxDuration}px` }}
      className="py-2"
      data-testid="segment"
    >
      <div className="h-6 rounded-md bg-white/10"></div>
    </div>
  );
};
