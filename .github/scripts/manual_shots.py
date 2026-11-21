"""쌤 노트 매뉴얼·PPT용 화면 찍기 (수동 실행: Actions → 매뉴얼 화면 찍기)
모든 자료는 지어낸 견본(가짜 학교·가짜 이름)입니다. 실제 학생·교사 정보는 쓰지 않습니다.
결과는 저장소에 올리지 않고 Actions 결과물(artifact)로만 남깁니다.
덤: 제작 히스토리 v2.40.0 그림(폴더 목록이 찍혔던 것)을 학기초 세팅 화면으로 다시 찍습니다."""
import json, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "manual_shots"
OUT.mkdir(exist_ok=True)

P = [{"n": i + 1, "t": t} for i, t in enumerate(["08:50", "09:45", "10:40", "11:35", "13:30", "14:25", "15:20"])]
NAMES = ["김하늘", "이바다", "박나무", "최구름", "정햇살", "강별빛", "조은솔", "윤가람", "장마루", "임다온", "한누리", "오새봄"]
def cls(g, c, k): return {"id": f"g{g}c{c}", "name": f"{g}학년 {c}반", "grade": g, "cls": c, "students": [{"no": i + 1, "name": NAMES[(i + k) % 12] if i < 12 else f"학생{i+1}"} for i in range(12)]}
SLOTS = {}
for d, p, c in [(1, 1, 301), (1, 3, 302), (2, 2, 303), (2, 5, 301), (3, 1, 302), (3, 4, 303), (4, 2, 301), (4, 6, 302), (5, 3, 303), (5, 5, 301)]:
    SLOTS[f"{d}-{p}"] = {"code": str(c), "cls": c, "subj": "수학"}
SEED = {
    "ttv_kind": "personal",
    "tt_school_v1": {"name": "쌤노트중학교", "teacher": "김쌤", "subject": "수학", "principal": "홍교장"},
    "tt_roster_v1": {"v": 1, "classes": [cls(3, 1, 0), cls(3, 2, 3), cls(3, 3, 6)], "home": "g3c1", "current": "g3c1"},
    "tt_timetable_v1": {"v": 1, "periods": P, "slots": SLOTS, "weeks": {}, "from": "setup", "updatedAt": 1},
    "tt_staff_v1": {"v": 1, "list": [{"name": "김쌤", "dept": "학년부", "pos": "3-1 담임", "subj": "수학", "tel": "301"}, {"name": "이국어", "dept": "교무운영부", "pos": "3-2 담임", "subj": "국어", "tel": "302"}, {"name": "박영어", "dept": "연구장학부", "pos": "", "subj": "영어", "tel": "303"}], "main": []},
    "tt_calendar_v1": {"v": 1, "y": 2026, "events": [{"d": "2026-12-10", "t": "2학기 기말고사", "k": "exam"}, {"d": "2026-12-25", "t": "성탄절", "k": "off"}, {"d": "2027-01-06", "t": "겨울방학식", "k": "evt"}]},
    "tt_mytodo_v1": {"items": [{"id": "a", "text": "학부모 상담 주간 안내문", "date": "2026-11-27", "done": False}, {"id": "b", "text": "수행평가 점수 입력", "date": "2026-11-28", "done": False}]},
}
INIT = "try{if(!localStorage.getItem('ttdemo')){" + "".join(
    f"localStorage.setItem({json.dumps(k)},{json.dumps(v if isinstance(v, str) else json.dumps(v, ensure_ascii=False), ensure_ascii=False)});" for k, v in SEED.items()
) + "localStorage.setItem('ttdemo','1');}}catch(e){}"

SHOTS = [
    ("01_home", "index.html", False, None),
    ("02_menu_teach", "index.html", False, "수업"),
    ("03_menu_room", "index.html", False, "우리 반"),
    ("04_menu_school", "index.html", False, "학교"),
    ("05_menu_settings", "index.html", False, "설정"),
    ("10_setup_get", "apps/setup/index.html", False, None),
    ("11_setup_make", "apps/setup/index.html?make", False, None),
    ("12_setup_map", "apps/setup/index.html?map", False, None),
    ("20_timetable", "apps/timetable/index.html", False, None),
    ("21_tardy", "apps/tardy/index.html", False, None),
    ("22_stucard", "apps/stucard/index.html", False, None),
    ("23_journal", "apps/journal/index.html", False, None),
    ("24_book", "apps/book/index.html", False, None),
    ("25_voice", "apps/voice/index.html", False, None),
    ("26_lib", "apps/lib/index.html", False, None),
    ("30_phone_home", "index.html", True, None),
    ("31_phone_tardy", "apps/tardy/index.html", True, None),
]

def save(png, out):
    im = Image.open(png).convert("RGB")
    if im.width > 1440: im = im.resize((1440, round(im.height * 1440 / im.width)))
    im.save(out, quality=85, optimize=True); pathlib.Path(png).unlink()

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--allow-file-access-from-files"])
    for name, page, phone, click in SHOTS:
        try:
            w, h = (390, 844) if phone else (1440, 900)
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if phone else 1, locale="ko-KR", timezone_id="Asia/Seoul")
            ctx.add_init_script(INIT)
            pg = ctx.new_page()
            path, _, qs = page.partition("?")
            pg.goto((ROOT / path).resolve().as_uri() + ("?" + qs if qs else ""), wait_until="load", timeout=30000)
            pg.wait_for_timeout(3500)
            if click:
                pg.get_by_text(click, exact=True).first.click()
                pg.wait_for_timeout(2000)
            pg.keyboard.press("Escape")
            pg.wait_for_timeout(300)
            pg.screenshot(path=str(OUT / (name + ".png")))
            save(OUT / (name + ".png"), OUT / (name + ".jpg"))
            print("찍음", name)
            ctx.close()
        except Exception as e:
            print("실패", name, e)
    # 제작 히스토리 v2.40.0 그림 다시 (자료 없이 처음 연 학기초 세팅 화면)
    try:
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        ctx.add_init_script("try{localStorage.setItem('ttv_kind','personal')}catch(e){}")
        pg = ctx.new_page(); pg.goto((ROOT / "apps/setup/index.html").resolve().as_uri(), wait_until="load"); pg.wait_for_timeout(3000)
        tmp = ROOT / "history/shots/v2_40_0.png"; pg.screenshot(path=str(tmp))
        im = Image.open(tmp).convert("RGB").resize((1280, 800)); im.save(ROOT / "history/shots/v2_40_0.jpg", quality=80, optimize=True); tmp.unlink()
        print("히스토리 v2.40.0 다시 찍음")
    except Exception as e:
        print("히스토리 다시 찍기 실패", e)
    b.close()
