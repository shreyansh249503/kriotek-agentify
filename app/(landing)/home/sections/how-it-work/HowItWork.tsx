import Card1 from "@/assets/images/how-it-works-card1.svg";
import Card2 from "@/assets/images/how-it-works-card2.svg";
import Card3 from "@/assets/images/how-it-works-card3.svg";
import Card4 from "@/assets/images/how-it-works-card4.svg";
import {
  CenterBottomFlowtingDiv,
  HowItWorkDescription,
  HowItWorkHeaderSection,
  HowItWorkHeading,
  HowItWorkMainContainer,
  HowItWorkSectionConatiner,
  InnerGreenCard,
  LeftTopFlowtingDiv,
  RightBottomFlowtingDiv,
  RightTopFlowtingDiv,
  SecondRightTopFlowtingDiv,
  StepContentColumn,
  StepDescription,
  StepImage,
  StepImageColumn,
  StepNumber,
  StepRow,
  StepTextContainer,
  StepTitle,
} from "./styled";

const steps = [
  {
    number: "01",
    title: "Create Your Agent",
    description:
      "Sign up and create a new AI agent in seconds. Choose a name and configure basic settings to match your specific needs.",
    image: Card1,
    alt: "Create Your Agent illustration",
  },
  {
    number: "02",
    title: "Add Your Knowledge",
    description:
      "Upload documents, paste text, or connect your website. Your agent will learn from your content to provide accurate responses.",
    image: Card2,
    alt: "Add Your Knowledge illustration",
  },
  {
    number: "03",
    title: "Customize & Train",
    description:
      "Fine-tune your agent's personality, response style, and behavior. Test conversations to ensure it meets your high standards.",
    image: Card4,
    alt: "Customize & Train illustration",
  },
  {
    number: "04",
    title: "Deploy Anywhere",
    description:
      "Copy the embed code and add your AI agent to your website, app, or messaging platform. Start engaging users instantly.",
    image: Card3,
    alt: "Deploy Anywhere illustration",
  },
];

export const HowItWork = () => {
  return (
    <HowItWorkMainContainer>
      <HowItWorkHeaderSection>
        <HowItWorkHeading>How It Works</HowItWorkHeading>
        <HowItWorkDescription>
          Get your AI agents up and running in just a few simple steps.
        </HowItWorkDescription>
      </HowItWorkHeaderSection>
      <HowItWorkSectionConatiner>
        {steps.map((step, index) => {
          const isReversed = index % 2 !== 0;
          return (
            <StepRow key={step.number} $isReversed={isReversed}>
              <StepContentColumn>
                <StepNumber>{step.number}</StepNumber>
                <StepTextContainer>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </StepTextContainer>
              </StepContentColumn>
              <StepImageColumn>
                <InnerGreenCard>
                  <LeftTopFlowtingDiv />
                  <RightTopFlowtingDiv />
                  <SecondRightTopFlowtingDiv />
                  <StepImage
                    $stepId={step.number}
                    src={step.image}
                    alt={step.alt}
                    width={500}
                    height={500}
                    priority={index === 0}
                  />
                  <CenterBottomFlowtingDiv />
                  <RightBottomFlowtingDiv />
                </InnerGreenCard>
              </StepImageColumn>
            </StepRow>
          );
        })}
      </HowItWorkSectionConatiner>
    </HowItWorkMainContainer>
  );
};
