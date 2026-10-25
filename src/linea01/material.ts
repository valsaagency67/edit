import { staticFile } from "remotion";

export const MARCA = "LÍNEA 01";

// Fotos convertidas desde los HEIC/JPG del Drive ("Linea nia") a public/linea01/fotos.
// Agrupadas por outfit para armar un carrusel por prenda.
export const OUTFITS = {
  jeanCeleste: [
    "IMG_0578.jpg",
    "IMG_0589.jpg",
    "IMG_0596.jpg",
    "IMG_0605.jpg",
    "IMG_0606.jpg",
  ],
  vinotintoCafe: ["IMG_0674.jpg", "IMG_0669.jpg"],
  rojoBlanco: ["IMG_0689.jpg", "IMG_0694.jpg", "IMG_0698.jpg", "IMG_0701.jpg"],
} as const;

export type OutfitId = keyof typeof OUTFITS;

export const foto = (nombre: string) => staticFile(`linea01/fotos/${nombre}`);
