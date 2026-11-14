import React from "react";

// Íconos de línea blancos para las tarjetas gráficas (viewBox 100x100, trazo 6).
export type IconName = "bill" | "wallet" | "bridge" | "search" | "scale";

const paths: Record<IconName, React.ReactNode> = {
  bill: (
    <>
      <rect x="8" y="26" width="84" height="48" rx="6" />
      <circle cx="50" cy="50" r="13" />
      <path d="M50 41v18M45 45.5c0-2.5 2.2-4 5-4s5 1.5 5 3.5-2 3-5 3.6-5 1.6-5 3.6 2.2 3.8 5 3.8 5-1.5 5-4" />
      <path d="M18 36h6M76 64h6" />
    </>
  ),
  wallet: (
    <>
      <path d="M14 30h66a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V30z" />
      <path d="M14 30l50-14 6 14" />
      <path d="M86 46H66a8 8 0 0 0 0 16h20z" />
      <circle cx="68" cy="54" r="2.5" />
      <path d="M30 8l8 10M50 6v10M70 8l-8 10" />
    </>
  ),
  bridge: (
    <>
      <path d="M4 44h92M4 52h92" />
      <path d="M12 52c0 18 16 30 38 30s38-12 38-30" />
      <path d="M12 52v34M88 52v34M30 52v20M70 52v20" />
      <path d="M50 40l-5 9 7 6-6 10 5 8" />
    </>
  ),
  search: (
    <>
      <circle cx="42" cy="42" r="26" />
      <path d="M61 61l27 27" />
      <path d="M30 42h24M42 30v24" />
    </>
  ),
  scale: (
    <>
      <path d="M50 10v76M28 86h44M20 22h60" />
      <path d="M20 22L8 52h24zM80 22L68 52h24z" />
      <path d="M8 52c0 7 5.4 12 12 12s12-5 12-12M68 52c0 7 5.4 12 12 12s12-5 12-12" />
      <circle cx="50" cy="16" r="5" />
    </>
  ),
};

export const Icon: React.FC<{ name: IconName; size: number }> = ({
  name,
  size,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke="white"
    strokeWidth={6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths[name]}
  </svg>
);
