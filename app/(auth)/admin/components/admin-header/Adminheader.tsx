"use client";

import {
  ButtonWrapper,
  HeaderContainer,
  InnerHeaderwrapper,
  PageTitle,
  ToggleButton,
  HamburgerButton,
  HeaderWrapper,
  HeaderTitleWrapper,
} from "./styled";
import { usePathname } from "next/navigation";
import {
  SquaresFourIcon,
  ListIcon,
  HouseIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useSidebar } from "@/context/SidebarContext";
import { Breadcrumbs } from "../breadcrumbs";
import { BlackButton } from "@/components";

export const Adminheader = () => {
  const pathname = usePathname();
  const { toggleSidebar, toggleDrawer } = useSidebar();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
  };

  const isBotsPage =
    pathname === "/admin/bots" ||
    pathname.startsWith("/admin/bots/") ||
    pathname.startsWith("/admin/bot/");

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
          {isBotsPage ? (
            <BlackButton href={"/admin/new"} style={{ padding: "10px 18px" }}>
              <PlusIcon size={18} weight="bold" />
              New AI Agent
            </BlackButton>
          ) : (
            <BlackButton href={"/"} style={{ padding: "10px 18px" }}>
              Go to Home
              <HouseIcon size={18} weight="bold" />
            </BlackButton>
          )}
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderWrapper>
  );
};
