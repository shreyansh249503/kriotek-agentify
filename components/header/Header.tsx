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
      if (data.session?.user) {
        setUser(data.session.user);
      } else {
        try {
          const raw = window.localStorage.getItem(
            "sb-bhyrxyzokssibgeznojo-auth-token",
          );
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.user) {
              setUser(parsed.user);
            }
          }
        } catch {}
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const closeMenuWithDelay = () => {
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 100);
  };

  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <LogoContainer href="/" data-testid="header-logo-link">
          <Logo src={BotLogo} alt="Agentigy Logo" width={140} />
        </LogoContainer>

        <NavLinks>
          <LinkTag href="/#features" data-testid="nav-features-link">
            Features
          </LinkTag>
          <LinkTag href="/pricing" data-testid="nav-pricing-link">
            Pricing
          </LinkTag>
          <LinkTag href="/about" data-testid="nav-about-link">
            About
          </LinkTag>
          <LinkTag href="/contact" data-testid="nav-contact-link">
            Contact
          </LinkTag>
        </NavLinks>

        <LoginSignupContainer>
          {user ? (
            <DashboardButton
              href="/admin"
              onClick={() => router.push("/admin")}
              data-testid="desktop-dashboard-btn"
            >
              Dashboard
            </DashboardButton>
          ) : (
            <>
              <AuthButton href="/login">Sign in</AuthButton>
              <AuthButton href="/signup" $variant="primary">
                Try for Free
              </AuthButton>
            </>
          )}
        </LoginSignupContainer>

        <MenuButton
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          data-testid="menu-toggle-btn"
        >
          {isMenuOpen ? <X size={28} /> : <List size={28} />}
        </MenuButton>
      </InnerHeaderwrapper>

      <DrawerOverlay $isOpen={isMenuOpen} onClick={closeMenu} />
      <DrawerContent $isOpen={isMenuOpen} data-testid="drawer-content">
        <DrawerLinks>
          <LinkTag
            href="/#features"
            onClick={closeMenuWithDelay}
            data-testid="drawer-features-link"
          >
            Features
          </LinkTag>
          <LinkTag
            href="/pricing"
            onClick={closeMenuWithDelay}
            data-testid="drawer-pricing-link"
          >
            Pricing
          </LinkTag>
          <LinkTag
            href="/about"
            onClick={closeMenuWithDelay}
            data-testid="drawer-about-link"
          >
            About
          </LinkTag>
          <LinkTag
            href="/contact"
            onClick={closeMenuWithDelay}
            data-testid="drawer-contact-link"
          >
            Contact
          </LinkTag>
          <LinkTag
            href="/agent-mart"
            onClick={closeMenuWithDelay}
            data-testid="drawer-live-demo"
          >
            Live Demo
          </LinkTag>
        </DrawerLinks>

        <DrawerAuth>
          {user ? (
            <AuthButton
              href="/admin"
              $variant="primary"
              onClick={closeMenuWithDelay}
            >
              Go to Dashboard
            </AuthButton>
          ) : (
            <>
              <AuthButton href="/login" onClick={closeMenuWithDelay}>
                Login
              </AuthButton>
              <AuthButton
                href="/signup"
                $variant="primary"
                onClick={closeMenuWithDelay}
              >
                Sign Up
              </AuthButton>
            </>
          )}
        </DrawerAuth>
      </DrawerContent>
    </HeaderContainer>
  );
};
