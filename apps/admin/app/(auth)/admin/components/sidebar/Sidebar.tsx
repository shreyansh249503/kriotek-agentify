"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  PlusCircle,
  UserCircle,
  Gear,
  SignOut,
} from "@phosphor-icons/react";
import {
  SidebarContainer,
  LogoSection,
  LogoText,
  NavSection,
  NavItem,
  BottomSection,
  LogoutButtonContainer,
} from "./styled";
import { supabase } from "@/lib/supabase";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <SquaresFour weight={pathname === "/admin" ? "fill" : "regular"} />,
    },
    {
      label: "Create Bot",
      href: "/admin/new",
      icon: (
        <PlusCircle weight={pathname === "/admin/new" ? "fill" : "regular"} />
      ),
    },
    {
      label: "Profile",
      href: "/admin/profile",
      icon: (
        <UserCircle
          weight={pathname === "/admin/profile" ? "fill" : "regular"}
        />
      ),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: (
        <Gear weight={pathname === "/admin/settings" ? "fill" : "regular"} />
      ),
    },
  ];

  return (
    <SidebarContainer>
      <LogoSection onClick={() => router.push("/admin")}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="#A8E10C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#A8E10C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#A8E10C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <LogoText>Agentify</LogoText>
      </LogoSection>

      <NavSection>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            $active={pathname === item.href}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavItem>
        ))}
      </NavSection>

      <BottomSection>
        <LogoutButtonContainer>
          <NavItem
            as="button"
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <SignOut />
            <span>Logout</span>
          </NavItem>
        </LogoutButtonContainer>
      </BottomSection>
    </SidebarContainer>
  );
};
