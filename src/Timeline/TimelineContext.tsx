import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from "react";

export const MAX_VALUE = 6000;
export const MIN_VALUE = 0;
export const STEP = 10;

interface TimelineState {
  currentTime: number;
  maxDuration: number;
}

type TimelineAction =
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_MAX_DURATION"; payload: number };

interface TimelineContextType {
  time: number;
  maxDuration: number;
  dispatch: React.Dispatch<TimelineAction>;
  updateTime: (newValue: string) => void;
  updateMaxDuration: (newValue: string) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined,
);

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

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(timelineReducer, {
    currentTime: 0,
    maxDuration: 2000,
  });

  const updateTime = useCallback(
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

  const updateMaxDuration = useCallback((newValue: string) => {
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
    <TimelineContext.Provider
      value={{
        time: state.currentTime,
        maxDuration: state.maxDuration,
        dispatch,
        updateTime,
        updateMaxDuration,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
};
