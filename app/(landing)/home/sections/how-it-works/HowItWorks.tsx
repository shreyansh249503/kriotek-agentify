import { InstructionCard } from '../../components';
import { BenefitsList, BenefitsSection, SectionContainer, SectionSubtitle, SectionTitle } from './styled'

const benefits = [
  {
    number: "01",
    title: "Create Your Agent",
    description:
      "Sign up and create a new AI agent in seconds. Choose a name and configure basic settings to match your specific needs.",
  },
  {
    number: "02",
    title: "Add Your Knowledge",
    description:
      "Upload documents, paste text, or connect your website. Your agent will learn from your content to provide accurate responses.",
  },
  {
    number: "03",
    title: "Customize & Train",
    description:
      "Fine-tune your agent's personality, response style, and behavior. Test conversations to ensure it meets your high standards.",
  },
  {
    number: "04",
    title: "Deploy Anywhere",
    description:
      "Copy the embed code and add your AI agent to your website, app, or messaging platform. Start engaging users instantly.",
  },
];

export const HowItWorks = () => {
  return (
    <BenefitsSection id="benefits">
            <SectionContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <SectionTitle>How It Works</SectionTitle>
                <SectionSubtitle>
                  Get your AI agent up and running in just a few simple steps.
                </SectionSubtitle>
              </div>
    
              <BenefitsList>
               {benefits.map((benefit, index) => (
                 <InstructionCard
                 key={index}
                 number={benefit.number}
                 title={benefit.title}
                 description={benefit.description}
                 />
               ))}
              </BenefitsList>
            </SectionContainer>
          </BenefitsSection>
    
  )
}
