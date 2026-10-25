import { useId } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type BarridoProps = {
  // Desenfoque horizontal máximo (px) en el centro del barrido.
  desenfoque?: number;
  // Desplazamiento máximo como fracción del ancho.
  desplazamiento?: number;
};

// Whip pan: la escena se barre hacia la izquierda con desenfoque de movimiento horizontal
// y el cambio de clip ocurre en el punto de máximo desenfoque, para que no se note el salto.
const Barrido: React.FC<TransitionPresentationComponentProps<BarridoProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { desenfoque = 90, desplazamiento = 0.12 },
}) => {
  const id = useId().replace(/:/g, "");
  const saliendo = presentationDirection === "exiting";
  const visible = saliendo ? p < 0.5 : p >= 0.5;
  // 0 al inicio y al final, 1 en el corte.
  const intensidad = Math.sin(Math.PI * p);
  const x = saliendo
    ? interpolate(p, [0, 0.5], [0, -desplazamiento], { extrapolateRight: "clamp" })
    : interpolate(p, [0.5, 1], [desplazamiento, 0], { extrapolateLeft: "clamp" });
  const escala = 1 + 0.3 * intensidad;

  return (
    <AbsoluteFill style={{ opacity: visible ? 1 : 0 }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="0%" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${desenfoque * intensidad} 0`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translateX(${x * 100}%) scale(${escala})`,
          filter: intensidad > 0.01 ? `url(#${id})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const barrido = (
  props: BarridoProps = {},
): TransitionPresentation<BarridoProps> => ({
  component: Barrido,
  props,
});
