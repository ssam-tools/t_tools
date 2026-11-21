# 공부 Gym 건의·후기 받는 곳 만들기 (선생님 1명 · 5분 · 한 번만)

학생이 공부 Gym에서 보낸 **💡 건의 · 🐞 불편·오류 · ⭐ 사용 후기 · 🚩 문제 신고**가 선생님의 구글 시트 한 곳에 모입니다.
선생님이 시트에서 **공개(O)** 를 적은 글만 학생들의 '👀 친구들 후기'에 보이고, **답변** 칸에 적은 글은 그 학생 화면에 '📬 내 글에 온 답변'으로 돌아갑니다.

- 받는 것: 별명(또는 '익명'), 글, 별점, 문제 번호·문제 글, 몇 주차인지. **이름·학번·연락처는 받지 않습니다.**
- 학생 화면은 전화번호·'○학년 ○반'·이메일 같은 글을 보내기 전에 막습니다. 한 학생이 하루 5번까지 보낼 수 있습니다.
- 연결하기 전에는 학생 화면에 '복사해서 선생님께 보여 주세요'가 나옵니다(그대로 써도 됩니다).

## 1. 시트와 스크립트 만들기
1. 구글 드라이브 → **새로 만들기 → 구글 스프레드시트** → 이름: `공부 Gym 건의함`
2. 시트 메뉴 **확장 프로그램 → Apps Script**
3. 편집기에 있던 글을 모두 지우고, 아래 **코드 전체**를 붙여 넣고 💾 저장

## 2. 웹 앱으로 배포
1. 오른쪽 위 **배포 → 새 배포** → 유형 ⚙ **웹 앱**
2. 다음 사용자 인증 정보로 실행: **나** · 액세스 권한이 있는 사용자: **모든 사용자** → [배포] → 권한 허용
3. 나온 **웹 앱 URL**(…/exec)을 복사합니다.
4. 코드를 고친 뒤에는 **배포 → 배포 관리 → ✏ 수정 → 버전: 새 버전 → 배포** (주소가 그대로 유지됨)

## 3. 공부 Gym에 연결
- 저장소의 `apps/gym/feedback.js` 의 `url: ""` 따옴표 안에 복사한 주소를 넣습니다.
- 또는 Claude에게 "공부 Gym 건의함 주소는 ○○○야, 연결해 줘"라고 말하면 넣어서 올려 줍니다.

## 4. 쓰는 법 (시트)
| 칸 | 누가 | 뜻 |
|---|---|---|
| 받은 때 · 종류 · 별명 · 별점 · 내용 · 공개 희망 · 문제 번호 · 문제 · 주차 · id | 자동 | 학생이 보낸 것 |
| **공개(O)** | 선생님 | `O`를 적으면 학생 화면 '친구들 이야기'에 보임 (공개 희망인 후기·건의만 권장) |
| **답변** | 선생님 | 적으면 보낸 학생에게 '📬 내 글에 온 답변'으로 보임. 공개(O)인 글은 모두에게 보임 |
| 처리 | 선생님 | 메모용(반영함·검토 중 등) — 학생에게 안 보임 |

- 🚩 **문제 신고**는 `문제 번호`(예: `sci:o:131`)로 어떤 문제인지 알 수 있어요. Claude에게 "공부 Gym 문제 신고 ○○ 고쳐 줘"라고 하면 됩니다.
- 공개하는 글은 다시 한번 읽고, 친구를 놀리거나 개인정보가 섞인 글은 공개하지 마세요.

## 코드 (전체 복사)
```javascript
/* 공부 Gym 건의·후기 받는 곳 (v2.25.0) — jidangmath가 Claude와 함께 제작
   학생 앱이 보낸 글을 '건의함' 시트에 쌓고, 공개(O)한 글과 그 학생 글의 답변만 돌려줍니다. */
var SHEET = '건의함';
var HEAD = ['받은 때', '종류', '별명', '별점', '내용', '공개 희망', '문제 번호', '문제', '주차', 'id', '공개(O)', '답변', '처리'];
function sh_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s = ss.getSheetByName(SHEET);
  if(!s){ s = ss.insertSheet(SHEET); s.appendRow(HEAD); s.setFrozenRows(1); s.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#FFE7A3'); s.setColumnWidth(5, 360); }
  return s;
}
function clip_(v, n){ v = String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n); return /^[=+\-@]/.test(v) ? "'" + v : v; }   // 수식 넣기 막기
function doPost(e){
  var d = {}; try{ d = JSON.parse(e.postData.contents || '{}'); }catch(er){ return ContentService.createTextOutput('bad'); }
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try{
    sh_().appendRow([new Date(), clip_(d.type, 10), clip_(d.nick, 12) || '익명', Number(d.stars) || '', clip_(d.text, 600), clip_(d.pub, 4),
      clip_(d.qid, 60), clip_(d.q, 220), Number(d.wk) || '', clip_(d.id, 16), '', '', '']);
  } finally { lock.releaseLock(); }
  return ContentService.createTextOutput('ok');
}
function doGet(e){
  var p = (e && e.parameter) || {}, rows = sh_().getDataRange().getValues().slice(1);
  var mine = String(p.mine || '').split(',').filter(String).slice(0, 20), out = {ok: 1, items: [], mine: []};
  rows.forEach(function(r){
    if(String(r[10]).trim().toUpperCase() === 'O') out.items.push({date: Utilities.formatDate(new Date(r[0]), 'Asia/Seoul', 'M/d'), type: r[1], nick: r[2], stars: r[3], text: r[4], reply: r[11]});
    if(mine.indexOf(String(r[9])) >= 0 && r[11]) out.mine.push({id: String(r[9]), reply: r[11]});
  });
  out.items = out.items.slice(-30).reverse();
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
```
