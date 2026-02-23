"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PickerWrapper,
  SaturationArea,
  Thumb,
  MiddleRow,
  HueSliderContainer,
  HueThumb,
  CircularPreview,
  InputsGrid,
  InputGroup,
  PillInput,
  InputLabel,
  Divider,
  SwatchesGrid,
  SwatchCircle,
  ResetButton,
} from "./styled";
import { hexToHsv, hsvToHex, isValidHex, hsvToRgb } from "./utils";
interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

const PRESET_COLORS = [
  "#C53030",
  "#F56565",
  "#ECC94B",
  "#C0CA33",
  "#98D8AA",
  "#90CDF4",
  "#4299E1",
  "#7B61FF",
  "#B068C8",
  "#F687B3",
  "#2D3748",
  "#4A5568",
  "#A0AEC0",
  "#CBD5E0",
];

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [hsv, setHsv] = useState(() =>
    isValidHex(value) ? hexToHsv(value) : { h: 250, s: 70, v: 90 },
  );
  const [isDraggingSat, setIsDraggingSat] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const satRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (isValidHex(value)) {
      const newHsv = hexToHsv(value);
      setHsv(newHsv);
    }
  }

  const updateColor = useCallback(
    (newHsv: { h: number; s: number; v: number }) => {
      setHsv(newHsv);
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    },
    [onChange],
  );

  const handleSaturationMove = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      if (!satRef.current) return;
      const rect = satRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      let x = (clientX - rect.left) / rect.width;
      let y = (clientY - rect.top) / rect.height;

      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      updateColor({ ...hsv, s: x * 100, v: 100 - y * 100 });
    },
    [hsv, updateColor],
  );

  const handleHueMove = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;

      let x = (clientX - rect.left) / rect.width;
      x = Math.max(0, Math.min(1, x));

      updateColor({ ...hsv, h: x * 360 });
    },
    [hsv, updateColor],
  );

  useEffect(() => {
    const handleUp = () => {
      setIsDraggingSat(false);
      setIsDraggingHue(false);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingSat) handleSaturationMove(e);
      if (isDraggingHue) handleHueMove(e);
    };

    if (isDraggingSat || isDraggingHue) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDraggingSat, isDraggingHue, handleSaturationMove, handleHueMove]);

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  const [hexInput, setHexInput] = useState(currentHex.replace("#", ""));
  const [prevHex, setPrevHex] = useState(currentHex);

  if (currentHex !== prevHex) {
    setPrevHex(currentHex);
    setHexInput(currentHex.replace("#", ""));
  }

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (isValidHex(val)) {
      updateColor(hexToHsv(val));
    }
  };

  const handleRgbInput = (channel: "r" | "g" | "b", val: string) => {
    const num = parseInt(val) || 0;
    const clamped = Math.max(0, Math.min(255, num));
    const newRgb = { ...rgb, [channel]: clamped };
    const hex = `#${newRgb.r.toString(16).padStart(2, "0")}${newRgb.g.toString(16).padStart(2, "0")}${newRgb.b.toString(16).padStart(2, "0")}`;
    updateColor(hexToHsv(hex));
  };

  return (
    <PickerWrapper>
      <SaturationArea
        ref={satRef}
        $hue={hsv.h}
        onMouseDown={() => setIsDraggingSat(true)}
        onTouchStart={() => setIsDraggingSat(true)}
      >
        <Thumb
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: currentHex,
          }}
        />
      </SaturationArea>

      <MiddleRow>
        <HueSliderContainer
          ref={hueRef}
          onMouseDown={() => setIsDraggingHue(true)}
          onTouchStart={() => setIsDraggingHue(true)}
        >
          <HueThumb style={{ left: `${(hsv.h / 360) * 100}%` }} />
        </HueSliderContainer>
        <CircularPreview style={{ backgroundColor: currentHex }} />
      </MiddleRow>

      <InputsGrid>
        <InputGroup>
          <PillInput
            value={hexInput.toUpperCase()}
            onChange={(e) => handleHexInput(e.target.value)}
            spellCheck={false}
          />
          <InputLabel>Hex</InputLabel>
        </InputGroup>
        <InputGroup>
          <PillInput
            value={rgb.r}
            onChange={(e) => handleRgbInput("r", e.target.value)}
          />
          <InputLabel>R</InputLabel>
        </InputGroup>
        <InputGroup>
          <PillInput
            value={rgb.g}
            onChange={(e) => handleRgbInput("g", e.target.value)}
          />
          <InputLabel>G</InputLabel>
        </InputGroup>
        <InputGroup>
          <PillInput
            value={rgb.b}
            onChange={(e) => handleRgbInput("b", e.target.value)}
          />
          <InputLabel>B</InputLabel>
        </InputGroup>
      </InputsGrid>

      <Divider />

      <SwatchesGrid>
        {PRESET_COLORS.map((color) => (
          <SwatchCircle
            key={color}
            $color={color}
            onClick={() => updateColor(hexToHsv(color))}
          />
        ))}
      </SwatchesGrid>

      <ResetButton onClick={() => updateColor(hexToHsv("#4f46e5"))}>
        Reset color
      </ResetButton>
    </PickerWrapper>
  );
};
