import { BREAKPOINTS, COLOR } from "@/styles";
import styled from "styled-components";

export const NewBotContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  padding: 24px;
  gap: 20px;
  flex-direction: column;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    gap: 16px;
  }
`;

export const NewBotWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

export const SourceSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: stretch;
  gap: 20px;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    flex-direction: column;
  }
`;

export const SourceSection = styled.div`
  max-width: 520px;
  min-width: 350px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.03),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    max-width: 100%;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px;
  }
`;

export const UrlSectionWrapper = styled(SourceSection)`
  width: 100%;
  max-width: 1060px;
`;

export const ResultSectionWrapper = styled(SourceSection)`
  width: 100%;
  max-width: 700px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
`;

export const SectionDesc = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.TEXT_SECONDARY};
  margin: 0;
`;

export const FileUploadZone = styled.label`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  border: 2px dashed ${COLOR.BORDER};
  border-radius: 16px;
  background-color: ${COLOR.LIGHT};
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  text-align: center;
  min-width: 0;
  overflow: hidden;
 
  &:hover {
    border-color: ${COLOR.PRIMARY};
    background-color: rgba(168, 225, 12, 0.05);
  }
 
  strong {
    font-size: 18px;
    color: ${COLOR.DARK};
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
 
  span {
    font-size: 14px;
    color: ${COLOR.TEXT_SECONDARY};
  }
 
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 32px 16px;
    min-height: 160px;
 
    strong {
      font-size: 16px;
    }
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  flex: 1;
  padding: 24px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 16px;
  font-size: 15px;
  min-height: 200px;
  background-color: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
 
  &:focus {
    outline: none;
    background-color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }
 
  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }
 
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    min-height: 160px;
    font-size: 14px;
  }
`;


export const Input = styled.input`
  width: 100%;
  padding: 24px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 16px;
  font-size: 15px;
  background-color: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background-color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    font-size: 14px;
  }
`;

export const SubmitButton = styled.button`
  width: fit-content;
  padding: 16px 32px;
  background-color: ${COLOR.PRIMARY};
  color: #2e2e2e;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 225, 12, 0.3);

  &:hover {
    background-color: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 100%;
  }
`;

export const ResultSummary = styled.div`
  background: ${COLOR.LIGHT};
  padding: 24px;
  border-radius: 16px;
  text-align: left;
`;

export const ResultItem = styled.div<{ $success: boolean }>`
  display: flex;
  gap: 12px;
  color: ${({ $success }) => ($success ? COLOR.DARK : "#ef4444")};
  font-weight: 500;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 0;
  width: 100%;
  animation: fadeIn 0.5s ease-out;
`;

export const CircularProgressBox = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SvgCircle = styled.svg`
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
`;

export const ProgressCircleBg = styled.circle`
  fill: none;
  stroke: ${COLOR.LIGHT};
  stroke-width: 8;
`;

export const ProgressCircleFill = styled.circle<{ $percent: number }>`
  fill: none;
  stroke: ${COLOR.PRIMARY};
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 339.292;
  stroke-dashoffset: ${({ $percent }) => 339.292 - (339.292 * $percent) / 100};
  transition: stroke-dashoffset 0.4s ease-out;
`;

export const PercentageText = styled.div`
  position: absolute;
  font-size: 24px;
  font-weight: 800;
  color: ${COLOR.DARK};
  display: flex;
  align-items: baseline;

  span {
    font-size: 14px;
    font-weight: 600;
    margin-left: 2px;
  }
`;

export const StatusLabel = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 10px 0;
  text-align: center;
  min-height: 30px;
`;

export const ProgressSubText = styled.p`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  margin-top: 5px;
  font-weight: 500;
`;

export const ErrorText = styled.div`
  text-align: center;
  color: #ef4444;
  font-size: 14px;
`;