import {
  AICircle,
  AINode,
  AnimatedBackground,
  CTAContainer,
  DataStream,
  FloatingParticle,
  GridBackground,
  HeroContent,
  HeroSection,
  MainHeading,
  NeuralLine,
  PrimaryButton,
  SecondaryButton,
  SubHeading,
} from "./styled";

export const Hero = () => {
  return (
    <HeroSection>
      <AnimatedBackground>
        <GridBackground />

        <DataStream $left="15%" $delay="2s" $speed="12s" />
        <DataStream $left="25%" $delay="4s" $speed="15s" />
        <DataStream $left="65%" $delay="5s" $speed="16s" />
        <DataStream $left="75%" $delay="2s" $speed="11s" />
        <DataStream $left="85%" $delay="4s" $speed="14s" />

        <NeuralLine
          $top="40%"
          $left="5%"
          $width="120px"
          $rotate="15deg"
          $delay="2s"
        />
        <NeuralLine
          $top="35%"
          $left="90%"
          $width="140px"
          $rotate="100deg"
          $delay="4.5s"
        />
        <NeuralLine
          $top="10%"
          $left="30%"
          $width="110px"
          $rotate="45deg"
          $delay="3.5s"
        />

        <AINode $top="10%" $left="15%" $size="160px" $delay="0s" />
        <AINode $top="45%" $left="12%" $size="110px" $delay="2.4s" />
        <AINode $top="15%" $left="80%" $size="130px" $delay="3.6s" />
        <AINode $top="85%" $left="10%" $size="190px" $delay="0.8s" />

        <AICircle $top="25%" $left="80%" $size="260px" $delay="0s" />
        <AICircle $top="75%" $left="20%" $size="200px" $delay="5s" />
        <AICircle $top="10%" $left="40%" $size="150px" $delay="7s" />

        <FloatingParticle $top="85%" $left="35%" $delay="4s" />
        <FloatingParticle $top="15%" $left="65%" $delay="1s" />
        <FloatingParticle $top="95%" $left="15%" $delay="3s" />
        <FloatingParticle $top="70%" $left="90%" $delay="2.5s" />
        <FloatingParticle $top="30%" $left="10%" $delay="5s" />
        <FloatingParticle $top="60%" $left="20%" $delay="0.5s" />
        <FloatingParticle $top="25%" $left="45%" $delay="3.2s" />
      </AnimatedBackground>
      <HeroContent>
        <MainHeading>
          Build Intelligent
          <br />
          AI Agents
        </MainHeading>
        <SubHeading>
          Create powerful, customizable AI chatbots that understand your
          business and engage your customers 24/7. No coding required.
        </SubHeading>
        <CTAContainer>
          <PrimaryButton href="/signup">Get Started Free</PrimaryButton>
          <SecondaryButton href="#demo">Watch Demo</SecondaryButton>
        </CTAContainer>
      </HeroContent>
    </HeroSection>
  );
};
