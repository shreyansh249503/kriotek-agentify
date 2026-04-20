import {
  BenefitContent,
  BenefitDescription,
  BenefitItem,
  BenefitNumber,
  BenefitTitle,
} from "./styled";
import { InstructionCardProps } from "./type";

export const InstructionCard = ({
  number,
  title,
  description,
}: InstructionCardProps) => {
  return (
    <BenefitItem>
      <BenefitNumber>{number}</BenefitNumber>
      <BenefitContent>
        <BenefitTitle>{title}</BenefitTitle>
        <BenefitDescription>{description}</BenefitDescription>
      </BenefitContent>
    </BenefitItem>
  );
};
