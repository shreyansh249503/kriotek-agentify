import {
  FeatureCard,
  FeatureDescription,
  FeatureIcon,
  FeatureTitle,
} from "./styled";
import { FeaturesCardProps } from "./type";

export const FeaturesCard = ({
  icon,
  title,
  description,
}: FeaturesCardProps) => {
  return (
    <FeatureCard>
      <FeatureIcon>{icon}</FeatureIcon>
      <FeatureTitle>{title}</FeatureTitle>
      <FeatureDescription>{description}</FeatureDescription>
    </FeatureCard>
  );
};
