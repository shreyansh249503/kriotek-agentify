import {
  TooltipContainer,
  TooltipLabel,
  TooltipRow,
  Indicator,
  ValueName,
  ValueText,
} from "./styled";

export interface ChartTooltipItem {
  name?: string;
  value?: string | number;
  fill?: string;
  payload?: {
    rawName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string;
}

export const ChartTooltip = ({
  active,
  payload,
  label,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const currentData = payload[0]?.payload;
  const displayTitle =
    currentData?.rawName || (label ? label.replace(/\u200B/g, "") : "");

  return (
    <TooltipContainer>
      <TooltipLabel>{displayTitle}</TooltipLabel>
      {payload.map((p, i) => (
        <TooltipRow key={i}>
          <Indicator $fill={p.fill} $name={p.name} />
          <ValueName>{p.name}:</ValueName>
          <ValueText>{p.value}</ValueText>
        </TooltipRow>
      ))}
    </TooltipContainer>
  );
};
