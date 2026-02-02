import styled from "styled-components";

export const PickerWrapper = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  /* max-width: 350px; */
  color: white;
  font-family: inherit;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  height: 200px;
`;

export const Header = styled.div`
  background: #f9fafb;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

export const ColorPreview = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
`;

export const HexText = styled.span`
  color: black;
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
`;

export const BodyContainer = styled.div`
  display: flex;
  padding: 12px;
  gap: 12px;
  height: 150px;
`;

// Saturation Map
export const SaturationArea = styled.div<{ $hue: number }>`
  position: relative;
  flex: 1;
  height: 100%;
  border-radius: 4px;
  background-color: ${(props) => `hsl(${props.$hue}, 100%, 50%)`};
  background-image:
    linear-gradient(to right, #fff, transparent),
    linear-gradient(to top, #000, transparent);
  cursor: crosshair;
  touch-action: none;
  overflow: hidden;
  border: 1px solid #b2b2b2ff;
`;

export const Thumb = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

// Hue Slider
export const HueSliderContainer = styled.div`
  position: relative;
  width: 24px;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(
    to bottom,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
  cursor: pointer;
  touch-action: none;
`;

export const HueThumb = styled.div`
  position: absolute;
  left: 50%;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: transparent;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

// Hidden input for logic but visible representation is in Header
export const HiddenInput = styled.input`
  display: none;
`;
