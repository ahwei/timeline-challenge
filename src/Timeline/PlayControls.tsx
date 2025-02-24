import React, { useCallback, useEffect, useRef } from "react";
import { MAX_VALUE, MIN_VALUE, STEP } from "./constants";

type PlayControlsProps = {
  time: number;
  maxDuration: number;
  onUpdateTime: (value: string) => void;
  onUpdateMaxDuration: (value: string) => void;
  maxValue?: number;
  minValue?: number;
};

export const PlayControls = ({
  time,
  maxDuration,
  onUpdateTime,
  onUpdateMaxDuration,
  maxValue = MAX_VALUE,
  minValue = MIN_VALUE,
}: PlayControlsProps) => {
  const currentTimeInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

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

      if (
        inputType === "stepUp" ||
        inputType === "stepDown" ||
        (inputType !== "deleteContentBackward" && inputType !== "insertText")
      ) {
        e.target.select();
        updateFn(newValue);
      }
    },
    [],
  );

  useEffect(() => {
    if (currentTimeInputRef.current) {
      currentTimeInputRef.current.value = String(time);
    }
  }, [time]);

  useEffect(() => {
    if (durationInputRef.current) {
      durationInputRef.current.value = String(maxDuration);
    }
  }, [maxDuration]);

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
          onChange={(e) => handleChange(e, onUpdateTime)}
          onKeyDown={(e) => handleKeyDown(e, onUpdateTime, String(time))}
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
          defaultValue={maxDuration}
          onKeyDown={(e) =>
            handleKeyDown(e, onUpdateMaxDuration, String(maxDuration))
          }
          onChange={(e) => handleChange(e, onUpdateMaxDuration)}
          onFocus={handleFocus}
          onBlur={() => {
            if (durationInputRef.current) {
              durationInputRef.current.value = String(maxDuration);
            }
          }}
        />
        Duration
      </fieldset>
    </div>
  );
};
