import { useCallback, useEffect, useRef, useState } from "react";
import { useTimeline } from "./TimelineContext";

export const Ruler = () => {
  const { maxDuration, updateTime, scrollRefs } = useTimeline();
  const [isDragging, setIsDragging] = useState(false);
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = useCallback(
    (clientX: number) => {
      if (!rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const newTime = Math.max(0, Math.min(x, maxDuration));
      updateTime(String(newTime));
    },
    [maxDuration, updateTime],
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollRefs.keyframeList.current) {
      scrollRefs.keyframeList.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleTimeUpdate(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleTimeUpdate]);

  return (
    <div
      ref={scrollRefs.ruler}
      className="px-4 py-2 min-w-0 
      border-b border-solid border-gray-700 
      overflow-x-auto overflow-y-hidden"
      data-testid="ruler"
      onScroll={handleScroll}
    >
      <div
        ref={rulerRef}
        className={`w-[${maxDuration}px] h-6 rounded-md bg-white/25 cursor-pointer`}
        data-testid="ruler-bar"
        onClick={(e) => handleTimeUpdate(e.clientX)}
        onMouseDown={() => setIsDragging(true)}
      ></div>
    </div>
  );
};
