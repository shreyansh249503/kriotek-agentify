"use client";

import {
  ButtonWrapper,
  GoToHomeButton,
  HeaderContainer,
  InnerHeaderwrapper,
  PageTitle,
  ToggleButton,
  HamburgerButton,
  HomeButtonText,
  HomeButtonIcon,
  HeaderWrapper,
  HeaderTitleWrapper,
} from "./styled";
import { usePathname } from "next/navigation";
import { SquaresFourIcon, ListIcon, HouseIcon } from "@phosphor-icons/react";
import { useSidebar } from "@/context/SidebarContext";
import { Breadcrumbs } from "../breadcrumbs";

export const Adminheader = () => {
  const pathname = usePathname();
  const { toggleSidebar, toggleDrawer } = useSidebar();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
  };

  return (
    <HeaderWrapper>
      <InnerHeaderwrapper>
        <HeaderContainer>
          <ToggleButton onClick={toggleSidebar} title="Toggle Sidebar">
            <SquaresFourIcon size={24} weight="bold" />
          </ToggleButton>

          <HamburgerButton onClick={toggleDrawer} title="Open Menu">
            <ListIcon size={24} weight="bold" />
          </HamburgerButton>
          <HeaderTitleWrapper>
            <PageTitle>{getPageTitle()}</PageTitle>
            <Breadcrumbs />
          </HeaderTitleWrapper>
        </HeaderContainer>
        <ButtonWrapper>
          <GoToHomeButton href={"/"}>
            <HomeButtonText>Go to Home</HomeButtonText>
            <HomeButtonIcon>
              <HouseIcon size={18} weight="bold" />
            </HomeButtonIcon>
          </GoToHomeButton>
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderWrapper>
  );
};

