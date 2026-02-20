"use client";

import {
  ButtonWrapper,
  GoToHomeButton,
  HeaderContainer,
  InnerHeaderwrapper,
  PageTitle,
} from "./styled";
import { usePathname } from "next/navigation";

export const Adminheader = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/new") return "Create New Bot";
    if (pathname.includes("/edit-bot")) return "Edit Bot";
    if (pathname.includes("/ingest")) return "Data Ingestion";
    if (pathname === "/admin/profile") return "My Profile";
    if (pathname === "/admin/settings") return "Settings";
    return "Admin";
  };

  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <PageTitle>{getPageTitle()}</PageTitle>
        <ButtonWrapper>
          <GoToHomeButton href={"/"}>Go to Home</GoToHomeButton>
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
