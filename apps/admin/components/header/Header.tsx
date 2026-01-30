"use client";

import React, { useEffect, useState } from "react";
import {
  HeaderContainer,
  HeaderTitle,
  InnerHeaderwrapper,
  LinkTag,
  LoginSignupContainer,
  Logo,
  PersonLogo,
} from "./styled";
import BotLogo from "@/assets/images/bot-logo.png";
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
        <HeaderTitle>
          <Logo src={BotLogo} alt="Company Logo" width={40} height={40} />
          Agentify
        </HeaderTitle>
        <LoginSignupContainer>
          {user ? (
            <PersonLogo
              src={PersonAvatar}
              alt="Company Logo"
              width={40}
              height={40}
              onClick={() => router.push("/admin")}
            />
          ) : (
            <>
              <LinkTag href={"/login"}>Login</LinkTag>
              <LinkTag href={"/signup"}>SignUp</LinkTag>
            </>
          )}
        </LoginSignupContainer>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
