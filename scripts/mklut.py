import numpy as np, sys
N=33; out=sys.argv[1]; exposure=float(sys.argv[2]) if len(sys.argv)>2 else 1.0
R0=-0.05641088; Rt=0.01; c=47.28711236; b=0.00964052; g=0.08550479; be=0.69336945
Pt=c*(Rt-R0)**2
def dec(P):
    return np.where(P>=Pt, 2**((P-be)/g)-b, np.where(P>=0, np.sqrt(np.clip(P,0,None)/c)+R0, R0))
M=np.array([[1.6605,-0.5876,-0.0728],[-0.1246,1.1329,-0.0083],[-0.0182,-0.1006,1.1187]])  # 2020->709
def tm(x):  # ACES-ish filmic (Narkowicz)
    x=x*exposure
    a,bb,cc,d,e=2.51,0.03,2.43,0.59,0.14
    return np.clip((x*(a*x+bb))/(x*(cc*x+d)+e),0,1)
def oetf(L):
    return np.where(L<0.018,4.5*L,1.099*L**0.45-0.099)
v=np.linspace(0,1,N)
with open(out,"w") as f:
    f.write(f"LUT_3D_SIZE {N}\n")
    for bi in v:
        for gi in v:
            for ri in v:
                lin=dec(np.array([ri,gi,bi]))
                lin=M@lin
                lin=np.clip(lin,0,None)
                o=oetf(tm(lin*1.0))
                # mild saturation boost
                l=0.2126*o[0]+0.7152*o[1]+0.0722*o[2]; o=np.clip(l+(o-l)*1.12,0,1)
                f.write(f"{o[0]:.6f} {o[1]:.6f} {o[2]:.6f}\n")
