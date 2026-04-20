import styled from "styled-components";
import { BREAKPOINTS } from "@/styles";
export const PickerWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid #e2e8f0;
  font-family: inherit;
`;

export const SaturationArea = styled.div<{ $hue: number }>`
  position: relative;
  width: 100%;
  height: 135px;
  border-radius: 8px;
  background-color: ${(props) => `hsl(${props.$hue}, 100%, 50%)`};
  border: 1px solid #e2e8f0;
  background-image:
    linear-gradient(to right, #fff, transparent),
    linear-gradient(to top, #000, transparent);
  cursor: crosshair;
  touch-action: none;
  overflow: hidden;
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

export const MiddleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
`;

export const HueSliderContainer = styled.div`
  position: relative;
  flex: 1;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    to right,
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
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

export const CircularPreview = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
`;

export const InputsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 0 4px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const PillInput = styled.input`
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-align: center;
  outline: none;

  &:focus {
    border-color: #4f46e5;
    background: white;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 4px;
    font-size: 10px;
  }
`;

export const InputLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
`;

export const Divider = styled.div`
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
`;

export const SwatchesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
  justify-content: flex-start;
`;

export const SwatchCircle = styled.div<{ $color: string }>`
  /* aspect-ratio: 1; */
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }
`;

export const ResetButton = styled.button`
  width: 100%;
  padding: 8px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: -4px;
  margin-bottom: -4px;
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: #94a3b8;
  display: flex;
  align-items: center;

  &:hover {
    color: #4f46e5;
  }
`;
