import { CreditCardIcon } from "lucide-react";
import { PrimaryButton } from "../hero/styled";
import {
  CTAButtonWrapper,
  CTADescription,
  CTATitle,
  CTAWrapper,
  NoCardText,
  NoCardWrapper,
} from "./styled";

export const FinalCTA = () => {
  return (
    <CTAWrapper>
      <CTATitle>Ready to Transform Your Experience?</CTATitle>
      <CTADescription>
        Join thousands of businesses using Agentify to automate support and
        engage customers intelligently.
      </CTADescription>

      <CTAButtonWrapper>
        <PrimaryButton href="/signup">Build your agent for free</PrimaryButton>
        <NoCardWrapper>
          <CreditCardIcon size={18} />
          <NoCardText style={{ fontSize: "14px" }}>
            No credit card required
          </NoCardText>
        </NoCardWrapper>
      </CTAButtonWrapper>
    </CTAWrapper>
  );
};
