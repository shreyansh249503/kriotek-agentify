import { COLOR } from "@/styles";

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
    <div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${COLOR.BORDER}66`,
        borderRadius: 16,
        padding: "12px 16px",
        fontSize: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: "0 0 8px", fontWeight: 700, color: COLOR.DARK }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "6px 0",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                p.fill ||
                (p.name === "Engagement" ? COLOR.PRIMARY : COLOR.DARK),
              boxShadow: `0 0 8px ${p.fill}44`,
            }}
          />
          <span style={{ color: COLOR.TEXT_SECONDARY, fontWeight: 500 }}>
            {p.name}:
          </span>
          <span
            style={{ marginLeft: "auto", fontWeight: 700, color: COLOR.DARK }}
          >
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};
