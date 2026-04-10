import styled from "styled-components";

export const EmbedSuccessContainer = styled.div`
  margin-top: 32px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
`;
export const EmbedSuccessTitle = styled.h3`
  margin-bottom: 16px;
`;
export const InnerEmbedSuccessContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
`;
export const TabButton = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? "#111" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#555")};
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
`;
export const Description = styled.p`
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
`;
export const CodeContainer = styled.div`
  min-width: 326px;
  position: relative;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
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
  padding: 16px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  font-family: monospace;
`;
export const CodePublicKeyContainer = styled.p`
  margin-top: 16px;
  font-size: 14px;
  color: #555;
`;
export const CodePublicKey = styled.code`
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
`;