import React from "react";
import { AbsoluteFill } from "remotion";

// Portadas de historias destacadas (1080x1920). Instagram las muestra recortadas en un
// círculo al centro, así que el ícono va dentro de un diámetro de ~620 px en el centro.
// Colores de campaña: rojo y azul (cliente), con la barra de 5 colores de la marca.
const BRAND = ["#F39200", "#1D3E9E", "#E30613", "#0A9A48", "#5B2C8F"];
const BG = {
  red: "radial-gradient(circle at 50% 45%, #ff2a36 0%, #E30613 45%, #a8000c 100%)",
  blue: "radial-gradient(circle at 50% 45%, #3b63d6 0%, #1D3E9E 50%, #0f2466 100%)",
};

const ICONS: Record<string, React.ReactNode> = {
  // "i" de información dentro de un círculo.
  info: (
    <>
      <circle cx="50" cy="50" r="40" />
      <path d="M50 44v28" />
      <circle cx="50" cy="30" r="2.5" fill="white" />
    </>
  ),
  // Grupo de tres personas (juventud, comunidad).
  people: (
    <>
      <circle cx="50" cy="32" r="11" />
      <path d="M30 78c0-12 9-21 20-21s20 9 20 21" />
      <circle cx="22" cy="42" r="8" />
      <path d="M8 76c0-9 6-15 14-15 3 0 6 1 8 3" />
      <circle cx="78" cy="42" r="8" />
      <path d="M92 76c0-9-6-15-14-15-3 0-6 1-8 3" />
    </>
  ),
  // Pin de ubicación sobre una base (territorio, barrios).
  pin: (
    <>
      <path d="M50 88s26-26 26-46a26 26 0 0 0-52 0c0 20 26 46 26 46z" />
      <circle cx="50" cy="42" r="10" />
      <path d="M22 92h56" />
    </>
  ),
};

export const Highlight: React.FC<{ icon: string; color: "red" | "blue" }> = ({
  icon,
  color,
}) => (
  <AbsoluteFill
    style={{
      background: BG[color],
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 44,
    }}
  >
    <svg
      width={580}
      height={580}
      viewBox="0 0 100 100"
      fill="none"
      stroke="white"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.25))" }}
    >
      {ICONS[icon]}
    </svg>
    <div
      style={{
        display: "flex",
        width: 360,
        height: 16,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {BRAND.map((c) => (
        <div key={c} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </div>
  </AbsoluteFill>
);
