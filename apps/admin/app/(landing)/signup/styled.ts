import styled, { keyframes } from "styled-components";
import Link from "next/link";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const BannerSection = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.dark};
  background-image:
    radial-gradient(at 0% 0%, #1a1a1a 0, transparent 50%),
    radial-gradient(at 100% 0%, #333333 0, transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 64px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A8E10C' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const BannerContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 480px;
  animation: ${fadeIn} 0.8s ease-out;
`;

export const Logo = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Quote = styled.blockquote`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.3;
  margin: 0 0 24px 0;
`;

export const Author = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: ${({ theme }) => theme.colors.white};

  @media (max-width: 768px) {
    padding: 24px;
    align-items: flex-start;
    padding-top: 80px;
  }
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 12px;
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 16px;
  transition: all 0.2s;
  background: ${({ theme }) => theme.colors.light};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.white};
    box-shadow: 0 0 0 3px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const PasswordInputWrapper = styled.div`
  position: relative;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(168, 225, 12, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  padding: 12px;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SuccessMessage = styled.div`
  padding: 12px;
  background: #dcfce7;
  color: #15803d;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const LinkText = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
