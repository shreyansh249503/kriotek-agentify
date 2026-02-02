import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoaderContainer = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${(props) => (props.$fullScreen ? "100vh" : "100%")};
  min-height: 200px;
`;

export const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(229, 231, 235, 0.5);
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
