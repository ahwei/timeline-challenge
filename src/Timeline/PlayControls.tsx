import React, { useCallback, useEffect, useRef } from "react";

type PlayControlsProps = {
  time: number;
  setTime: (time: number) => void;
  maxValue?: number;
  minValue?: number;
};

const MAX_VALUE = 6000;
const MIN_VALUE = 0;
const STEP = 10;

const onUpdateValue = (maxValue: number, minValue: number) => {
  return (newValue: number) => {
    if (newValue > maxValue) return maxValue;
    if (newValue < minValue) return minValue;
    return newValue;
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

  const onUpdateTimeValue = useCallback(onUpdateValue(maxValue, minValue), [
    maxValue,
    minValue,
  ]);

  const onUpdateOriginTime = useCallback(
    (newValue: string) => {
      const parsed = Number(newValue);
      if (!isNaN(parsed)) {
        setTime(onUpdateTimeValue(Math.round(parsed)));
      }
    },
    [setTime, onUpdateTimeValue],
  );

  const onUpdateMaxTime = useCallback(
    (newValue: string) => {
      const parsed = Number(newValue);
      if (!isNaN(parsed)) {
        const validated = onUpdateTimeValue(Math.round(parsed));
        if (durationInputRef.current) {
          durationInputRef.current.value = String(validated);
        }
      }
    },
    [onUpdateTimeValue],
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

  useEffect(() => {
    if (currentTimeInputRef.current) {
      currentTimeInputRef.current.value = String(time);
    }
  }, [time]);

  useEffect(() => {
    if (durationInputRef.current) {
      durationInputRef.current.value = String(maxValue);
    }
  }, [maxValue]);

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
          onKeyDown={(e) => handleKeyDown(e, onUpdateOriginTime, String(time))}
          onFocus={handleFocus}
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
          defaultValue={maxValue}
          onKeyDown={(e) => handleKeyDown(e, onUpdateMaxTime, String(maxValue))}
          onFocus={handleFocus}
        />
        Duration
      </fieldset>
    </div>
  );
};
