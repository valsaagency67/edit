# Video político — Juan Felipe Castaño

Proyecto Remotion (plantilla TikTok, vertical 9:16) para un video de campaña
con muchos estímulos de retención: gancho en los primeros 2 s, cortes rápidos,
subtítulos dinámicos palabra por palabra, zooms/sacudidas, textos animados,
transiciones con efectos de sonido, barra de progreso y cierre con llamado a la acción.

Solo usar textos/datos que dé el cliente o que se digan en los videos.

## Material (Google Drive)

Carpeta: https://drive.google.com/drive/folders/1C6y3P8qQP_so6O08J0uS0pU4dGGBIAbo
("Juan felipe | Material de edición", ~6.4 GB). Descargar con `gdown --folder`
o por ID con `gdown <id>` a `media/raw/` (ignorado por git).

**Calidad máxima (requisito del cliente):** los originales nunca se recomprimen.
- Los proxies livianos solo sirven para previsualizar en Remotion Studio.
- El render final usa los archivos originales: 1080x1920 a 30/60 fps (igual al
  original), H.264 con `--crf=16` o menor (o ProRes como master), audio AAC
  320 kbps, para luego subir a Reels/TikTok sin pérdida visible.

| Archivo | Tamaño | ID |
|---|---|---|
| IMG_1696.MOV | 134 MB | 1HzOhs3LqBD7Cmvf1kjYaSGKsWua4NegL |
| IMG_1697.MOV | 1.9 GB | 1fk1_yG_bA3b7G42zxErTsvcEIIzyHsZQ |
| IMG_1698.MOV | 798 MB | 161g_nsPgKW9iqQe80-5f68fcXQsBD_1Z |
| IMG_1699.MOV | 139 MB | 1m2qEpLyaVYcVIOP-elVrTIlBn242yrpB |
| IMG_1700.MOV | 246 MB | 1oLIHye7_Le8_gC7PzWVswli-vnPUC-LC |
| IMG_1702.MOV | 119 MB | 1B3prfqpKGpXn7FQgX2l3GkJwhGHB_zbU |
| IMG_1704.MOV | 116 MB | 1fdL7lR_v-ncGgXsfNCZw1jKtJxL6Iwo0 |
| IMG_1706.MOV | 148 MB | 1sOhY8zBFS8nba2hYO2x8Qajd8wOnsXYb |
| IMG_1710.MOV | 176 MB | 1Vhqq1c393gt3RaBVxRZAyCw1SXAD1wJj |
| IMG_1713.MOV | 56 MB | 1wtNufmYLsLCDQxYVjcMS9dO2nCndtZuY |
| IMG_1717.MOV | 114 MB | 1FgbE5lUKAcRvnJtHCy9CVPDhYvAjGj7X |
| IMG_1721.MOV | 902 MB | 10PtRVXovRydGw6SmLByNZqpnWuMJBJLl |
| IMG_1724.MOV | 306 MB | 1-0lQjX5UdwLGEoY6SbhmDKlxmh9cNY9C |
| IMG_1726.MOV | 107 MB | 1kJYXQGecCU9FXZ-so6YdQf9Xj31v608i |
| IMG_1728.MOV | 208 MB | 16TBu2fOLMuy_7Phvy3joqfPnpT1lHTrA |
| IMG_1730.MOV | 51 MB | 1nfXDXONb7Dw-0pG9frjIVScN-dMWB0UK |
| IMG_1731.MOV | 112 MB | 1kqEo2osp4S1vh7c_y9_1B68Tsz4kAlHE |
| IMG_1732.MOV | 45 MB | 1yd8BgQFyvYcX0GChQOdW0RqoZaD9Un_y |
| IMG_1738.MOV | 169 MB | 1PXSNRNglTqiR0AXX7OpmXbsUNSPsV-Ii |
| IMG_1740.MOV | 167 MB | 1mIY6pOkK7ghN_5hn3yi6Xno_ePVxh9oH |
| IMG_1741.MOV | 160 MB | 1iC4LbSO1lKhry1N9e1MpRBp1eMrpz8ar |
| IMG_1742.MOV | 66 MB | 1spQ9YXT-1nLzOc0PZNbuNj2eCksgTFAg |
| IMG_1718.JPG | 2 MB | 16VU2B2E30cGOVt5zpwar21iDj9WS1D6U |
| IMG_1719.JPG | 2 MB | 1282k0QF6U5h7upYv-nHrwta9bnyfG47s |
| IMG_1720.JPG | 2 MB | 1f6lkUb1v69TA_3Q4d4PdMPjflI3786Mh |

## Pendiente del cliente

- Secuencia de los videos (orden y segmentos).
- Duración objetivo, textos clave (slogan, cargo, número de tarjetón, CTA).
- Colores/logo de campaña y música con licencia.

---

# Blog 1 — vlog "un día a día con nosotros"

Composición `Blog1` (src/Blog1), vertical 1080x1920 a 30 fps, ~6:25.

**Versión 2 (pedido del cliente): escenas completas, sin cortes, en el orden en
que se grabaron, para que se entienda la trama.** Solo se recorta tiempo muerto
al inicio/fin de cada clip. El énfasis se hace con acercamientos suaves y
títulos dentro de la escena, no con cortes.

## Material

Carpeta de Drive "Blog 1" (id `1ygcGxy_HT8DVsN_8n98HaMjpLUDk7ypA`): 13 clips de
iPhone grabados con Blackmagic Camera, HEVC 10-bit 4:2:2 en 4K, perfil
**Apple Log** (por eso se ven grises). `A001_11141850_C115.mov` está dos veces
en la carpeta (mismo archivo).

## Flujo

1. Descargar a `media/raw/blog1/` (`gdown <id> -O <nombre>.mov`).
2. `scripts/prep-blog1.sh` → `public/blog1/Cxxx.mp4`: clips completos con la LUT
   `scripts/applelog_709.cube` (Apple Log → Rec.709, generada con
   `scripts/mklut.py`), H.264 CRF 14 (verticales 1080x1920, horizontales
   3414x1920 para recortar sin reescalar hacia arriba).
3. Subtítulos: `python3 -I scripts/captions-blog1.py scripts/blog1-transcript.json src/Blog1/captions.json`
   (transcripción de Whisper + correcciones a mano en `FIXES`).
4. Escenas, títulos y acercamientos: `src/Blog1/edl.ts`.
5. Render:
   `npx remotion render Blog1 out/blog1-master.mp4 --crf=16 --audio-bitrate=320k`
   y normalizar a -14 LUFS con `loudnorm` en dos pasadas (video copiado sin recomprimir).

## Escenas (orden de grabación)

C074 arranque → C075 intro → C076 invitada Valery → C084 entreno + spoiler del
chivo → C087 "eso es Rocky" → C090 200 kilos / báilalo → C094 con Valery (baño,
piercing, espacio personal, pretty boy) → C099 cantando / "lo decimos motivando"
→ C105 "¡Pochoclo!" → C110 Pochoclo la celebridad → C113 Pochoclo llega al gym →
C115 página web → C116 Apolo Gastro Bar.

## Pendiente

- Música tipo gym (la envía el cliente): copiarla a `public/music/` y pasar
  `--props='{"music":"music/archivo.mp3","musicVolume":0.16}'`.
- Confirmar nombre del chivo ("Pochoclo") y de la invitada ("Valery").
