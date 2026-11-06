import styled, { keyframes } from "styled-components";
import { BREAKPOINTS, COLOR } from "@/styles";
import Image from "next/image";
import Link from "next/link";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-20px) translateX(10px); }
  100% { transform: translateY(0px) translateX(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(1); opacity: 0.3; }
`;

const orbit = keyframes`
  from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
`;

const stream = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const blink = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
`;

export const HeroSection = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLOR.LIGHT};
  background-image:
    radial-gradient(at 0% 0%, ${COLOR.CREAM} 0, transparent 50%),
    radial-gradient(at 100% 0%, ${COLOR.BACKGROUND} 0, transparent 50%);
  position: relative;
  overflow: hidden;
  padding-top: 80px;
  box-sizing: border-box;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    padding-top: 120px;
    padding-bottom: 60px;
    height: auto;
    min-height: 80vh;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_PORTRAIT}) {
    padding-top: 110px;
    padding-bottom: 50px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding-top: 100px;
    padding-bottom: 40px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE_SM}) {
    padding-top: 90px;
    padding-bottom: 30px;
  }

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A8E10C' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
    z-index: 1;
  }
`;

export const HeroContentContainer = styled.div`
  width: 80%;
  max-width: 1800px;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  z-index: 2;

  @media (max-width: ${BREAKPOINTS.WIDE}) {
    max-width: 1400px;
  }

  @media (max-width: ${BREAKPOINTS.LAPTOP}) {
    max-width: 1200px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 90%;
    min-height: auto;
    flex-direction: column;
    justify-content: center;
    gap: 40px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_PORTRAIT}) {
    width: 92%;
    gap: 34px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    width: 95%;
    gap: 28px;
  }
`;

export const HeroContent = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 35px;

  @media (max-width: 1214px) {
    gap: 20px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
    align-items: center;
    text-align: center;
    gap: 25px;
  }
`;

export const MainHeading = styled.h1`
  font-size: 60px;
  font-weight: 800;
  line-height: 1.1;
  color: ${COLOR.DARK};
  animation: ${fadeIn} 0.8s ease-out;

  span {
    position: relative;
    font-weight: 700;
    color: ${COLOR.PRIMARY};
    z-index: 2;
    display: inline-block;
  }

  @media (min-width: ${BREAKPOINTS.ULTRAWIDE}) {
    font-size: 72px;
  }

  @media (max-width: ${BREAKPOINTS.WIDE}) {
    font-size: 50px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    font-size: 48px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 40px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_PORTRAIT}) {
    font-size: 36px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 30px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE_SM}) {
    font-size: 26px;
  }
`;

export const UnderlineImage = styled(Image)`
  position: absolute;
  bottom: -10px;
  left: 0px;
  width: 100%;
  max-width: 250px;
  height: auto;
  z-index: 2;
  object-fit: contain;

  @media (min-width: ${BREAKPOINTS.ULTRAWIDE}) {
    max-width: 280px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    max-width: 190px;
    bottom: -8px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    max-width: 170px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_PORTRAIT}) {
    max-width: 150px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    max-width: 130px;
    bottom: -6px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE_SM}) {
    max-width: 110px;
    bottom: -4px;
  }
`;

export const SubHeading = styled.p`
  font-size: 18px;
  color: ${COLOR.TEXT_SECONDARY};
  max-width: 710px;
  line-height: 1.6;
  margin: 0;
  animation: ${fadeIn} 0.8s ease-out 0.2s backwards;

  @media (min-width: ${BREAKPOINTS.WIDE}) {
    font-size: 18px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    font-size: 16px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 14px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE_SM}) {
    font-size: 13.5px;
  }
`;

export const TagContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.8s ease-out 0.6s backwards;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    justify-content: center;
    gap: 10px;
  }
`;

export const TagButton = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  background-color: ${COLOR.WHITE};
  color: ${COLOR.DARK};
  font-size: 14px;
  font-weight: 600;
  animation: ${fadeIn} 0.8s ease-out 0.6s backwards;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 8px 14px;
    font-size: 13px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE_SM}) {
    padding: 6px 12px;
    font-size: 12px;
  }

  .check-icon {
    font-size: 16px;
    color: ${COLOR.DARK};
  }
`;

export const HeroChatBotContainer = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    width: 100%;
    margin-top: 10px;
  }
