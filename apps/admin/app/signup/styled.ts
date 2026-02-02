import styled from "styled-components";

export const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 80% 20%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
  }
`;

export const AuthCard = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    padding: 40px 24px;
  }
`;

export const LogoSection = styled.div`
  text-align: center;
`;

export const LogoText = styled.h1`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
`;

export const FormSection = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FormTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  text-align: center;
`;

export const FormSubtitle = styled.p`
  font-size: 15px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  font-family: inherit;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
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

export const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #4f46e5;
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
  background: ${(props) =>
    props.disabled
      ? "#d1d5db"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.disabled ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)"};
  margin-top: 8px;

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.disabled ? "none" : "0 6px 16px rgba(102, 126, 234, 0.5)"};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "translateY(0)")};
  }
`;

export const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  color: #059669;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FooterText = styled.p`
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 24px;
`;

export const FooterLink = styled.a`
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #764ba2;
    text-decoration: underline;
  }
`;
