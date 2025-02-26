import { useCallback } from "react";
import { Segment } from "./Segment";
import { useTimeline } from "./TimelineContext";

export const KeyframeList = () => {
  const { scrollRefs } = useTimeline();

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (scrollRefs.ruler.current) {
      scrollRefs.ruler.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (scrollRefs.trackList.current) {
      scrollRefs.trackList.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  return (
    <div
      ref={scrollRefs.keyframeList}
      className="px-4 min-w-0 overflow-auto"
      data-testid="keyframe-list"
      onScroll={handleScroll}
    >
      <Segment />
      <Segment />
      <Segment />
      <Segment />
      <Segment />
      <Segment />
      <Segment />
      <Segment />
      <Segment />
      <Segment />
    </div>
  );
};
