import React from "react";
import {
  BotOverviewCardContainer,
  BotOverviewCardContainer2,
  BotOverviewCardContainer2Image,
  BotOverviewCardFooterContainer,
  BotOverviewCardHeader,
  BotOverviewCardHeaderContainer,
  BotOverviewCardImage,
  BotOverviewCardMessageWrapper,
  BotOverviewCardOrderDetailsImage,
  BotOverviewCardSubContainer,
  BotOverviewContainer,
  BotOverviewHeading,
  BotOverviewMainContainer,
  BotOverviewTitleBtn,
} from "./styled";
import BotOverviewUserImg from "@/assets/images/bot-overview-user.svg";
import BotOverviewAgentifyLogo from "@/assets/images/bot-overview-agentify-log.svg";
import BotOverviewOrderDetails from "@/assets/images/order-details.svg";
import BotOverviewOrderDetailsImage from "@/assets/images/Bot-overview-2.png";

export const BotOverview = () => {
  return (
    <BotOverviewMainContainer>
      <BotOverviewContainer>
        <BotOverviewCardContainer>
          <BotOverviewCardHeader>
            <BotOverviewTitleBtn>Powerful Order Tracking</BotOverviewTitleBtn>
            <BotOverviewHeading>
              Slash “ Where is my order? ” tickets by up to 80%.
            </BotOverviewHeading>
          </BotOverviewCardHeader>
          <BotOverviewCardSubContainer>
            <BotOverviewCardHeaderContainer>
              <BotOverviewCardMessageWrapper>
                Where is my order #1002
              </BotOverviewCardMessageWrapper>
              <BotOverviewCardImage
                src={BotOverviewUserImg}
                width={500}
                height={500}
                alt="Card Image"
              />
            </BotOverviewCardHeaderContainer>
            <BotOverviewCardFooterContainer>
              <BotOverviewCardImage
                src={BotOverviewAgentifyLogo}
                width={500}
                height={500}
                alt="Card Image"
              />
              <BotOverviewCardOrderDetailsImage
                src={BotOverviewOrderDetails}
                width={1000}
                height={1000}
                alt="card image"
              />
            </BotOverviewCardFooterContainer>
          </BotOverviewCardSubContainer>
        </BotOverviewCardContainer>
        <BotOverviewCardContainer2>
          <BotOverviewCardHeader>
            <BotOverviewTitleBtn>Multi Agent Architecture</BotOverviewTitleBtn>
            <BotOverviewHeading>
              The right agent for every customer interaction.
            </BotOverviewHeading>
          </BotOverviewCardHeader>
          <BotOverviewCardContainer2Image
            src={BotOverviewOrderDetailsImage}
            width={500}
            height={500}
            alt="card img"
          />
        </BotOverviewCardContainer2>
      </BotOverviewContainer>
    </BotOverviewMainContainer>
  );
};
