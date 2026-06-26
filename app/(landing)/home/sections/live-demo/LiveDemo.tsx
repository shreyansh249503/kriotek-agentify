import { IoStorefrontOutline } from "react-icons/io5";
import { GoCheckCircleFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa6";
import {
  DemoTeaserSection,
  TeaserContainer,
  TextBlock,
  Badge,
  TeaserTitle,
  TeaserSubtitle,
  InteractiveShowcase,
  VisualMockup,
  MockBrowserHeader,
  Dots,
  BrowserAddress,
  MockStoreBody,
  MockProductsGrid,
  MockProductCard,
  MockImagePlaceholder,
  MockProductTitle,
  MockProductPrice,
  MockBotBubble,
  DetailsColumn,
  BenefitList,
  BenefitItem,
} from "./styled";
import { BlackButton } from "@/components";

export const LiveDemo = () => {
  return (
    <DemoTeaserSection id="live-demo">
      <TeaserContainer>
        <TextBlock>
          <Badge>Interactive Experience</Badge>
          <TeaserTitle>
            Test Drive a Live <span>E-commerce Store</span>
          </TeaserTitle>
          <TeaserSubtitle>
            Don&apos;t just read about it. Step into a mock storefront and
            interact with our sales agent yourself to see how it converts
            visitors.
          </TeaserSubtitle>
        </TextBlock>

        <InteractiveShowcase>
          <VisualMockup>
            <MockBrowserHeader>
              <Dots>
                <span />
                <span />
                <span />
              </Dots>
              <BrowserAddress>aura-ayurveda.store/products</BrowserAddress>
              <div style={{ width: 38 }} />
            </MockBrowserHeader>

            <MockStoreBody>
              <MockProductsGrid>
                {[1, 2, 3].map((item) => (
                  <MockProductCard key={item}>
                    <MockImagePlaceholder>
                      <IoStorefrontOutline />
                    </MockImagePlaceholder>
                    <MockProductTitle />
                    <MockProductPrice />
                  </MockProductCard>
                ))}
              </MockProductsGrid>
            </MockStoreBody>

            <MockBotBubble>
              <span style={{ fontSize: "16px" }}>💬</span> Ask me for a
              discount!
            </MockBotBubble>
          </VisualMockup>

          <DetailsColumn>
            <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#2E2E2E" }}>
              What you can test in the live demo:
            </h3>
            <BenefitList>
              <BenefitItem>
                <GoCheckCircleFill /> Real-time interactive Q&amp;A about
                products and usage.
              </BenefitItem>
              <BenefitItem>
                <GoCheckCircleFill />
                In-chat visual product card checkout.
              </BenefitItem>
              <BenefitItem>
                <GoCheckCircleFill /> Warm lead collection (Name &amp; Email) in
                exchange for promo codes.
              </BenefitItem>
              <BenefitItem>
                <GoCheckCircleFill /> Keyword-based instant customer service
                simulation.
              </BenefitItem>
            </BenefitList>

            <BlackButton href="/demo">
              Launch Live Demo Store <FaArrowRight />
            </BlackButton>
          </DetailsColumn>
        </InteractiveShowcase>
      </TeaserContainer>
    </DemoTeaserSection>
  );
};
