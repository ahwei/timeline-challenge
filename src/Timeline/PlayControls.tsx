import React, { useCallback, useEffect, useState } from "react";

type PlayControlsProps = {
  time: number;
  setTime: (time: number) => void;
};

const MAX_VALUE = 2000;
const STEP = 10;

const onUpdateValue = (newValue: number, maxValue = MAX_VALUE) => {
  if (newValue > maxValue) return MAX_VALUE;
  if (newValue < 0) return 0;
  return newValue;
};

export const PlayControls = ({ time, setTime }: PlayControlsProps) => {
  const [localTime, setLocalTime] = useState<any>(0);

  const onUpdateOriginTime = useCallback(
    (newValue: any) => {
      if (!isNaN(Number(newValue))) {
        setTime(onUpdateValue(Math.round(newValue)));
      } else {
        setLocalTime(time);
      }
    },
    [setTime],
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
    [setTime],
  );

  const handleBlur = useCallback(() => {
    setLocalTime(time);
  }, [setTime, time]);

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
    [localTime, setTime, time],
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
          min={0}
          max={MAX_VALUE}
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
          className="bg-gray-700 px-1 rounded"
          type="number"
          data-testid="duration-input"
          min={100}
          max={MAX_VALUE}
          step={STEP}
          defaultValue={2000}
          onFocus={handleFocus}
        />
        Duration
      </fieldset>
    </div>
  );
};
