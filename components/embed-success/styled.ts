import styled from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

export const EmbedSuccessContainer = styled.div`
  width: 100%;
  min-height: 500px;
  padding: 24px;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 16px;
  background: ${COLOR.CREAM}44;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    border-radius: 12px;
  }
`;
export const EmbedSuccessTitle = styled.h3`
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.DARK};

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;
export const InnerEmbedSuccessContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${COLOR.BORDER};
  padding-bottom: 12px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
`;
export const TabButton = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? COLOR.DARK : "transparent")};
  color: ${(props) => (props.active ? COLOR.WHITE : COLOR.TEXT_SECONDARY)};
  border: none;
  padding: 8px 16px;
  border-radius: 99px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? COLOR.DARK : COLOR.LIGHT)};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
`;
export const Description = styled.p`
  margin-bottom: 16px;
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.5;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 13px;
    margin-bottom: 12px;
  }
`;
export const CodeContainer = styled.div`
  width: 100%;
  min-width: 0;
  position: relative;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;
export const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #222;
  border-bottom: 1px solid #333;
`;
export const CodeFileName = styled.span`
  font-size: 12px;
  color: #888;
  font-family: monospace;
`;
export const CodeCopyButton = styled.button<{ copied: boolean }>`
  background: transparent;
  border: none;
  color: ${(props) => (props.copied ? "#4caf50" : "#fff")};
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;
export const CodePre = styled.pre`
  text-align: left;
  color: #e6e6e6;
  padding: 20px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  font-family: "Fira Code", "Courier New", monospace;
  background: rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 16px;
    font-size: 12px;
  }
`;
export const CodePublicKeyContainer = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 13px;
    margin-top: 16px;
  }
`;

export const CodePublicKey = styled.code`
  background: #a8e10e;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  color: ${COLOR.DARK};
  border: 1px solid ${COLOR.BORDER};
`;