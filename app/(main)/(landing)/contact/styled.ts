import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(168, 225, 12, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0); }
`;

export const ContactSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 140px 24px 100px;
  background: linear-gradient(180deg, ${COLOR.WHITE} 0%, ${COLOR.LIGHT} 100%);
  background-image: radial-gradient(circle at 1px 1px, ${COLOR.BORDER} 1.5px, transparent 0);
  background-size: 48px 48px;
  position: relative;
  overflow: hidden;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 100px 20px 60px;
  }
`;

export const ContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 2;
  gap: 80px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    gap: 50px;
  }
`;

export const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  max-width: 800px;
  animation: ${fadeIn} 0.8s ease-out;
`;

export const Badge = styled.span`
  background: ${COLOR.BACKGROUND_2};
  color: ${COLOR.DARK};
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid ${COLOR.BORDER};
  box-shadow: 0 2px 10px rgba(168, 225, 12, 0.15);
`;

export const PageTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.03em;
  line-height: 1.1;

  span {
    background: linear-gradient(135deg, ${COLOR.DARK} 0%, ${COLOR.PRIMARY_HOVER} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 40px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 32px;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 20px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  max-width: 600px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 16px;
  }
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  width: 100%;
  align-items: start;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

export const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const InfoHeader = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.02em;
  line-height: 1.2;

  span {
    color: ${COLOR.PRIMARY_HOVER};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 24px;
  }
`;

export const InfoText = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  margin-top: -10px;
`;

export const InfoCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const InfoCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-3px);
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 10px 25px rgba(168, 225, 12, 0.08);
  }
`;

export const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: ${COLOR.BACKGROUND_2};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.DARK};
  font-size: 22px;
  border: 1px solid ${COLOR.BORDER};
  flex-shrink: 0;
`;

export const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InfoTitle = styled.h3`
  font-size: 15px;
  font-weight: 800;
  color: ${COLOR.DARK};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const InfoDetail = styled.span`
  font-size: 15px;
  color: ${COLOR.TEXT};
  font-weight: 500;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${COLOR.PRIMARY_HOVER};
    }
  }
`;

export const SocialWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
`;

export const SocialTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: ${COLOR.TEXT_SECONDARY};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const SocialLinksList = styled.div`
  display: flex;
  gap: 12px;
`;

export const SocialLinkItem = styled.a`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.DARK};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${COLOR.PRIMARY};
    border-color: ${COLOR.PRIMARY};
    color: ${COLOR.DARK};
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 15px rgba(168, 225, 12, 0.25);
  }
`;

export const FormColumn = styled.div`
  width: 100%;
`;

export const FormCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 28px;
  padding: 48px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 28px 20px;
  }
`;

export const ContactFormElement = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: ${COLOR.DARK};
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: ${COLOR.LIGHT}50;
  font-size: 15px;
  color: ${COLOR.DARK};
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY_HOVER};
    background: ${COLOR.WHITE};
    box-shadow: 0 0 0 4px ${COLOR.PRIMARY}22;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: ${COLOR.LIGHT}50;
  font-size: 15px;
  color: ${COLOR.DARK};
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%232E2E2E' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY_HOVER};
    background: ${COLOR.WHITE};
    box-shadow: 0 0 0 4px ${COLOR.PRIMARY}22;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid ${COLOR.BORDER};
  background: ${COLOR.LIGHT}50;
  font-size: 15px;
  color: ${COLOR.DARK};
  font-family: inherit;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY_HOVER};
    background: ${COLOR.WHITE};
    box-shadow: 0 0 0 4px ${COLOR.PRIMARY}22;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 225, 12, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(46, 46, 46, 0.1);
  border-top-color: ${COLOR.DARK};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  gap: 24px;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const SuccessIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${COLOR.BACKGROUND_2};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.PRIMARY_HOVER};
  font-size: 38px;
  border: 2px solid ${COLOR.PRIMARY};
  animation: ${pulse} 2.5s infinite;
`;

export const SuccessTitle = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: ${COLOR.DARK};
`;

export const SuccessMessage = styled.p`
  font-size: 15.5px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
  max-width: 380px;
`;

export const ResetButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  border: 1px solid ${COLOR.BORDER};
  background: ${COLOR.WHITE};
  color: ${COLOR.DARK};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${COLOR.LIGHT};
    border-color: ${COLOR.PRIMARY};
  }
`;
