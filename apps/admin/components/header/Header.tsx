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
} from "./styled";
import BotLogo from "@/assets/images/agentigy-logo-black.png";
import PersonAvatar from "@/assets/images/person-avatar.png";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export const Header = () => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, []);

  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <LogoContainer onClick={() => router.push("/")}>
          <Logo src={BotLogo} alt="Agentigy Logo" width={140} />
        </LogoContainer>

        <NavLinks>
          <LinkTag href="/#features">Features</LinkTag>
          <LinkTag href="/#benefits">Benefits</LinkTag>
          <LinkTag href="/pricing">Pricing</LinkTag>
          <LinkTag href="/docs">Docs</LinkTag>
        </NavLinks>

        <LoginSignupContainer>
          {user ? (
            <PersonLogo
              src={PersonAvatar}
              alt="User Avatar"
              width={40}
              height={40}
              onClick={() => router.push("/admin")}
            />
          ) : (
            <>
              <AuthButton href="/login">Login</AuthButton>
              <AuthButton href="/signup" $variant="primary">
                Sign Up
              </AuthButton>
            </>
          )}
        </LoginSignupContainer>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
