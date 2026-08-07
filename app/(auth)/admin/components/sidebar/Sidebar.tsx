"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SignOutIcon,
  GearIcon,
  PlusCircleIcon,
  BrainIcon,
  AddressBookIcon,
  ChatsIcon,
  XIcon,
  HouseLineIcon,
  UserIcon,
  StarIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import {
  SidebarContainer,
  LogoSection,
  NavSection,
  NavItem,
  BottomSection,
  LogoImage,
  DrawerOverlay,
  DrawerContainer,
  DrawerHeader,
  DrawerCloseButton,
  DrawerNavItem,
  UserProfileTrigger,
  AvatarCircle,
  UserProfileDetails,
  UserProfileName,
  UserProfileEmail,
  PopoverCard,
  PopoverHeader,
  PopoverDivider,
  PopoverMenuList,
  PopoverMenuItem,
} from "./styled";
import { supabase } from "@/lib/supabase";
import { useSidebar } from "@/context/SidebarContext";
import BotLogo from "@/assets/images/Agentify logo white.png";
import BotLogoShort from "@/assets/images/Agentify-light-short-log.png";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isDrawerOpen, closeDrawer } = useSidebar();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDrawerProfileOpen, setIsDrawerProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const drawerProfileRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ name: string; email: string }>({
    name: "Rishabh Verma",
    email: "rishabh2552002@gmail.com",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const u = data.user;
        const name =
          u.user_metadata?.name ||
          u.user_metadata?.full_name ||
          u.email?.split("@")[0] ||
          "Rishabh Verma";
        const email = u.email || "rishabh2552002@gmail.com";
        setUser({ name, email });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        drawerProfileRef.current &&
        !drawerProfileRef.current.contains(event.target as Node)
      ) {
        setIsDrawerProfileOpen(false);
      }
    };

    if (isProfileMenuOpen || isDrawerProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, isDrawerProfileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeDrawer();
    router.replace("/login");
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "--";
  };

  const initials = getInitials(user.name, user.email);

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      isActive: pathname === "/admin",
      icon: (weight: "fill" | "regular") => <HouseLineIcon weight={weight} />,
    },
    {
      label: "Create Agent",
      href: "/admin/new",
      isActive: pathname === "/admin/new",
      icon: (weight: "fill" | "regular") => <PlusCircleIcon weight={weight} />,
    },
    {
      label: "Agents",
      href: "/admin/bots",
      isActive:
        pathname === "/admin/bots" ||
        pathname.startsWith("/admin/bots/") ||
        pathname.startsWith("/admin/bot/"),
      icon: (weight: "fill" | "regular") => <BrainIcon weight={weight} />,
    },
    {
      label: "Leads",
      href: "/admin/leads",
      isActive: pathname === "/admin/leads",
      icon: (weight: "fill" | "regular") => <AddressBookIcon weight={weight} />,
    },
    {
      label: "Live Support",
      href: "/admin/inbox",
      isActive:
        pathname === "/admin/inbox" || pathname.startsWith("/admin/inbox/"),
      icon: (weight: "fill" | "regular") => <ChatsIcon weight={weight} />,
    },
  ];

  return (
    <>
      <SidebarContainer $isCollapsed={isCollapsed}>
        <LogoSection
          $isCollapsed={isCollapsed}
          onClick={() => router.push("/admin")}
        >
          <LogoImage
            $isCollapsed={isCollapsed}
            src={BotLogo}
            alt="Logo"
            $type="full"
          />
          <LogoImage
            $isCollapsed={isCollapsed}
            src={BotLogoShort}
            alt="Logo"
            $type="short"
          />
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

        <BottomSection ref={profileMenuRef}>
          {isProfileMenuOpen && (
            <PopoverCard $isCollapsed={isCollapsed}>
              <PopoverHeader>
                <AvatarCircle>{initials}</AvatarCircle>
                <UserProfileDetails>
                  <UserProfileName>{user.name}</UserProfileName>
                  <UserProfileEmail>{user.email}</UserProfileEmail>
                </UserProfileDetails>
              </PopoverHeader>

              <PopoverDivider />

              <PopoverMenuList>
                <PopoverMenuItem onClick={() => setIsProfileMenuOpen(false)}>
                  <StarIcon weight="regular" />
                  <span>Upgrade plan</span>
                </PopoverMenuItem>
                <PopoverMenuItem
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/admin/settings");
                  }}
                >
                  <UserIcon weight="regular" />
                  <span>Profile</span>
                </PopoverMenuItem>
                <PopoverMenuItem
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/admin/settings");
                  }}
                >
                  <GearIcon weight="regular" />
                  <span>Settings</span>
                </PopoverMenuItem>
              </PopoverMenuList>

              <PopoverDivider />

              <PopoverMenuList>
                <PopoverMenuItem onClick={() => setIsProfileMenuOpen(false)}>
                  <QuestionIcon weight="regular" />
                  <span>Help</span>
                </PopoverMenuItem>
                <PopoverMenuItem
                  $isDanger
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <SignOutIcon weight="regular" />
                  <span>Log out</span>
                </PopoverMenuItem>
              </PopoverMenuList>
            </PopoverCard>
          )}

          <UserProfileTrigger
            $isCollapsed={isCollapsed}
            $isOpen={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            title={isCollapsed ? `${user.name} (${user.email})` : ""}
          >
            <AvatarCircle>{initials}</AvatarCircle>
            {!isCollapsed && (
              <UserProfileDetails>
                <UserProfileName>{user.name}</UserProfileName>
                <UserProfileEmail>{user.email}</UserProfileEmail>
              </UserProfileDetails>
            )}
          </UserProfileTrigger>
        </BottomSection>
      </SidebarContainer>

      <DrawerOverlay $open={isDrawerOpen} onClick={closeDrawer} />
      <DrawerContainer $open={isDrawerOpen}>
        <DrawerHeader>
          <LogoImage
            $isCollapsed={false}
            src={BotLogo}
            alt="Logo"
            onClick={() => {
              closeDrawer();
              router.push("/admin");
            }}
            style={{ cursor: "pointer" }}
          />
          <DrawerCloseButton onClick={closeDrawer} aria-label="Close menu">
            <XIcon size={20} weight="bold" />
          </DrawerCloseButton>
        </DrawerHeader>

        <NavSection>
          {navItems.map((item) => (
            <DrawerNavItem
              key={item.href}
              href={item.href}
              $active={item.isActive}
              onClick={closeDrawer}
            >
              {item.icon(item.isActive ? "fill" : "regular")}
              <span>{item.label}</span>
            </DrawerNavItem>
          ))}
        </NavSection>

        <BottomSection ref={drawerProfileRef}>
          {isDrawerProfileOpen && (
            <PopoverCard $isCollapsed={false}>
              <PopoverHeader>
                <AvatarCircle>{initials}</AvatarCircle>
                <UserProfileDetails>
                  <UserProfileName>{user.name}</UserProfileName>
                  <UserProfileEmail>{user.email}</UserProfileEmail>
                </UserProfileDetails>
              </PopoverHeader>

              <PopoverDivider />

              <PopoverMenuList>
                <PopoverMenuItem onClick={() => setIsDrawerProfileOpen(false)}>
                  <StarIcon weight="regular" />
                  <span>Upgrade plan</span>
                </PopoverMenuItem>
                <PopoverMenuItem
                  onClick={() => {
                    setIsDrawerProfileOpen(false);
                    closeDrawer();
                    router.push("/admin/settings");
                  }}
                >
                  <UserIcon weight="regular" />
                  <span>Profile</span>
                </PopoverMenuItem>
                <PopoverMenuItem
                  onClick={() => {
                    setIsDrawerProfileOpen(false);
                    closeDrawer();
                    router.push("/admin/settings");
                  }}
                >
                  <GearIcon weight="regular" />
                  <span>Settings</span>
                </PopoverMenuItem>
              </PopoverMenuList>

              <PopoverDivider />

              <PopoverMenuList>
                <PopoverMenuItem onClick={() => setIsDrawerProfileOpen(false)}>
                  <QuestionIcon weight="regular" />
                  <span>Help</span>
                </PopoverMenuItem>
                <PopoverMenuItem
                  $isDanger
                  onClick={() => {
                    setIsDrawerProfileOpen(false);
                    handleLogout();
                  }}
                >
                  <SignOutIcon weight="regular" />
                  <span>Log out</span>
                </PopoverMenuItem>
              </PopoverMenuList>
            </PopoverCard>
          )}

          <UserProfileTrigger
            $isCollapsed={false}
            $isOpen={isDrawerProfileOpen}
            onClick={() => setIsDrawerProfileOpen((prev) => !prev)}
          >
            <AvatarCircle>{initials}</AvatarCircle>
            <UserProfileDetails>
              <UserProfileName>{user.name}</UserProfileName>
              <UserProfileEmail>{user.email}</UserProfileEmail>
            </UserProfileDetails>
          </UserProfileTrigger>
        </BottomSection>
      </DrawerContainer>
    </>
  );
};
