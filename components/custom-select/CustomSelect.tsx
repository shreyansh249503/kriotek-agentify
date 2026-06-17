"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import {
  CheckIcon,
  DropdownMenu,
  Option,
  OptionLabel,
  SelectButton,
  SelectContainer,
} from "./styled";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const CustomSelect = ({
  value,
  onChange,
  options,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <SelectContainer ref={containerRef}>
      <SelectButton
        type="button"
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.label || "Select an option"}
      </SelectButton>
      <DropdownMenu $isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            $isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
          >
            <OptionLabel $isSelected={option.value === value}>
              {option.label}
            </OptionLabel>
            {option.value === value && (
              <CheckIcon>
                <CheckCircleIcon size={20} weight="duotone" />
              </CheckIcon>
            )}
          </Option>
        ))}
      </DropdownMenu>
    </SelectContainer>
  );
};
