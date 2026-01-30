import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100wh;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
`;
export const InnerHeaderwrapper = styled.div`
  width: 85%;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #454c4c;
`;
export const Logo = styled(Image)`
  width: 45px;
  height: 45px;
  object-fit: cover;
`;
export const LoginSignupContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;
export const LinkTag = styled(Link)`
  text-decoration: none;
  color: #0f0f0f;
  font-weight: 600;
  font-size: 18px;

  &:hover {
    color: #4f46e5;
  }
`;
export const PersonLogo = styled(Image)`
  width: 50px;
  height: 50px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #4f46e5;
  border-radius: 50%;
`;
