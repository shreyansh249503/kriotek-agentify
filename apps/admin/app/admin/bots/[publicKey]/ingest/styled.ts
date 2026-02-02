import styled from "styled-components";

export const NewBotContainer = styled.div`
  width: 100%;
  min-height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const NewBotWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  animation: slideIn 0.4s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const NewBotTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  background: #4f46e5;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  text-align: center;
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  padding: 6px;
  background: #f3f4f6;
  border-radius: 12px;
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.isActive ? "#4f46e5" : "transparent")};
  color: ${(props) => (props.isActive ? "#ffffff" : "#6b7280")};
  box-shadow: ${(props) =>
    props.isActive ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "none"};
  transform: ${(props) => (props.isActive ? "translateY(-2px)" : "none")};

  &:hover {
    color: ${(props) => (props.isActive ? "#ffffff" : "#374151")};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const FormSection = styled.div`
  width: 100%;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  resize: vertical;
  transition: all 0.3s ease;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const SubmitButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  background: ${(props) => (props.disabled ? "#d1d5db" : "#4f46e5")};
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.disabled ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)"};
  transform: ${(props) => (props.disabled ? "none" : "translateY(0)")};

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.disabled ? "none" : "0 6px 16px rgba(102, 126, 234, 0.5)"};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "translateY(0)")};
  }
`;

export const LoadingText = styled.p`
  text-align: center;
  color: #667eea;
  font-size: 16px;
  font-weight: 500;
  margin: 20px 0;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const ErrorText = styled.p`
  text-align: center;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
`;

export const SuccessContainer = styled.div`
  text-align: center;
  animation: scaleIn 0.4s ease-out;

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const ChunksText = styled.p`
  font-size: 16px;
  color: #374151;
  margin-bottom: 24px;

  b {
    color: #667eea;
    font-size: 20px;
  }
`;
