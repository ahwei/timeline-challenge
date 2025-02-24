import { useTimeline } from "./TimelineContext";
export const Ruler = () => {
  const { maxDuration } = useTimeline();

  return (
    <div
      className="px-4 py-2 min-w-0 
      border-b border-solid border-gray-700 
      overflow-x-auto overflow-y-hidden"
      data-testid="ruler"
    >
      <div
        className={`w-[${maxDuration}px] h-6 rounded-md bg-white/25`}
        data-testid="ruler-bar"
      ></div>
    </div>
  );
};