`;

export const HeroChatBotMainWrapper = styled.div`
  width: 100%;
  max-width: 350px;
  height: auto;
  aspect-ratio: 460 / 650;
  max-height: 650px;

  @media (min-width: ${BREAKPOINTS.ULTRAWIDE}) {
    max-width: 500px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    max-width: 400px;
    display: none;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_PORTRAIT}) {
    max-width: 360px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    max-width: 300px;
    border-radius: 12px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE_SM}) {
    max-width: 260px;
  }
`;

export const ChatBotPriviewImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const CTAContainer = styled.div`
  display: flex;
  gap: 20px;
  animation: ${fadeIn} 0.8s ease-out 0.4s backwards;

  @media (max-width: 1214px) {
    flex-direction: column;
    gap: 14px;
  }

  @media (max-width: 1050px) {
    flex-direction: row;
    gap: 14px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_PORTRAIT}) {
    gap: 14px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    gap: 12px;

    & > * {
      width: 100% !important;
      text-align: center;
    }
  }
`;

export const WatchDemoButton = styled(Link)`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${COLOR.WHITE};
  color: ${COLOR.DARK};
  padding: 16px 38px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-family: inherit;
  box-shadow: 0 0px 5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE}) {
    padding: 14px 30px;
    font-size: 15px;
  }

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: 14px 26px;
    font-size: 15px;
    border-radius: 10px;
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 12px 20px;
    font-size: 14px;
    gap: 6px;
    border-radius: 8px;
  }
`;

export const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

export const AINode = styled.div<{
  $delay?: string;
  $size?: string;
  $top?: string;
  $left?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "20%"};
  left: ${({ $left }) => $left || "20%"};
  width: ${({ $size }) => $size || "120px"};
  height: ${({ $size }) => $size || "120px"};
  background: radial-gradient(circle, #a8e10ccd 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  animation:
    ${float} 6s ease-in-out infinite,
    ${pulse} 4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;
`;

export const AICircle = styled.div<{
  $delay?: string;
  $size?: string;
  $top?: string;
  $left?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "50%"};
  left: ${({ $left }) => $left || "50%"};
  width: ${({ $size }) => $size || "200px"};
  height: ${({ $size }) => $size || "200px"};
  border-radius: 50%;
  animation: ${orbit} 20s linear infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 50%;
    width: 12px;
    height: 12px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    box-shadow:
      0 0 20px ${COLOR.PRIMARY},
      0 0 40px ${COLOR.PRIMARY};
  }
`;

export const FloatingParticle = styled.div<{
  $delay?: string;
  $top?: string;
  $left?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "10%"};
  left: ${({ $left }) => $left || "10%"};
  width: 6px;
  height: 6px;
  background: ${COLOR.PRIMARY};
  border-radius: 50%;
  opacity: 0.6;
  box-shadow: 0 0 15px ${COLOR.PRIMARY};
  animation: ${float} 10s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 1;
`;

export const DataStream = styled.div<{
  $left?: string;
  $delay?: string;
  $speed?: string;
}>`
  position: absolute;
  top: 0;
  left: ${({ $left }) => $left || "10%"};
  width: 2.5px;
  height: 180px;
  background: linear-gradient(
    to bottom,
    transparent,
    ${COLOR.PRIMARY},
    transparent
  );
  opacity: 0;
  animation: ${stream} ${({ $speed }) => $speed || "8s"} linear infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: -2px;
    width: 7px;
    height: 7px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    box-shadow: 0 0 20px ${COLOR.PRIMARY};
  }
`;

export const GridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(168, 225, 12, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 225, 12, 0.2) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(circle at center, black, transparent 80%);
  animation: ${blink} 4s ease-in-out infinite;
  z-index: 0;
`;

export const NeuralLine = styled.div<{
  $top?: string;
  $left?: string;
  $width?: string;
  $rotate?: string;
  $delay?: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top || "20%"};
  left: ${({ $left }) => $left || "20%"};
  width: ${({ $width }) => $width || "150px"};
  height: 2.5px;
  background: linear-gradient(90deg, ${COLOR.PRIMARY} 0%, transparent 70%);
  opacity: 0.4;
  transform: rotate(${({ $rotate }) => $rotate || "0deg"});
  transform-origin: left center;
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: -2.5px;
    width: 7px;
    height: 7px;
    background: ${COLOR.PRIMARY};
    border-radius: 50%;
    box-shadow: 0 0 15px ${COLOR.PRIMARY};
  }
`;
