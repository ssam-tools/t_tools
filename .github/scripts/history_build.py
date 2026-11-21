"""쌤 노트 제작 히스토리 자동 기록 (GitHub Actions에서 올릴 때마다 실행)

1) history/versions.json — git 기록에서 버전별 바뀐 내용을 모음 (모든 버전 탭)
2) version.json 에 "big" 이 있으면 → 그 버전 화면을 찍어 history/shots/ 에 저장하고
   history/auto.json 에 큰 변화로 더함 (이미 있으면 건너뜀)

version.json 예)
  {"v": "2.40.0", "note": "한 줄 요약",
   "big": {"title": "제목", "pts": ["바뀐 점 1", "바뀐 점 2"], "page": "index.html?ui=ssambi", "phone": false}}
  "big": true 만 적어도 됩니다 (제목 = note, 그림 = 첫 화면).
"""
import json, re, subprocess, sys, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
H = ROOT / "history"
SHOTS = H / "shots"
VER_RE = re.compile(r'VERSION = "([0-9.]+)"')


def git(*a):
    return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True).stdout


def build_versions():
    out, last = [], None
    for line in git("log", "--reverse", "--format=%H\x1f%aI\x1f%s").splitlines():
        h, date, msg = line.split("\x1f")
        m = VER_RE.search(git("show", f"{h}:shared/tt.js"))
        v = m.group(1) if m else "0.1"
        if msg.startswith("Add files via upload"):
            msg = "GitHub 웹에서 직접 올림"
        elif msg.startswith(("Create index", "Delete index")):
            msg = "첫 화면 만듦"
        elif msg.startswith("Restore home page"):
            msg = "잘못 올린 파일 정리, 첫 화면 되살림"
        elif msg == "제작 히스토리 자동 기록":
            continue
        if last and last["v"] == v:
            if msg not in last["msgs"]:
                last["msgs"].append(msg)
            last["end"] = date[:16]
        else:
            last = {"v": v, "date": date[:16], "end": date[:16], "msgs": [msg]}
            out.append(last)
    out.reverse()
    (H / "versions.json").write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding="utf-8")
    print("versions.json:", len(out), "versions")


def shoot(page, out, phone):
    from playwright.sync_api import sync_playwright
    path, _, qs = page.partition("?")
    url = (ROOT / path).resolve().as_uri() + ("?" + qs if qs else "")
    w, h = (390, 844) if phone else (1440, 900)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--allow-file-access-from-files"])
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.add_init_script("try{localStorage.setItem('ttv_kind','personal')}catch(e){}")
        pg.goto(url, wait_until="load", timeout=30000)
        pg.wait_for_timeout(3000)
        tmp = out.with_suffix(".png")
        pg.screenshot(path=str(tmp))
        b.close()
    from PIL import Image
    im = Image.open(tmp).convert("RGB")
    if im.width > 1280:
        im = im.resize((1280, round(im.height * 1280 / im.width)))
    im.save(out, quality=80, optimize=True)
    tmp.unlink()


def add_big():
    vj = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))
    big = vj.get("big")
    if not big:
        return
    if big is True:
        big = {}
    auto_f = H / "auto.json"
    auto = json.loads(auto_f.read_text(encoding="utf-8")) if auto_f.exists() else []
    if any(a["v"] == vj["v"] for a in auto):
        print("auto.json: 이미 있음", vj["v"])
        return
    SHOTS.mkdir(exist_ok=True)
    name = "v" + vj["v"].replace(".", "_") + ".jpg"
    shot = None
    try:
        shoot(big.get("page", "index.html?ui=ssambi"), SHOTS / name, bool(big.get("phone")))
        shot = name
    except Exception as e:
        print("화면 찍기 실패:", e)
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    auto.append({"id": "a" + vj["v"], "v": vj["v"], "date": now.strftime("%Y-%m-%d"), "emoji": big.get("emoji", "✨"),
                 "title": big.get("title") or vj.get("note", ""), "sum": big.get("sum", vj.get("note", "")),
                 "pts": big.get("pts", []), "shot": shot, "phone": bool(big.get("phone")), "auto": True})
    auto_f.write_text(json.dumps(auto, ensure_ascii=False, indent=1), encoding="utf-8")
    print("auto.json: 큰 변화 기록", vj["v"])


if __name__ == "__main__":
    build_versions()
    if "--no-shot" not in sys.argv:
        add_big()
