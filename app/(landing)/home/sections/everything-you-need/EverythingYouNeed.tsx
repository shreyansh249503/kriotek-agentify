import {
  EverythingYouNeedCardContainer,
  EverythingYouNeedCardDescription,
  EverythingYouNeedCardImage,
  EverythingYouNeedCardSubContainer,
  EverythingYouNeedCardTitle,
  EverythingYouNeedHeading,
  EveryThingYouNeedMainContainer,
  EverythingYouNeedSectionConatiner,
  EverythingYouNeedSectionHeader,
  EverythingYouNeedTitleBtn,
} from "./styled";
import Card1 from "@/assets/images/shopify_logo_icon.svg";
import Card2 from "@/assets/images/order-tracking.svg";
import Card3 from "@/assets/images/catelog.svg";
import Card4 from "@/assets/images/rag.svg";
import Card5 from "@/assets/images/lead-capture.svg";
import Card6 from "@/assets/images/dual-agent.svg";
import Card7 from "@/assets/images/human-handoff.svg";
import Card8 from "@/assets/images/widget-customize.svg";

const CARDS = [
  {
    image: Card1,
    title: "Shopify Integration",
    description:
      "1-click connection, Auto sync products, inventory, prices & updates via GraphQL APL",
  },
  {
    image: Card2,
    title: "Real - Time Order Tracking",
    description:
      "Customers can check order status, tracking links, delivery details in real - time.",
  },
  {
    image: Card3,
    title: "Product Catalog Sync",
    description:
      "Always up-to-date with your products, variants, stock, pricing & images.",
  },
  {
    image: Card4,
    title: "AI Knowledge Base (RAG)",
    description:
      "Train AI on your website, PDF's & FAQ’s. Get accurate answers instantly.",
  },
  {
    image: Card5,
    title: "Lead Capturing & Qualification",
    description:
      "AI captures high - income leads, verifies details and notifies you in real - time.",
  },
  {
    image: Card6,
    title: "Dual-Agent Architecture",
    description:
      "Receptionist Agent welcomes visitors while Lead Agent closes more deals.",
  },
  {
    image: Card7,
    title: "Human Handoff",
    description:
      "Switch to human support instantly. Full chat history is always preserved.",
  },
  {
    image: Card8,
    title: "Brand & Widget Customization",
    description:
      "1-click connection, Auto sync products, inventory, prices & updates via GraphQL APL",
  },
];

export const EverythingYouNeed = () => {
  return (
    <EveryThingYouNeedMainContainer>
      <EverythingYouNeedSectionHeader>
        <EverythingYouNeedTitleBtn>
          Everything You Need
        </EverythingYouNeedTitleBtn>
        <EverythingYouNeedHeading>
          Things need to grow your Shopify
        </EverythingYouNeedHeading>
      </EverythingYouNeedSectionHeader>
      <EverythingYouNeedSectionConatiner>
        {CARDS.map((card) => (
          <EverythingYouNeedCardContainer key={card.title}>
            <EverythingYouNeedCardImage
              src={card.image}
              width={500}
              height={500}
              alt={card.title}
            />
            <EverythingYouNeedCardSubContainer>
              <EverythingYouNeedCardTitle>
                {card.title}
              </EverythingYouNeedCardTitle>
              <EverythingYouNeedCardDescription>
                {card.description}
              </EverythingYouNeedCardDescription>
            </EverythingYouNeedCardSubContainer>
          </EverythingYouNeedCardContainer>
        ))}
      </EverythingYouNeedSectionConatiner>
    </EveryThingYouNeedMainContainer>
  );
};
