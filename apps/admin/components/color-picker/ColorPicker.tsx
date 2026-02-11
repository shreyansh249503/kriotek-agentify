"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PickerWrapper,
  Header,
  BodyContainer,
  SaturationArea,
  Thumb,
  HueSliderContainer,
  HueThumb,
  ColorPreview,
  HexText,
} from "./styled";
import { hexToHsv, hsvToHex, isValidHex } from "./utils";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [hsv, setHsv] = useState({ h: 250, s: 70, v: 90 });
  const [isDraggingSat, setIsDraggingSat] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const satRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isValidHex(value)) {
      const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
      if (value.toLowerCase() !== currentHex.toLowerCase()) {
        const newHsv = hexToHsv(value);
        // eslint-disable-next-line
        setHsv(newHsv);
      }
    }
  }, [value, hsv]);

  const handleSaturationMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!satRef.current) return;
      const rect = satRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      let x = (clientX - rect.left) / rect.width;
      let y = (clientY - rect.top) / rect.height;

      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      const s = x * 100;
      const v = 100 - y * 100;

      const newHsv = { ...hsv, s, v };
      setHsv(newHsv);
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    },
    [hsv, onChange],
  );

  const handleHueMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      let y = (clientY - rect.top) / rect.height;
      y = Math.max(0, Math.min(1, y));

      const h = y * 360;
      const newHsv = { ...hsv, h };
      setHsv(newHsv);
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    },
    [hsv, onChange],
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

  return (
    <PickerWrapper>
      <Header>
        <ColorPreview style={{ backgroundColor: currentHex }} />
        <HexText>{currentHex}</HexText>
      </Header>

      <BodyContainer>
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

        <HueSliderContainer
          ref={hueRef}
          onMouseDown={() => setIsDraggingHue(true)}
          onTouchStart={() => setIsDraggingHue(true)}
        >
          <HueThumb
            style={{
              top: `${(hsv.h / 360) * 100}%`,
            }}
          />
        </HueSliderContainer>
      </BodyContainer>
    </PickerWrapper>
  );
};
