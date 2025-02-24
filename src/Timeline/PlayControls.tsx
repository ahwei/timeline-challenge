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
  const [localTime, setLocalTime] = useState<any>(0);
  const [maxTime, setMaxTime] = useState<any>(2000);
  const durationInputRef = useRef<HTMLInputElement>(null);

  const onUpdateTimeValue = useCallback(onUpdateValue(maxValue, minValue), [
    maxValue,
    minValue,
  ]);

  const onUpdateOriginTime = useCallback(
    (newValue: any) => {
      if (!isNaN(Number(newValue))) {
        setTime(onUpdateTimeValue(Math.round(newValue)));
      } else {
        setLocalTime(time);
      }
    },
    [setTime, time],
  );

  const onUpdateMaxTime = useCallback(
    (newValue: any) => {
      if (!isNaN(Number(newValue))) {
        setMaxTime(onUpdateTimeValue(Math.round(newValue)));
      } else {
        if (durationInputRef.current) {
          durationInputRef.current.value = String(maxTime);
        }
      }
    },
    [maxTime, onUpdateTimeValue],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const inputType = (e.nativeEvent as InputEvent).inputType;

      if (inputType === "stepUp" || inputType === "stepDown") {
        e.target.select();
        setLocalTime(newValue);
        onUpdateOriginTime(newValue);
        return;
      }

      if (inputType !== "deleteContentBackward" && inputType !== "insertText") {
        e.target.select();
        setLocalTime(newValue);
        onUpdateOriginTime(newValue);
        return;
      }

      setLocalTime(newValue);
    },
    [setLocalTime, onUpdateOriginTime],
  );

  const handleBlur = useCallback(() => {
    setLocalTime(time);
  }, [time]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onUpdateOriginTime(localTime);
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        setLocalTime(time);
        e.currentTarget.blur();
      }
    },
    [localTime, time, onUpdateOriginTime],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const inputType = (e.nativeEvent as InputEvent).inputType;
      if (inputType === "stepUp" || inputType === "stepDown") {
        e.target.select();
        const parsed = Number(newValue);
        if (!isNaN(parsed)) {
          const validated = onUpdateTimeValue(Math.round(parsed));
          setMaxTime(validated);
        }
        return;
      }
      if (inputType !== "deleteContentBackward" && inputType !== "insertText") {
        e.target.select();
        const parsed = Number(newValue);
        if (!isNaN(parsed)) {
          const validated = onUpdateTimeValue(Math.round(parsed));
          setMaxTime(validated);
        }
        return;
      }

      const parsed = Number(newValue);
      if (isNaN(parsed) && durationInputRef.current) {
        durationInputRef.current.value = String(maxTime);
      }
    },
    [maxTime, onUpdateTimeValue],
  );

  const handleMaxKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onUpdateMaxTime(durationInputRef.current?.value);
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        if (durationInputRef.current) {
          durationInputRef.current.value = String(maxTime);
        }
        e.currentTarget.blur();
      }
    },
    [time, setTime, maxTime],
  );

  useEffect(() => {
    setLocalTime(time);
  }, [time]);

  return (
    <div
      className="flex items-center justify-between border-b border-r border-solid border-gray-700 px-2"
      data-testid="play-controls"
    >
      <fieldset className="flex gap-1">
        Current
        <input
          className="bg-gray-700 px-1 rounded focus:text-red-500"
          type="number"
          data-testid="current-time-input"
          min={minValue}
          max={maxValue}
          step={STEP}
          value={localTime}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />
      </fieldset>
      -
      <fieldset className="flex gap-1">
        <input
          ref={durationInputRef}
          className="bg-gray-700 px-1 rounded"
          type="number"
          data-testid="duration-input"
          min={100}
          max={maxValue}
          step={STEP}
          defaultValue={maxTime}
          onChange={handleMaxChange}
          onKeyDown={handleMaxKeyDown}
          onFocus={handleFocus}
        />
        Duration
      </fieldset>
    </div>
  );
};
