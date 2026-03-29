"use client";

import React, { useState, useCallback } from "react";
import {
  SearchBarContainer,
  SearchInput,
  SearchIcon,
  ClearButton,
} from "./styled";
import { MagnifyingGlassIcon, XCircleIcon } from "@phosphor-icons/react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
}) => {
  const [value, setValue] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setTimeoutId(newTimeoutId);
    },
    [debounceMs, onSearch, timeoutId],
  );

  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [onSearch, timeoutId]);

  return (
    <SearchBarContainer>
      <SearchIcon>
        <MagnifyingGlassIcon weight="bold" />
      </SearchIcon>
      <SearchInput
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {value && (
        <ClearButton onClick={handleClear} aria-label="Clear search">
          <XCircleIcon weight="fill" size={24} />
        </ClearButton>
      )}
    </SearchBarContainer>
  );
};
