"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { debounce } from "lodash";

interface IsolatedTextFieldProps extends Omit<TextFieldProps, "value" | "onChange"> {
  value: string;
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
  syncOnBlur?: boolean;
}

export default function IsolatedTextField({ value: externalValue, onDebouncedChange, debounceMs = 300, syncOnBlur = true, ...textFieldProps }: IsolatedTextFieldProps) {
  const [localValue, setLocalValue] = useState(externalValue);
  const isInitialMount = useRef(true);

  // Debounced function to update external state
  const debouncedUpdate = useCallback(
    debounce((newValue: string) => {
      onDebouncedChange(newValue);
    }, debounceMs),
    [onDebouncedChange, debounceMs]
  );

  // Sync local state with external value when it changes from outside
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only sync if external value is different from local value
    if (externalValue !== localValue) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  // Handle local input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);

    // Trigger debounced update to external state
    debouncedUpdate(newValue);
  };

  // Handle blur event for immediate sync if enabled
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (syncOnBlur && localValue !== externalValue) {
      // Cancel any pending debounced update and sync immediately
      debouncedUpdate.cancel();
      onDebouncedChange(localValue);
    }

    // Call original onBlur if provided
    if (textFieldProps.onBlur) {
      textFieldProps.onBlur(event);
    }
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return <TextField {...textFieldProps} value={localValue} onChange={handleChange} onBlur={handleBlur} />;
}
