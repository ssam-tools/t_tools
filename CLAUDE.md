# 쌤 노트 작업 약속 (Claude가 매번 읽는 파일)

## 버전 올리기
- `shared/tt.js` 의 `VERSION`, `version.json`, `sw.js` 의 `CACHE` 숫자를 함께 올립니다.
- 커밋 메시지 끝에 `(vX.Y.Z)` 를 적습니다 — 제작 히스토리 '모든 버전' 탭이 이 기록으로 만들어집니다.

## 🕰️ 제작 히스토리 (history/)
맨 아래 제작자 표기를 누르면 열리는 화면입니다. 제작자(jidangmath)가 "어떻게 만들어 왔는지" 나중에 볼 수 있게 남깁니다.

**큰 변화라고 보는 것** (하나라도 맞으면):
1. 새 메뉴·새 학생 프로그램·새 교과 팩이 생김
2. 첫 화면이나 화면 구조가 눈에 띄게 바뀜
3. PLAN_*.md 하나를 끝까지 마침
4. 앞자리(major) 또는 가운데 자리(minor) 버전을 올리면서 사용자가 새 기능이라고 느낄 변화

**큰 변화일 때 할 일** — `version.json` 에 `big` 을 적어 올리기만 하면 됩니다:
```json
{"v": "2.40.0", "note": "한 줄 요약",
 "big": {"emoji": "🧪", "title": "짧은 제목", "sum": "한 문장 설명",
         "pts": ["바뀐 점 1", "바뀐 점 2", "바뀐 점 3"],
         "page": "index.html?ui=ssambi", "phone": false}}
```
- 올리면 GitHub Actions(`.github/workflows/history.yml`)가 그 화면(`page`)을 찍어 `history/shots/` 에 넣고 `history/auto.json` 에 기록합니다.
- 학생용 화면이면 `"page": "apps/gym/index.html", "phone": true`.
- 다음 버전을 올릴 때는 `big` 을 지워도 됩니다(이미 기록된 버전은 다시 기록하지 않음).
- `history/` 폴더는 Actions가 관리하므로 직접 고치지 않습니다. 예외: 지난 기록을 다듬을 때는 `history/data.js` 를 고칩니다.
- 그림에는 개인정보가 없어야 합니다(자료 없이 처음 연 화면만 찍음).

## 개인정보
- 학생·교사 실제 정보, 백업 파일(*.json 백업)은 저장소에 올리지 않습니다.
