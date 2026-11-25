"""Genera src/Blog1/captions.json a partir de la transcripción de Whisper.

Uso: python3 -I scripts/captions-blog1.py <transcript.json> src/Blog1/captions.json

FIXES[clip][i] = texto corregido de la frase i de Whisper, o None para no
subtitularla (letras de canciones, frases que no se entienden). Si el número
de palabras coincide se usan los tiempos de Whisper palabra por palabra; si no,
se reparten dentro del tramo de la frase.
"""
import json, sys

FIXES = {
    "C075": {0: "Hola chicos, estamos aquí en un vlog, en un día a día con nosotros y hoy vamos a iniciar"},
    "C076": {0: "Hoy, la invitada es...", 1: None, 2: "¡Ay, abuelo!", 5: "espalda con bíceps",
             6: "acompañando así, trabajando", 7: None, 8: "Abuelo, deja de ver", 9: None},
    "C084": {3: "¡Métele, métele!", 4: "Métele sabroso.", 13: "Bueno, ¿me crees?"},
    "C087": {1: "Eso es Rocky, eso es Rocky, eso es Valery, eso es Valery.", 2: "¡Vamos, vamos, vamos, vamos!",
             3: "¡Métele, métele, métele sabroso!", 4: None, 5: "¡Dame rostro, dame rostro, dame rostro!", 6: None},
    "C090": {1: None, 2: None, 3: "Eso va a aparecer, sí...", 6: "¡Báilalo, Rocky, báilalo!", 7: "¡Báilalo!",
             8: "¡Dame rostro, dame rostro!"},
    "C094": {0: "Los hombres te dan ¿qué? Una fucking rabia", 1: "¿Por qué? Quiero llorar, vamos a los baños a llorar",
             2: "Oye, Valery, tranquila", 3: "Yo no estoy depresivo, ella sí",
             4: "Digo, es que vamos para el baño", 5: "a llorar, a llorar, a llorar",
             6: "A ella no, a ella le dijo eso", 7: "Dijo vamos para el baño, a ella le dijo que iba a qué",
             8: "Sí, yo no escuché nada", 9: "¿Y ahorita qué fue lo que le ha dicho?", 10: "Ay, vamos a dormir",
             12: "Vámonos a dormir", 13: "No sé cómo interpretar eso, la verdad", 14: "Chicos, chicos, chicos, me estoy asustando",
             15: "¿En dónde?", 18: "¿Lo puedo tocar? No", 19: "¿Por qué?", 20: "¿Y el piercing?", 21: "¿El piercing?",
             22: "O sea, la oreja no, ¿el piercing?", 23: "No", 24: "Ah, bueno, ¿puedo verla?",
             25: "Nadie mi cuerpito puede tocar", 26: "Espacio personal: 2 metros", 27: "Pero, ¿puedo verla?",
             28: "¡Oh, wow!", 30: None, 31: None, 32: "Chica, eres la bomba", 33: "No la ayudes", 35: None,
             36: "¡Oh, wow, qué fuerte eres!", 37: "El que marca los músculos de una forma", 38: "uno le dice que está bien",
             39: "Es que no le quería poner 5 porque primero lo quería probar", 40: "Sí, es la guapa",
             41: "El hombre más barbado de toda Colombia", 42: "¿Maluma?", 43: None, 44: None,
             45: "el pretty boy", 46: "¡El pretty boy!", 47: None},
    "C099": {**{i: None for i in range(9)}, 9: "¿Cómo así?", 10: "Lo decimos motivando, chicos", 11: "Lo decimos motivando",
             12: None, 13: None, 14: None, 15: None},
    "C105": {0: "¡Pochoclo! ¡Pochoclo! ¡Pochoclo!"},
    "C110": {0: "Todo el mundo mira a Pochoclo, es como si fuera una celebridad.", 2: None},
    "C113": {1: None, 2: None, 3: "¡Ay, apártate!", 5: None},
    "C115": {0: "Bueno, muchachos, salimos del gym, estamos trabajando en una página web y les estamos metiendo duro un poquito de todo de nuestro día."},
    "C116": {0: "Bueno, y ahora estamos en Apolo Gastro Bar", 1: "Grabando en Apolo Gastro Bar", 3: "Como siempre",
             4: "O sea, es manejando la tranquilidad", 5: "Eso es todo"},
}

def main(src, dst):
    d = json.load(open(src))
    out = {}
    for clip, segs in sorted(d.items()):
        words = []
        fixes = FIXES.get(clip, {})
        for i, s in enumerate(segs):
            text = fixes.get(i, s["text"].strip())
            if text is None:
                continue
            toks = text.split()
            ws = s["words"]
            if len(toks) == len(ws):
                times = [(w["s"], w["e"]) for w in ws]
            else:  # repartir proporcional al largo de cada palabra
                a, b = s["start"], s["end"]
                tot = sum(len(t) + 2 for t in toks)
                times, c = [], a
                for t in toks:
                    dur = (b - a) * (len(t) + 2) / tot
                    times.append((c, c + dur)); c += dur
            for t, (a, b) in zip(toks, times):
                words.append([t, round(a, 3), round(max(b, a + 0.08), 3)])
        out[clip] = words
    json.dump(out, open(dst, "w"), ensure_ascii=False, indent=0)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
