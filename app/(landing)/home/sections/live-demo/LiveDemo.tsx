import { IoStorefrontOutline } from "react-icons/io5";
import {
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
  LiveDemoMainConatiner,
  LiveDemoSectionHeader,
  LiveDemoSecondarySection,
  LiveDemoList,
  LiveDemoListItem,
  LiveDemoDescription,
  LiveDemoHeading,
  LiveDemoTitleBtn,
  LiveDemoPrimarySection,
  LiveDemoListHeading,
} from "./styled";
import { BlackButton } from "@/components";
import { FaRegCircleCheck } from "react-icons/fa6";

export const LiveDemo = () => {
  return (
    <LiveDemoMainConatiner>
      <LiveDemoSectionHeader>
        <LiveDemoSecondarySection>
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
        </LiveDemoSecondarySection>
        <LiveDemoPrimarySection>
          <LiveDemoTitleBtn>Interactive Experience</LiveDemoTitleBtn>
          <LiveDemoHeading>Test Driven Live E-Comm</LiveDemoHeading>
          <LiveDemoDescription>
            Don’t just read about it. Step into a mock storefront and interact
            with our sales agent yourself to see how it converts visitors.
          </LiveDemoDescription>
          <LiveDemoListHeading>
            What you can test in the live demo:
          </LiveDemoListHeading>
          <LiveDemoList>
            <LiveDemoListItem>
              <FaRegCircleCheck size={22} />
              Real-time interactive Q&A about product and usage.
            </LiveDemoListItem>
            <LiveDemoListItem>
              <FaRegCircleCheck size={22} />
              In-chat visual product card checkout.
            </LiveDemoListItem>
            <LiveDemoListItem>
              <FaRegCircleCheck size={22} />
              Warm lead collection in exchange from promo codes.
            </LiveDemoListItem>
            <LiveDemoListItem>
              <FaRegCircleCheck size={22} />
              Keyword-based instant customer service simulation.
            </LiveDemoListItem>
          </LiveDemoList>
          <BlackButton href="/agent-mart">Launch Live Demo Store</BlackButton>
        </LiveDemoPrimarySection>
      </LiveDemoSectionHeader>
    </LiveDemoMainConatiner>
  );
};
