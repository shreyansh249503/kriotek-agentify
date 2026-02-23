"use client";

import {
  ButtonWrapper,
  GoToHomeButton,
  HeaderContainer,
  InnerHeaderwrapper,
  PageTitle,
  ToggleButton,
} from "./styled";
import { usePathname } from "next/navigation";
import { SquaresFourIcon } from "@phosphor-icons/react";
import { useSidebar } from "@/context/SidebarContext";

export const Adminheader = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

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
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <ToggleButton onClick={toggleSidebar} title="Toggle Sidebar">
            <SquaresFourIcon size={24} weight="bold" />
          </ToggleButton>
          <PageTitle>{getPageTitle()}</PageTitle>
        </div>
        <ButtonWrapper>
          <GoToHomeButton href={"/"}>Go to Home</GoToHomeButton>
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
