"use client";

import { LogoutButton } from "@/components";
import {
  ButtonWrapper,
  GoToHomeButton,
  HeaderContainer,
  InnerHeaderwrapper,
  LogoContainer,
  Logo,
} from "./styled";
import BotLogo from "@/assets/images/agentigy-logo-black.png";
import { useRouter } from "next/navigation";

export const Adminheader = () => {
  const router = useRouter();
  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <LogoContainer  onClick={() => router.push("/admin")}>
          <Logo src={BotLogo} alt="Agentigy Logo" width={140} />
        </LogoContainer>
        <ButtonWrapper>
          <LogoutButton />
          <GoToHomeButton href={"/"}>Go to Home</GoToHomeButton>
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
