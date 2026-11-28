#!/usr/bin/env python3
"""쌤 노트 소개 영상 만들기 (PLAN_배포 5단계)

  python3 make.py teacher          → ../media/teacher.mp4 (45초, 1080×1920, 30fps)
  python3 make.py student          → ../media/student.mp4 (25초)
  python3 make.py teacher 3.5 12   → 그 순간 화면만 그림으로 (/tmp/film_teacher_3.5.png …) — 확인용

필요한 것: python playwright · 크롬(또는 크로미움) · ffmpeg · numpy · scipy
순서: music.py 로 음악(wav) 작곡 → film.html 을 1/30초씩 찍어 ffmpeg 에 바로 넘김 → 음악과 합쳐 MP4.
"""
import os, sys, subprocess, tempfile, pathlib, shutil
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
FPS = 30
LEN = {"teacher": 45, "student": 25}


def browser(p):
    for exe in (os.environ.get("CHROME"), "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"):
        if exe and os.path.exists(exe):
            return p.chromium.launch(executable_path=exe, args=["--allow-file-access-from-files", "--force-color-profile=srgb"])
    return p.chromium.launch(args=["--allow-file-access-from-files"])


def open_page(p, v):
    b = browser(p)
    pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    pg.goto((HERE / "film.html").as_uri() + "?v=" + v + "&still=1")
    pg.wait_for_function("window.TT_FILM")
    pg.evaluate("TT_FILM.ready")
    return b, pg


def stills(v, ts):
    with sync_playwright() as p:
        b, pg = open_page(p, v)
        for t in ts:
            pg.evaluate("t => TT_FILM.set(t)", float(t))
            out = "/tmp/film_%s_%s.png" % (v, t)
            pg.screenshot(path=out)
            print(out)
        b.close()


def film(v):
    tmp = pathlib.Path(tempfile.mkdtemp())
    wav = tmp / "music.wav"
    subprocess.run([sys.executable, str(HERE / "music.py"), v, str(wav)], check=True)
    out = HERE.parent / "media" / (v + ".mp4")
    out.parent.mkdir(exist_ok=True)
    ff = subprocess.Popen(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                           "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-", "-i", str(wav),
                           "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", str(FPS),
                           "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11",
                           "-movflags", "+faststart", "-shortest", str(out)], stdin=subprocess.PIPE)
    n = LEN[v] * FPS
    with sync_playwright() as p:
        b, pg = open_page(p, v)
        for i in range(n):
            pg.evaluate("t => TT_FILM.set(t)", i / FPS)
            ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
            if i % 150 == 0:
                print("  %s %d/%d" % (v, i, n), flush=True)
        b.close()
    ff.stdin.close(); ff.wait()
    shutil.rmtree(tmp, ignore_errors=True)
    print("saved", out, round(out.stat().st_size / 1e6, 1), "MB")


if __name__ == "__main__":
    v = sys.argv[1] if len(sys.argv) > 1 else "teacher"
    if len(sys.argv) > 2:
        stills(v, sys.argv[2:])
    else:
        film(v)
