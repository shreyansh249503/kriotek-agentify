import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0.4); }
  50% { transform: scale(1.03); box-shadow: 0 0 0 8px rgba(168, 225, 12, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 225, 12, 0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const AboutSection = styled.section`
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

export const AboutContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 2;
  gap: 100px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    gap: 70px;
  }
`;

export const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  max-width: 850px;
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
  max-width: 700px;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 16px;
  }
`;

export const StatsSection = styled.div`
  width: 100%;
  animation: ${fadeIn} 1s ease-out;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  padding: 36px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-5px);
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 15px 35px rgba(168, 225, 12, 0.1);
  }
`;

export const StatNumber = styled.span`
  font-size: 48px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, ${COLOR.DARK} 30%, ${COLOR.PRIMARY_HOVER} 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const StatLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${COLOR.TEXT_SECONDARY};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const InteractiveRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

export const MissionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SectionHeader = styled.h2`
  font-size: 38px;
  font-weight: 800;
  color: ${COLOR.DARK};
  letter-spacing: -0.02em;
  line-height: 1.2;

  span {
    color: ${COLOR.PRIMARY_HOVER};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 28px;
  }
`;

export const SectionParagraph = styled.p`
  font-size: 16px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
`;

export const IllustrativeContainer = styled.div`
  background: ${COLOR.CREAM};
  border: 2px dashed ${COLOR.PRIMARY};
  border-radius: 32px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  min-height: 350px;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(168, 225, 12, 0.1);

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 24px;
    min-height: auto;
  }
`;

export const DemoAgentWidget = styled.div`
  background: ${COLOR.WHITE};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 2;
  border: 1px solid ${COLOR.BORDER};
`;

export const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid ${COLOR.LIGHT};
  padding-bottom: 12px;
`;

export const WidgetAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${COLOR.PRIMARY};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${COLOR.DARK};
`;

export const WidgetTitleInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const WidgetName = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: ${COLOR.DARK};
`;

export const WidgetStatus = styled.span`
  font-size: 11px;
  color: ${COLOR.PRIMARY_HOVER};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    background: ${COLOR.PRIMARY_HOVER};
    border-radius: 50%;
  }
`;

export const MessageBubble = styled.div<{ $isSender?: boolean }>`
  background: ${props => props.$isSender ? COLOR.PRIMARY + "22" : COLOR.LIGHT};
  color: ${COLOR.DARK};
  padding: 12px 16px;
  border-radius: ${props => props.$isSender ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  font-size: 13.5px;
  max-width: 85%;
  align-self: ${props => props.$isSender ? "flex-end" : "flex-start"};
  line-height: 1.4;
`;

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 48px;
`;

export const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const ValueCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.01);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-5px);
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.05);
  }
`;

export const ValueIconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: ${COLOR.BACKGROUND_2};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.DARK};
  font-size: 24px;
  border: 1px solid ${COLOR.BORDER};
`;

export const ValueTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: ${COLOR.DARK};
`;

export const ValueDesc = styled.p`
  font-size: 15px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.6;
`;

export const TimelineContainer = styled.div`
  position: relative;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 40px;
    width: 2px;
    background: ${COLOR.BORDER};

    @media (max-width: ${BREAKPOINTS.MOBILE}) {
      left: 20px;
    }
  }
`;

export const TimelineItem = styled.div`
  position: relative;
  padding-left: 90px;
  margin-bottom: 60px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding-left: 50px;
  }
`;

export const TimelineDot = styled.div`
  position: absolute;
  left: 29px;
  top: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${COLOR.WHITE};
  border: 4px solid ${COLOR.PRIMARY};
  z-index: 2;
  box-shadow: 0 0 0 4px ${COLOR.CREAM};

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    left: 9px;
  }
`;

export const TimelineContentCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 12px 30px rgba(168, 225, 12, 0.08);
  }
`;

export const TimelineYear = styled.span`
  background: ${COLOR.BACKGROUND_2};
  color: ${COLOR.DARK};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid ${COLOR.BORDER};
  display: inline-block;
  margin-bottom: 12px;
`;

export const TimelineTitle = styled.h4`
  font-size: 18px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin-bottom: 8px;
`;

export const TimelineDesc = styled.p`
  font-size: 14.5px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.5;
`;

export const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
  }
`;

export const TeamCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-5px);
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);

    .avatar-wrapper {
      transform: scale(1.05);
      background: ${COLOR.PRIMARY};
      color: ${COLOR.DARK};
    }
  }
`;

export const TeamAvatarWrapper = styled.div.attrs({ className: 'avatar-wrapper' })`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${COLOR.CREAM};
  border: 2px solid ${COLOR.PRIMARY};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(168, 225, 12, 0.1);
`;

export const TeamName = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${COLOR.DARK};
  margin-bottom: 4px;
`;

export const TeamRole = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: ${COLOR.PRIMARY_HOVER};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  display: inline-block;
`;

export const TeamBio = styled.p`
  font-size: 13.5px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.5;
`;

export const CTASection = styled.div`
  width: 100%;
  animation: ${fadeIn} 1s ease-out;
`;

export const CTABox = styled.div`
  background: ${COLOR.DARK};
  border-radius: 32px;
  padding: 60px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(168, 225, 12, 0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 40px 20px;
  }
`;

export const CTATitle = styled.h2`
  font-size: 38px;
  font-weight: 800;
  color: ${COLOR.WHITE};
  letter-spacing: -0.02em;
  max-width: 600px;
  z-index: 1;

  span {
    color: ${COLOR.PRIMARY};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 28px;
  }
`;

export const CTADesc = styled.p`
  font-size: 17px;
  color: ${COLOR.WHITE}AA;
  line-height: 1.6;
  max-width: 500px;
  z-index: 1;
`;

export const CTAButton = styled.button`
  padding: 16px 36px;
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
  z-index: 1;
  animation: ${pulse} 3s infinite;

  &:hover {
    background: ${COLOR.PRIMARY_HOVER};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(168, 225, 12, 0.45);
  }

  &:active {
    transform: translateY(0);
  }
`;
