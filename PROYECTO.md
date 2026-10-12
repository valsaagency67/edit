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

## Formato real de los originales (verificado)

Todos los .MOV son de iPhone: **HEVC 10-bit 3840x2160 grabado en vertical**
(metadato de rotación), **HDR HLG + Dolby Vision 8.4**, ~120 fps variable
(IMG_1713 es 60 fps), audio AAC. Duración total ≈ 8 min 50 s.
Las 3 fotos (IMG_1718–1720.JPG) son 2160x3840.

Chromium (Remotion) no decodifica bien HEVC HDR: se vería lavado o saturado.
Por eso hay dos derivados, siempre generados desde `media/raw/` (que nunca se toca):

| Derivado | Script | Formato | Uso |
|---|---|---|---|
| Proxy | `npm run proxies` → `public/proxy/` | 540x960, 30 fps, H.264 crf 26 | Solo Remotion Studio |
| Master | `npm run master -- IMG_XXXX.MOV [inicio dur]` → `public/master/` | 1080x1920, 60 fps CFR, ProRes 422 HQ 10-bit (`prores_aw`), PCM 48 kHz | Render final |
| Audio | `npm run audio` → `media/audio/` | WAV 16 kHz mono | Whisper |

HDR→SDR (`scripts/hdr.sh`; el master usa la misma conversión horneada en una LUT 3D, `media/lut/`, 40 dB PSNR vs. el filtro directo y ~2× más rápido): zscale a lineal + tonemap hable (desat=2) a BT.709,
elegido comparando variantes en un fotograma (sin tonemap se ve lavado; mobius
satura el rojo de la camiseta). El escalado del master es lanczos desde 4K.

Render final: `npm run render:vigilante` / `npm run render:concejal` → `out/`
(H.264 crf 14, BT.709, 60 fps, AAC 320 kbps), leyendo de `public/master/`.

## Videos (src/campaign/)

Clips usados (los únicos indicados por el cliente): IMG_1696, 1697, 1702, 1704,
1706, 1710, 1713. La secuencia y los cortes viven en `src/campaign/edl.ts`.

- **JFC-Vigilante (65 s):** IMG_1697 0–19 s (el vigilante le dice que no pueden
  estar ahí) → 1696 → 1702 → 1704 → 1706 → 1710 → cierre.
- **JFC-Concejal (71 s):** 1713 (Juan Felipe atacando al concejal) → 1697
  19–53 s (discusión) → 1704 → 1706 → 1710 → cierre.

Estímulos: gancho de texto en los primeros 2.6 s, jump cuts quitando cada
silencio > 0.35 s con encuadre alterno (1.0×/1.16×) y pop de zoom, empuje lento
continuo, flash + sacudida + whoosh en cada cambio de clip, textos pop con
sonido ("Abogado Javeriano", "Liderazgo social en Palmira" — del perfil de
Instagram), banner fijo con el nombre y la barra de 5 colores, barra de progreso
y cierre con "¡Súmate a construir una Palmira mejor!" + @juanfelipecastano_col.
Sin subtítulos palabra por palabra mientras no haya transcripción.

## Transcripciones

`npm run transcribe` → `public/subs/IMG_XXXX.json` (palabra por palabra, para
los subtítulos) y `TRANSCRIPCIONES.md` (legible, con tiempos para elegir cortes).
Usa whisper.cpp 1.7.5 + `large-v3-turbo` en español. El modelo se descarga de
huggingface.co.

## Pendiente del cliente

- Secuencia de los videos (orden y segmentos).
- Duración objetivo, textos clave (slogan, cargo, número de tarjetón, CTA).
- Colores/logo de campaña y música con licencia.
