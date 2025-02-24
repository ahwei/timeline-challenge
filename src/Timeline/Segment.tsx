import { useTimeline } from "./TimelineContext";
export const Segment = () => {
  const { maxDuration } = useTimeline();

  return (
    <div className={`w-[${maxDuration}px] py-2`} data-testid="segment">
      <div className="h-6 rounded-md bg-white/10"></div>
    </div>
  );
};
