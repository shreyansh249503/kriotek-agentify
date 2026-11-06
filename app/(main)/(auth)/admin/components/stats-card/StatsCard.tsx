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

  const slug = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <StatCard as={motion.div} variants={itemVariants} data-testid={`stats-card-${slug}`}>
      <StatCardTop>
        <StatLabel data-testid="stat-label">{title}</StatLabel>
        {icon && <div>{icon}</div>}
      </StatCardTop>
      <StatValue data-testid="stat-value">{botsLength}</StatValue>
      {(statDelta || deltaText) && (
        <StatDeltaPill $up={isUp} data-testid="stat-delta">
          {statDelta}
          {deltaText && <span>{deltaText}</span>}
        </StatDeltaPill>
      )}
    </StatCard>
  );
};
