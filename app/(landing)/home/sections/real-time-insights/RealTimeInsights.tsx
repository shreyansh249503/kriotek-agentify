import { BlackButton } from "@/components";
import { CheckCircle } from "@phosphor-icons/react";
import {
  FlowtingImage,
  RealTimeInsightsDashboardImage,
  RealTimeInsightsDescription,
  RealTimeInsightsHeading,
  RealTimeInsightsList,
  RealTimeInsightsListItem,
  RealTimeInsightsMainConatiner,
  RealTimeInsightsPrimarySection,
  RealTimeInsightsSecondarySection,
  RealTimeInsightsSectionHeader,
  RealTimeInsightsTitleBtn,
} from "./styled";
import DashboardImage from "@/assets/images/Dashboard.svg";
import DashboardMainBg from "@/assets/images/realtimeflowtingimg.svg";

export const RealTimeInsights = () => {
  return (
    <RealTimeInsightsMainConatiner>
      <RealTimeInsightsSectionHeader>
        <RealTimeInsightsSecondarySection>
          <RealTimeInsightsDashboardImage
            src={DashboardImage}
            width={1000}
            height={1000}
            alt="dashboard image"
          />
        </RealTimeInsightsSecondarySection>
        <RealTimeInsightsPrimarySection>
          <RealTimeInsightsTitleBtn>
            Real Time Analytics
          </RealTimeInsightsTitleBtn>
          <RealTimeInsightsHeading>
            Track. Analyze. Grow
          </RealTimeInsightsHeading>
          <RealTimeInsightsDescription>
            Get real-time insights into conversations, leads that helps you to
            expand your business. You can track your Agent performance and
            optimize it for better results.
          </RealTimeInsightsDescription>
          <RealTimeInsightsList>
            <RealTimeInsightsListItem>
              <CheckCircle size={22} />
              Live conversations
            </RealTimeInsightsListItem>
            <RealTimeInsightsListItem>
              <CheckCircle size={22} />
              Performance metrics
            </RealTimeInsightsListItem>
            <RealTimeInsightsListItem>
              <CheckCircle size={22} />
              Lead analytics
            </RealTimeInsightsListItem>
            <RealTimeInsightsListItem>
              <CheckCircle size={22} />
              Conversion tracking
            </RealTimeInsightsListItem>
          </RealTimeInsightsList>
          <BlackButton>Explore all features</BlackButton>
        </RealTimeInsightsPrimarySection>
      </RealTimeInsightsSectionHeader>
      <FlowtingImage
        src={DashboardMainBg}
        width={1000}
        height={1000}
        alt="flowting img"
      />
    </RealTimeInsightsMainConatiner>
  );
};
