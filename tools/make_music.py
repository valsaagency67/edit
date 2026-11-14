"""Música de fondo cálida y familiar (arpegio de guitarra sintetizada, Do-Sol-Lam-Fa). Original, sin derechos."""
import numpy as np, wave, sys
SR=48000; DUR=float(sys.argv[1]); out=sys.argv[2]
rng=np.random.default_rng(7)
def pluck(f,dur,amp=1.0):
    n=int(SR*dur); N=int(SR/f); buf=rng.uniform(-1,1,N)
    y=np.zeros(n)
    for i in range(n):
        y[i]=buf[i%N]; buf[i%N]=0.4975*(buf[i%N]+buf[(i+1)%N])
    return y*amp*np.exp(-np.arange(n)/(SR*dur*0.55))
mid=lambda m:440*2**((m-69)/12)
chords=[[48,55,64,67],[43,55,62,67],[45,57,64,69],[41,57,65,69]]  # C G Am F
bpm=84; beat=60/bpm; step=beat/2
mix=np.zeros(int(SR*(DUR+3)))
t=0.0; i=0; pat=[0,1,2,3,2,1,2,1]
while t<DUR+0.5:
    ch=chords[(i//8)%4]; note=ch[pat[i%8]]
    y=pluck(mid(note),1.6,0.9 if pat[i%8]==0 else 0.6)
    s=int(t*SR); mix[s:s+len(y)]+=y[:len(mix)-s]; t+=step; i+=1
mix=mix[:int(SR*DUR)]
# suavizar: pasa-bajos simple + fade in/out
k=np.ones(6)/6; mix=np.convolve(mix,k,'same')
fi=int(SR*1.0); fo=int(SR*1.5)
mix[:fi]*=np.linspace(0,1,fi); mix[-fo:]*=np.linspace(1,0,fo)
mix/=np.abs(mix).max()*1.1
st=np.stack([mix,np.roll(mix,60)],1)  # leve ancho estéreo
w=wave.open(out,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
