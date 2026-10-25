import { AbsoluteFill, Img } from "remotion";
import { z } from "zod";
import { MARCA, OUTFITS, foto } from "./material";
import { fontFamily } from "./fuente";

export const carruselSchema = z.object({
  outfit: z.enum(Object.keys(OUTFITS) as [keyof typeof OUTFITS]),
  indice: z.number().int().min(0),
});

// Una lámina del carrusel de Instagram (1080x1350, 4:5).
export const CarruselSlide: React.FC<z.infer<typeof carruselSchema>> = ({
  outfit,
  indice,
}) => {
  const fotos = OUTFITS[outfit];
  const total = fotos.length;
  const i = Math.min(indice, total - 1);
  const portada = i === 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      <Img
        src={foto(fotos[i])}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background: portada
            ? "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 38%)"
            : "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: portada ? 80 : 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          color: "white",
          fontFamily,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: portada ? 96 : 34,
            letterSpacing: portada ? 18 : 8,
            lineHeight: 1,
          }}
        >
          {MARCA}
        </div>
        <div style={{ fontWeight: 300, fontSize: 30, letterSpacing: 4 }}>
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>
    </AbsoluteFill>
  );
};
