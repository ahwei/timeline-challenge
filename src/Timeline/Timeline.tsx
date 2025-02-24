import { useCallback, useReducer } from "react";
import { MAX_VALUE } from "./constants";
import { KeyframeList } from "./KeyframeList";
import { PlayControls } from "./PlayControls";
import { Playhead } from "./Playhead";
import { Ruler } from "./Ruler";
import { TrackList } from "./TrackList";
interface TimelineState {
  currentTime: number;
  maxDuration: number;
}

type TimelineAction =
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_MAX_DURATION"; payload: number };

const timelineReducer = (
  state: TimelineState,
  action: TimelineAction,
): TimelineState => {
  switch (action.type) {
    case "SET_CURRENT_TIME":
      return {
        ...state,
        currentTime: action.payload,
      };
    case "SET_MAX_DURATION":
      return {
        ...state,
        maxDuration: action.payload,
        currentTime:
          state.currentTime > action.payload
            ? action.payload
            : state.currentTime,
      };
    default:
      return state;
  }
};

export const Timeline = () => {
  const [state, dispatch] = useReducer(timelineReducer, {
    currentTime: 0,
    maxDuration: 2000,
  });

  const onUpdateTime = useCallback(
    (newValue: string) => {
      const parsed = Number(newValue);
      if (!isNaN(parsed)) {
        const validated = Math.round(parsed / 10) * 10;
        if (validated > state.maxDuration) {
          dispatch({ type: "SET_CURRENT_TIME", payload: state.maxDuration });
        } else if (validated < 0) {
          dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
        } else {
          dispatch({ type: "SET_CURRENT_TIME", payload: validated });
        }
      }
    },
    [state.maxDuration],
  );

  const onUpdateMaxDuration = useCallback((newValue: string) => {
    const parsed = Number(newValue);
    if (!isNaN(parsed)) {
      const validated = Math.round(parsed / 10) * 10;
      if (validated < 100) {
        dispatch({ type: "SET_MAX_DURATION", payload: 100 });
      } else if (validated > MAX_VALUE) {
        dispatch({ type: "SET_MAX_DURATION", payload: MAX_VALUE });
      } else {
        dispatch({ type: "SET_MAX_DURATION", payload: validated });
      }
    }
  }, []);

  return (
    <div
      className="relative h-[300px] w-full grid grid-cols-[300px_1fr] grid-rows-[40px_1fr] 
    bg-gray-800 border-t-2 border-solid border-gray-700"
      data-testid="timeline"
    >
      <PlayControls
        time={state.currentTime}
        maxDuration={state.maxDuration}
        onUpdateTime={onUpdateTime}
        onUpdateMaxDuration={onUpdateMaxDuration}
      />
      <Ruler maxDuration={state.maxDuration} />
      <TrackList />
      <KeyframeList />
      <Playhead time={state.currentTime} />
    </div>
  );
};
