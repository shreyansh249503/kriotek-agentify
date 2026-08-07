export interface StatsCardProps {
  botsLength: number | string;
  title: string;
  deltaText?: string;
  icon?: React.ReactNode;
  statDelta?: React.ReactNode;
  isUp?: boolean;
}