"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  SignOutIcon,
  GearIcon,
  PlusCircleIcon,
  SquaresFourIcon,
  BrainIcon,
  AddressBookIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import {
  SidebarContainer,
  LogoSection,
  NavSection,
  NavItem,
  BottomSection,
  LogoutButtonContainer,
  LogoutButton,
  LogoImage,
} from "./styled";
import { supabase } from "@/lib/supabase";
import { useSidebar } from "@/context/SidebarContext";
import BotLogo from "@/assets/images/Agentify logo white.png";
import BotLogoShort from "@/assets/images/Agentify-light-short-log.png";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      isActive: pathname === "/admin",
      icon: (weight: "fill" | "regular") => <SquaresFourIcon weight={weight} />,
    },
    {
      label: "Create Bot",
      href: "/admin/new",
      isActive: pathname === "/admin/new",
      icon: (weight: "fill" | "regular") => <PlusCircleIcon weight={weight} />,
    },
    {
      label: "Bots",
      href: "/admin/bots",
      isActive:
        pathname === "/admin/bots" || pathname.startsWith("/admin/bots/") || pathname.startsWith("/admin/bot/"),
      icon: (weight: "fill" | "regular") => <BrainIcon weight={weight} />,
    },
    {
      label: "Leads",
      href: "/admin/leads",
      isActive: pathname === "/admin/leads",
      icon: (weight: "fill" | "regular") => <AddressBookIcon weight={weight} />,
    },
    {
      label: "Billing",
      href: "/admin/billing",
      isActive: pathname === "/admin/billing",
      icon: (weight: "fill" | "regular") => <CreditCardIcon weight={weight} />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      isActive: pathname === "/admin/settings",
      icon: (weight: "fill" | "regular") => <GearIcon weight={weight} />,
    },
  ];

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <LogoSection
        $isCollapsed={isCollapsed}
        onClick={() => router.push("/admin")}
      >
        {isCollapsed ? (
          <LogoImage $isCollapsed={isCollapsed} src={BotLogoShort} alt="Logo" />
        ) : (
          <LogoImage $isCollapsed={isCollapsed} src={BotLogo} alt="Logo" />
        )}
      </LogoSection>

      <NavSection>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            $active={item.isActive}
            title={isCollapsed ? item.label : ""}
          >
            {item.icon(item.isActive ? "fill" : "regular")}
            {!isCollapsed && <span>{item.label}</span>}
          </NavItem>
        ))}
      </NavSection>

      <BottomSection>
        <LogoutButtonContainer>
          <LogoutButton
            as="button"
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <SignOutIcon />
            {!isCollapsed && <span>Logout</span>}
          </LogoutButton>
        </LogoutButtonContainer>
      </BottomSection>
    </SidebarContainer>
  );
};
