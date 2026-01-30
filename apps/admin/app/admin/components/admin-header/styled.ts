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
export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
export const GoToHomeButton = styled(Link)`
  padding: 8px 12px;
  background-color: white;
  border-radius: 4px;
  text-decoration: none;
  border: 1px solid #4f46e5;
  font-size: 14px;
  color: #4f46e5;
`;
