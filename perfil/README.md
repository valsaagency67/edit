# Foto de perfil (fondo rojo con negro)

A partir de un pantallazo de Instagram (foto dentro del círculo, con el botón del lápiz encima):

1. `perfil.py`: recorta el círculo, sube la calidad x4 con Real-ESRGAN x4plus, mejora la cara con GFPGAN 1.4
   (mezclado al 60 % con la de Real-ESRGAN para no cambiar la identidad; alineada a la plantilla FFHQ con
   5 puntos marcados a mano), quita el fondo con rembg (BiRefNet-portrait) y limpia el color de los bordes.
   El lápiz queda fuera de la silueta, así que sale con el fondo.
2. `compose.py [rojo|azul]`: fondo rojo (o azul) que se va a negro, halo y luz de borde del mismo color, persona un 8 % más grande para que
   el corte curvo de la chaqueta quede fuera del círculo. Salida 2048x2048 (PNG/JPG) y 1080x1080.

Modelos (no versionados): `models/RealESRGAN_x4plus.pth` (xinntao/Real-ESRGAN v0.1.0) y
`models/GFPGANv1.4.pth` (TencentARC/GFPGAN v1.3.0). Dependencias: torch (CPU), spandrel, rembg, pymatting, opencv.
