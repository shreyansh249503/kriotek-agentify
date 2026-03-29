import {
  StatCard,
  StatCardTop,
  StatDelta,
  StatIconBox,
  StatLabel,
  StatValue,
} from "./styled";
import { motion } from "framer-motion";
import { COLOR } from "@/styles";
import { StatsCardProps } from "./type";

export const StatsCard = ({
  botsLength,
  title,
  deltaText,
  icon,
  statDelta,
}: StatsCardProps) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  } as const;
  return (
    <StatCard as={motion.div} variants={itemVariants}>
      <StatCardTop>
        <StatIconBox $color={COLOR.DARK}>{icon}</StatIconBox>
        <StatDelta $up>
          {statDelta} {deltaText}
        </StatDelta>
      </StatCardTop>
      <StatValue>{botsLength}</StatValue>
      <StatLabel>{title}</StatLabel>
    </StatCard>
  );
};
