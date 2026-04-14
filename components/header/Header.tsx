"use client";

import { useEffect, useState } from "react";
import {
  HeaderContainer,
  InnerHeaderwrapper,
  LogoContainer,
  Logo,
  NavLinks,
  LinkTag,
  LoginSignupContainer,
  AuthButton,
  PersonLogo,
  MenuButton,
  DrawerOverlay,
  DrawerContent,
  DrawerLinks,
  DrawerAuth,
  DashboardButton,
} from "./styled";
import BotLogo from "@/assets/images/Agentify logo black.png";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { List, X } from "@phosphor-icons/react";

export const Header = () => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <LogoContainer onClick={() => router.push("/")}>
          <Logo src={BotLogo} alt="Agentigy Logo" width={140} />
        </LogoContainer>

        <NavLinks>
          <LinkTag href="/#features">Features</LinkTag>
          <LinkTag href="/#benefits">Benefits</LinkTag>
          <LinkTag href="/work-in-progress">Pricing</LinkTag>
          <LinkTag href="/work-in-progress">Docs</LinkTag>
        </NavLinks>

        <LoginSignupContainer>
          {user ? (

            <DashboardButton onClick={() => router.push("/admin")}>Dashboard</DashboardButton>
            
          ) : (
            <>
              <AuthButton href="/login">Login</AuthButton>
              <AuthButton href="/signup" $variant="primary">
                Sign Up
              </AuthButton>
            </>
          )}
        </LoginSignupContainer>

        <MenuButton onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <List size={28} />}
        </MenuButton>
      </InnerHeaderwrapper>

      <DrawerOverlay $isOpen={isMenuOpen} onClick={closeMenu} />
      <DrawerContent $isOpen={isMenuOpen}>
        <DrawerLinks>
          <LinkTag href="/#features" onClick={closeMenu}>
            Features
          </LinkTag>
          <LinkTag href="/#benefits" onClick={closeMenu}>
            Benefits
          </LinkTag>
          <LinkTag href="/work-in-progress" onClick={closeMenu}>
            Pricing
          </LinkTag>
          <LinkTag href="/work-in-progress" onClick={closeMenu}>
            Docs
          </LinkTag>
        </DrawerLinks>

        <DrawerAuth>
          {user ? (
            <AuthButton href="/admin" $variant="primary" onClick={closeMenu}>
              Go to Dashboard
            </AuthButton>
          ) : (
            <>
              <AuthButton href="/login" onClick={closeMenu}>
                Login
              </AuthButton>
              <AuthButton href="/signup" $variant="primary" onClick={closeMenu}>
                Sign Up
              </AuthButton>
            </>
          )}
        </DrawerAuth>
      </DrawerContent>
    </HeaderContainer>
  );
};
