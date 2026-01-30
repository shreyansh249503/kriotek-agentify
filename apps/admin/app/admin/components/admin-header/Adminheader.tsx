import { LogoutButton } from "@/components";
import {
  ButtonWrapper,
  GoToHomeButton,
  HeaderContainer,
  HeaderTitle,
  InnerHeaderwrapper,
} from "./styled";

export const Adminheader = () => {
  return (
    <HeaderContainer>
      <InnerHeaderwrapper>
        <HeaderTitle>AI Bot Admin</HeaderTitle>
        <ButtonWrapper>
          <LogoutButton />
          <GoToHomeButton href={"/"}>Go to Home</GoToHomeButton>
        </ButtonWrapper>
      </InnerHeaderwrapper>
    </HeaderContainer>
  );
};
