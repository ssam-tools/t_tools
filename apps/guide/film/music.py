#!/usr/bin/env python3
"""쌤 노트 소개 영상 배경음악 — 코드로 직접 작곡 (외부 음원·샘플 0개, 저작권 걱정 없음)

  python3 music.py teacher out.wav   → 45초 · 120 BPM · 밝은 팝 (C–G–Am–F)
  python3 music.py student out.wav   → 25초 · 120 BPM · 8비트 게임 느낌 (F–G–Em–Am → 레벨 업 팡파르)

박자는 영상 장면과 맞물립니다: 1박 = 0.5초, 1마디 = 2초.
  선생님: 0~1초 시작음 · 1~3초 시계 째깍 · 3초 '쿵' 시작 · 3~37초 마디마다 장면 1개(17개) · 37초 퇴근 도장 쾅 · 45초 끝
  학생:   0~1초 파워업 · 1~3초 끌어올리기 · 3~21초 마디마다 장면 1개(9개) · 21초 레벨 업 팡파르 · 25초 끝
필요한 것: numpy, scipy (python 기본 wave 로 저장)
"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100
BEAT = 0.5
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {"C": 60, "D": 62, "E": 64, "F": 65, "G": 67, "A": 69, "B": 71}
CH = {  # 코드 구성음 (MIDI, 가운데 옥타브)
    "C": [60, 64, 67], "G": [55, 59, 62], "Am": [57, 60, 64], "F": [53, 57, 60], "Em": [52, 55, 59], "Dm": [50, 53, 57],
}
ROOT = {"C": 48, "G": 43, "Am": 45, "F": 41, "Em": 40, "Dm": 38}


class Mix:
    def __init__(self, sec):
        self.n = int(sec * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= self.n or i + len(sig) <= 0:
            return
        if i < 0:
            sig = sig[-i:]; i = 0
        sig = sig[: self.n - i]
        l = gain * np.cos((pan + 1) * np.pi / 4) * 1.414
        r = gain * np.sin((pan + 1) * np.pi / 4) * 1.414
        self.L[i:i + len(sig)] += sig * l
        self.R[i:i + len(sig)] += sig * r

    def out(self, fade_in=0.02, fade_out=1.2):
        x = np.vstack([self.L, self.R])
        fi = int(fade_in * SR); fo = int(fade_out * SR)
        x[:, :fi] *= np.linspace(0, 1, fi)
        x[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
        x = x / (np.max(np.abs(x)) + 1e-9) * 1.25
        x = np.tanh(x) * 0.89          # 부드러운 리미터
        return x


def env(n, a=0.005, d=0.3, s=0.0, sus_t=0.0, r=0.05):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), 1.0)
    dec = np.exp(-(t - a) / max(d, 1e-6))
    e = np.where(t >= a, s + (1 - s) * dec, e)
    if sus_t:
        tail = t > sus_t
        e[tail] *= np.exp(-(t[tail] - sus_t) / max(r, 1e-6))
    return e


def lp(x, fc, order=2):
    b, a = butter(order, min(fc / (SR / 2), 0.99), "low"); return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, min(fc / (SR / 2), 0.99), "high"); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], "band"); return lfilter(b, a, x)


# ───────── 악기 (모두 수식으로 만든 소리) ─────────
def kick(dur=0.35, hard=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.16)
    click = rng.standard_normal(n) * np.exp(-t / 0.004) * 0.3
    return (s + click) * hard


def clap(dur=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 900, 5000)
    e = np.exp(-t / 0.06)
    for k in (0.0, 0.011, 0.022):          # 손뼉 여러 번 겹친 느낌
        e += 0.6 * np.exp(-np.clip(t - k, 0, None) / 0.008) * (t >= k)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.4
    return nz * e * 0.5 + tone


def hat(dur=0.05, open_=False):
    if open_: dur = 0.22
    n = int(dur * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / (0.07 if open_ else 0.012))


def crash(dur=2.2):
    n = int(dur * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 3500) * np.exp(-t / 0.7) * 0.6


def tick(hi=True):
    n = int(0.06 * SR); t = np.arange(n) / SR
    f = 2600 if hi else 1900
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t / 0.012)


def epiano(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.15) + 0.12 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.05)
    return s * env(n, 0.003, 0.5, 0.15, dur * 0.8, 0.05)


def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for det in (-0.12, 0.0, 0.12):
            f = hz(m + det)
            s += (2 * ((f * t) % 1) - 1) * 0.33        # 톱니파 3겹
    s = lp(s, 1400)
    a = np.minimum(t / 0.4, 1) * np.minimum((dur - t) / 0.4, 1)
    return s * np.clip(a, 0, 1) / len(ms)


def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.25 * np.sin(2 * np.pi * 3 * f * t)
    return np.tanh(1.5 * s) * env(n, 0.004, 0.25, 0.5, dur * 0.85, 0.03)


def pluck(m, dur):
    """카플러스-스트롱 현 소리 (뜯는 기타·하프 느낌)"""
    n = int(dur * SR); f = hz(m); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        j = i % p
        out[i] = buf[j]
        buf[j] = 0.5 * (buf[j] + buf[(j + 1) % p]) * 0.996
    return out * env(n, 0.001, 0.6, 0.0)


def glock(m, dur=0.8):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.08)) * np.exp(-t / 0.35)


def square(m, dur, duty=0.5, a=0.003, d=0.12, s=0.6):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    w = np.where((f * t) % 1 < duty, 1.0, -1.0)
    return w * env(n, a, d, s, dur * 0.9, 0.02)


def tri(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    w = 2 * np.abs(2 * ((f * t) % 1) - 1) - 1
    return w * env(n, 0.002, 0.3, 0.8, dur * 0.9, 0.02)


def noise8(dur, tau):
    n = int(dur * SR); t = np.arange(n) / SR
    step = 6                                   # 8비트 잡음(샘플을 묶어 거칠게)
    nz = np.repeat(rng.uniform(-1, 1, n // step + 1), step)[:n]
    return nz * np.exp(-t / tau)


def riser(dur, f0=300, f1=3000):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n); out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        fc = f0 * (f1 / f0) ** (i / n)
        out[i:i + seg] = bp(nz[i:i + seg], fc * 0.7, fc * 1.4)
    return out * (t / dur) ** 2


def boom(dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 38 + 80 * np.exp(-t / 0.06)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    thud = lp(rng.standard_normal(n), 600) * np.exp(-t / 0.05) * 1.2
    return s * 1.4 + thud


# ───────── 선생님 45초 ─────────
def teacher():
    M = Mix(45)
    bar_t = lambda b: 1 + 2 * b                 # 마디 b 의 시작 시각 (b=0 → 1초)
    prog = ["C", "G", "Am", "F"]
    # 0~1초: 반짝 시작음
    for i, m in enumerate([72, 76, 79, 84]):
        M.add(0.05 + i * 0.12, glock(m, 0.9), 0.35, pan=-0.3 + i * 0.2)
    # 1~3초: 시계 째깍 + 패드 + 끌어올림
    for k in range(4):
        M.add(1 + k * BEAT, tick(k % 2 == 0), 0.5)
    M.add(1, pad(CH["C"], 2.1), 0.35)
    M.add(1.6, riser(1.4), 0.25)
    M.add(2.5, kick(0.3, 0.6), 0.5); M.add(2.75, kick(0.3, 0.6), 0.5)

    melody_a = [[76, None, 74, 76, None, 79, 76, None], [74, None, 71, 74, None, 79, 74, None],
                [72, None, 76, 72, None, 69, 72, 74], [72, None, 69, 72, None, 77, 76, 74]]
    melody_b = [[79, 79, 76, 79, None, 84, 79, 76], [79, None, 74, 79, None, 83, 81, 79],
                [76, 79, 81, 76, None, 72, 76, 79], [77, None, 81, 77, 76, None, 74, 72]]
    for b in range(1, 18):                     # 3~37초: 장면 17개
        t0 = bar_t(b); ch = prog[(b - 1) % 4]; big = b >= 9
        # 드럼
        for k in range(4):
            M.add(t0 + k * BEAT, kick(0.35, 1.0), 0.9)
            if k in (1, 3): M.add(t0 + k * BEAT, clap(), 0.55, pan=0.05)
            M.add(t0 + k * BEAT, hat(), 0.18, pan=0.3)
            M.add(t0 + k * BEAT + 0.25, hat(open_=(k % 2 == 1)), 0.22, pan=0.3)
            if big:
                M.add(t0 + k * BEAT + 0.125, hat(), 0.1, pan=0.35); M.add(t0 + k * BEAT + 0.375, hat(), 0.1, pan=0.35)
        if b in (1, 9): M.add(t0, crash(), 0.5, pan=-0.2)
        if b == 17:                            # 마지막 마디 끝: 스네어 몰아치기 → 도장
            for k in range(8): M.add(t0 + 1.0 + k * 0.125, clap(0.12), 0.25 + k * 0.05)
        # 베이스 8분음표
        r = ROOT[ch]
        for k in range(8):
            M.add(t0 + k * 0.25, bass(r + (12 if k % 4 == 3 else 0), 0.24), 0.55)
        # 전자 피아노: 엇박 찌르기
        for k in range(4):
            for m in CH[ch]:
                M.add(t0 + k * BEAT + 0.25, epiano(m + 12, 0.22), 0.11, pan=-0.25)
        # 멜로디(뜯는 소리)
        mel = (melody_b if big else melody_a)[(b - 1) % 4]
        for k, m in enumerate(mel):
            if m: M.add(t0 + k * 0.25, pluck(m, 0.5), 0.42, pan=0.2)
        if big: M.add(t0, pad(CH[ch], 2.05), 0.12)
    # 37초: 퇴근 도장 쾅
    M.add(37, boom(), 0.9); M.add(37, crash(3.0), 0.6); M.add(37, kick(0.5, 1.3), 0.8)
    outro = ["F", "G", "C", "C"]
    for i, ch in enumerate(outro):              # 37~45초: 마무리
        t0 = 37 + 2 * i
        M.add(t0, pad(CH[ch], 2.2 if i < 3 else 2.6), 0.28)
        if i < 3:
            for k in range(4):
                if k == 0: M.add(t0, kick(0.4, 0.8), 0.6)
                M.add(t0 + k * BEAT + 0.25, hat(), 0.12, pan=0.3)
            for k in range(4):
                M.add(t0 + k * 0.5, bass(ROOT[ch], 0.45), 0.4)
        for k, m in enumerate(sorted(CH[ch])):
            M.add(t0 + 0.08 * k + (0.0 if i < 3 else 0.0), glock(m + 12, 1.4), 0.2, pan=-0.3 + 0.3 * k)
    M.add(41.0, pluck(72, 1.5), 0.4); M.add(41.25, pluck(76, 1.5), 0.4); M.add(41.5, pluck(79, 1.5), 0.4); M.add(41.75, pluck(84, 2.5), 0.5)
    return M.out(fade_out=1.6)


# ───────── 학생 25초 ─────────
def student():
    M = Mix(25)
    bar_t = lambda b: 1 + 2 * b
    prog = ["F", "G", "Em", "Am"]
    # 0~1초: 파워업 소리
    n = int(0.9 * SR); t = np.arange(n) / SR
    f = 200 * (8 ** (t / 0.9)); w = np.where((np.cumsum(f) / SR) % 1 < 0.5, 1.0, -1.0)
    M.add(0, w * (1 - t / 0.9) * 0.6, 0.35)
    # 1~3초: 아르페지오 빨라지기 + 잡음 스네어 몰아치기
    for k in range(16):
        m = [60, 64, 67, 72][k % 4] + (12 if k >= 8 else 0)
        M.add(1 + k * 0.125, square(m, 0.11, 0.125, d=0.05, s=0.3), 0.16, pan=-0.2)
    for k in range(12):
        M.add(2.0 + k / 12, noise8(0.08, 0.03), 0.18 + k * 0.02)   # 2~3초 몰아치기
    lead = [[69, None, 72, None, 77, 76, 72, None], [71, None, 74, None, 79, 77, 74, None],
            [71, 72, 74, None, 76, None, 79, None], [76, None, 74, 72, None, 71, 72, None]]
    for b in range(1, 10):                     # 3~21초: 장면 9개
        t0 = bar_t(b); ch = prog[(b - 1) % 4]
        for k in range(4):
            M.add(t0 + k * BEAT, kick(0.25, 0.9), 0.75)
            if k in (1, 3): M.add(t0 + k * BEAT, noise8(0.16, 0.05), 0.32)
            M.add(t0 + k * BEAT + 0.25, noise8(0.04, 0.008), 0.15, pan=0.3)
        # 16분음표 아르페지오 (8비트)
        tones = sorted(CH[ch]) + [sorted(CH[ch])[0] + 12]
        for k in range(16):
            M.add(t0 + k * 0.125, square(tones[k % 4] + 12, 0.11, 0.125, d=0.06, s=0.25), 0.09, pan=-0.35)
        # 삼각파 베이스
        for k in range(8):
            M.add(t0 + k * 0.25, tri(ROOT[ch] + 12 + (12 if k % 2 else 0), 0.22), 0.4)
        # 주 멜로디 (사각파)
        for k, m in enumerate(lead[(b - 1) % 4]):
            if m: M.add(t0 + k * 0.25, square(m + (12 if b >= 5 else 0), 0.24, 0.25, d=0.15, s=0.5), 0.13, pan=0.25)
        # 장면이 바뀔 때 동전 소리
        M.add(t0, square(83, 0.06, 0.5, d=0.05, s=0.6), 0.12); M.add(t0 + 0.06, square(88, 0.25, 0.5, d=0.12, s=0.3), 0.12)
    # 21초~: 레벨 업 팡파르
    fan = [(21.0, 72, 0.12), (21.125, 76, 0.12), (21.25, 79, 0.12), (21.375, 84, 0.5), (22.0, 82, 0.25), (22.25, 84, 0.25),
           (22.5, 86, 0.25), (22.75, 88, 1.8)]
    M.add(21, kick(0.4, 1.2), 0.8); M.add(21, crash(2.5), 0.4)
    for tt, m, d in fan:
        M.add(tt, square(m, d, 0.25, d=0.2, s=0.6), 0.17, pan=0.1)
        M.add(tt, square(m - 12, d, 0.5, d=0.2, s=0.5), 0.07, pan=-0.1)
    for tt, ch in ((21.0, "F"), (22.0, "G"), (22.75, "C")):
        for m in CH[ch]:
            M.add(tt, tri(m, 2.2 if ch == "C" else 0.95), 0.12)
        M.add(tt, tri(ROOT[ch] + 12, 2.2 if ch == "C" else 0.95), 0.3)
    for k in range(6):
        M.add(22.75 + k * 0.125, noise8(0.05, 0.01), 0.1)
    return M.out(fade_out=1.3)


def save(x, path):
    data = (np.clip(x.T, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "teacher"
    out = sys.argv[2] if len(sys.argv) > 2 else which + ".wav"
    save(teacher() if which == "teacher" else student(), out)
    print("saved", out)
