import Link from "next/link";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const AdminContainer = styled.div`
  width: 85%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
export const YourBotsTitle = styled.h1`
  font-size: 28px;
  color: #0f0f0f;
  text-align: center;
`;
export const AddNewBotButton = styled(Link)`
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #4f46e5;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 16px;
`;
export const AdminContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;
export const BotCardContainer = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const IngestButton = styled(Link)`
  padding: 8px 12px;
  background-color: #4f46e5;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
`;
export const EditBotButton = styled(Link)`
  padding: 8px 12px;
  background-color: white;
  border-radius: 4px;
  text-decoration: none;
  border: 1px solid #4f46e5;
  font-size: 14px;
  color: #4f46e5;
`;
