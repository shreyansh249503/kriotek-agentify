import {
  TooltipContainer,
  TooltipLabel,
  TooltipRow,
  Indicator,
  ValueName,
  ValueText,
} from "./styled";

export const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; fill: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <TooltipContainer>
      <TooltipLabel>{label}</TooltipLabel>
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
