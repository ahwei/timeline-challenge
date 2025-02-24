import React, { useCallback, useEffect, useRef, useState } from "react";

type PlayControlsProps = {
  time: number;
  setTime: (time: number) => void;
  maxValue?: number;
  minValue?: number;
};

const MAX_VALUE = 6000;
const MIN_VALUE = 0;
const STEP = 10;

const onUpdateValue = (minValue: number, maxValue: number) => {
  return (newValue: number) => {
    if (newValue > maxValue) return maxValue;
    if (newValue < minValue) return minValue;

    return Math.round(newValue / 10) * 10;
  };
};

export const PlayControls = ({
  time,
  setTime,
  maxValue = MAX_VALUE,
  minValue = MIN_VALUE,
}: PlayControlsProps) => {
  const currentTimeInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);
  const [localMax, setLocalMax] = useState(2000);

  const onUpdateOriginTime = useCallback(
    (newValue: string) => {
      const parsed = Number(newValue);
      const onUpdateTimeValue = onUpdateValue(minValue, localMax);

      if (!isNaN(parsed)) {
        setTime(onUpdateTimeValue(parsed));
      }
    },
    [setTime, localMax, minValue],
  );

  const onUpdateMaxTime = useCallback(
    (newValue: string) => {
      const onUpdateTimeValue = onUpdateValue(100, maxValue);

      const parsed = Number(newValue);
      if (!isNaN(parsed)) {
        const newMax = onUpdateTimeValue(parsed);
        setLocalMax(newMax);

        if (time > newMax) {
          setTime(newMax);
          if (currentTimeInputRef.current) {
            currentTimeInputRef.current.value = String(time);
          }
        }
      }
    },
    [setLocalMax, time, maxValue],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      updateFn: (value: string) => void,
      originalValue: string,
    ) => {
      if (e.key === "Enter") {
        updateFn(e.currentTarget.value);
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        e.currentTarget.value = originalValue;
        e.currentTarget.blur();
      }
    },
    [],
  );

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      updateFn: (value: string) => void,
    ) => {
      const newValue = e.target.value;
      const inputType = (e.nativeEvent as InputEvent).inputType;

      if (inputType === "stepUp" || inputType === "stepDown") {
        e.target.select();
        updateFn(newValue);
        return;
      }

      if (inputType !== "deleteContentBackward" && inputType !== "insertText") {
        e.target.select();
        updateFn(newValue);
        return;
      }
    },
    [time, onUpdateOriginTime],
  );

  useEffect(() => {
    if (currentTimeInputRef.current) {
      currentTimeInputRef.current.value = String(time);
    }
  }, [time]);

  useEffect(() => {
    if (durationInputRef.current) {
      durationInputRef.current.value = String(localMax);
    }
  }, [localMax]);

  return (
    <div
      className="flex items-center justify-between border-b border-r border-solid border-gray-700 px-2"
      data-testid="play-controls"
    >
      <fieldset className="flex gap-1">
        Current
        <input
          ref={currentTimeInputRef}
          className="bg-gray-700 px-1 rounded focus:text-red-500"
          type="number"
          data-testid="current-time-input"
          min={minValue}
          max={maxValue}
          step={STEP}
          defaultValue={time}
          onChange={(e) => handleChange(e, onUpdateOriginTime)}
          onKeyDown={(e) => handleKeyDown(e, onUpdateOriginTime, String(time))}
          onFocus={handleFocus}
          onBlur={() => {
            if (currentTimeInputRef.current) {
              currentTimeInputRef.current.value = String(time);
            }
          }}
        />
      </fieldset>
      -
      <fieldset className="flex gap-1">
        <input
          ref={durationInputRef}
          className="bg-gray-700 px-1 rounded focus:text-red-500"
          type="number"
          data-testid="duration-input"
          min={100}
          max={maxValue}
          step={STEP}
          defaultValue={localMax}
          onKeyDown={(e) => handleKeyDown(e, onUpdateMaxTime, String(maxValue))}
          onChange={(e) => handleChange(e, onUpdateMaxTime)}
          onFocus={handleFocus}
          onBlur={() => {
            if (durationInputRef.current) {
              durationInputRef.current.value = String(localMax);
            }
          }}
        />
        Duration
      </fieldset>
    </div>
  );
};
