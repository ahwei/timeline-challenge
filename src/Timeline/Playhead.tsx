import { useEffect, useMemo, useState } from "react";
import { useTimeline } from "./TimelineContext";

const BASE_LEFT = 316;

export const Playhead = () => {
  const { time, scrollRefs } = useTimeline();
  const [scrollLeft, setScrollLeft] = useState(0);
  const [rulerWidth, setRulerWidth] = useState(0);

  useEffect(() => {
    const rulerEl = scrollRefs.ruler.current;
    if (!rulerEl) return;

    const updateScroll = () => {
      setScrollLeft(rulerEl.scrollLeft);
      setRulerWidth(rulerEl.offsetWidth);
    };

    updateScroll();
    rulerEl.addEventListener("scroll", updateScroll);
    window.addEventListener("resize", updateScroll);

    return () => {
      rulerEl.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [scrollRefs.ruler]);

  const { offsetX, isVisible } = useMemo(() => {
    const offsetX = time - scrollLeft;
    const playheadX = BASE_LEFT + offsetX;
    const isVisible =
      playheadX >= BASE_LEFT && playheadX <= BASE_LEFT + rulerWidth;
    return { offsetX, isVisible };
  }, [time, scrollLeft, rulerWidth]);

  return (
    <div
      className="absolute left-[316px] h-full border-l-2 border-solid border-yellow-600 z-0"
      data-testid="playhead"
      hidden={!isVisible}
      style={{ transform: `translateX(${offsetX}px)` }}
    >
      <div className="absolute border-solid border-[5px] border-transparent border-t-yellow-600 -translate-x-1/2" />
    </div>
  );
};
