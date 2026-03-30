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
import { Breadcrumbs } from "../breadcrumbs";

export const Adminheader = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
  };

  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <ToggleButton onClick={toggleSidebar} title="Toggle Sidebar">
            <SquaresFourIcon size={24} weight="bold" />
          </ToggleButton>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <PageTitle>{getPageTitle()}</PageTitle>
            <Breadcrumbs />
          </div>
        </div>
        <ButtonWrapper>
          <GoToHomeButton href={"/"}>Go to Home</GoToHomeButton>
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
