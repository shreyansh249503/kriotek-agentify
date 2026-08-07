import {
  StatCard,
  StatCardTop,
  StatDeltaPill,
  StatLabel,
  StatValue,
} from "./styled";
import { motion } from "framer-motion";
import { StatsCardProps } from "./type";

export const StatsCard = ({
  botsLength,
  title,
  deltaText,
  icon,
  statDelta,
  isUp = true,
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
        <StatLabel>{title}</StatLabel>
        {icon && <div>{icon}</div>}
      </StatCardTop>
      <StatValue>{botsLength}</StatValue>
      {(statDelta || deltaText) && (
        <StatDeltaPill $up={isUp}>
          {statDelta}
          {deltaText && <span>{deltaText}</span>}
        </StatDeltaPill>
      )}
    </StatCard>
  );
};
