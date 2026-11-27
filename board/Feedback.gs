/* 쌤 노트 v2.54 · 💬 의견함 — 선생님 의견(업무판 '의견' 시트)과 학생 의견(공부 Gym 건의함 시트)을 🛡️ 관리 한 곳에서
   - fb2(선생님, 공용 비밀번호): 예전 fb와 같이 '의견' 시트에 쌓되, 글마다 id를 함께 적음 → 답변을 그 선생님 기기로 돌려줄 수 있게
   - fbmine(선생님, 공용 비밀번호): 내가 보낸 의견 id들 → 답변·처리 상태만 돌려줌 (다른 사람 글은 보이지 않음)
   - fblist·fbset(관리자 표): 두 시트의 글을 읽고, 답변·처리·공개(O, 학생 글만)를 고침 → 변경 기록에 요약만 남김
   - 공부 Gym 건의함 시트 주소는 스크립트 속성 GYM_SHEET(없으면 아래 기본값). 학생 글에는 원래 별명만 있고 이름·연락처는 없음.
   - 쓰는 법: Apps Script에 새 파일 Feedback 을 만들어 붙여 넣고, Code.gs의 doPost 표에
       fb2: () => fbSend_(req), fbmine: () => fbMine_(req), fblist: () => fbList_(req), fbset: () => fbSet_(req),
     를 넣은 뒤 [배포 → 배포 관리 → ✏ 수정 → 새 버전 → 배포]. (Admin.gs가 꼭 함께 있어야 함) */
const FB_GYM_DEF = '1rh5t9gcrT99ZSTRJP3XVLWhOnCFbalDXyqmBtrwBz5k';
function fbTeach_() {
  const sh = vSheet_('의견', ['시각', '버전', '화면', '이름', '내용', '처리']);
  if (String(sh.getRange(1, 7).getValue()) !== '답변') sh.getRange(1, 7, 1, 2).setValues([['답변', 'id']]).setFontWeight('bold');
  return sh;
}
function fbGym_() {
  const id = String(PROPS_.getProperty('GYM_SHEET') || FB_GYM_DEF);
  const sh = SpreadsheetApp.openById(id).getSheetByName('건의함');
  if (!sh) throw new Error('공부 Gym 건의함 시트를 찾지 못했어요');
  return sh;
}
function fbId_(v) { v = String(v || ''); return /^[a-z0-9]{6,24}$/.test(v) ? v : ''; }
function fbSend_(req) {
  auth_(req.pw);
  const t = String(req.text || '').trim(); if (t.length < 2) throw new Error('내용이 비었습니다');
  const cache = CacheService.getScriptCache(), n = Number(cache.get('fb_n') || 0);
  if (n >= 60) throw new Error('잠시 뒤에 다시 보내 주세요');
  cache.put('fb_n', String(n + 1), 600);
  const sh = fbTeach_();
  sh.appendRow([Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'), txt_(req.ver, 12), txt_(req.page, 30), txt_(req.name, 20), txt_(t, 1000), '', '', fbId_(req.id)]);
  return {};
}
function fbMine_(req) {
  auth_(req.pw);
  const ids = (Array.isArray(req.ids) ? req.ids : []).map(fbId_).filter(String).slice(0, 40), want = {};
  ids.forEach(function (i) { want[i] = 1; });
  const sh = fbTeach_(), last = sh.getLastRow(), out = [];
  if (last >= 2 && ids.length) sh.getRange(2, 1, last - 1, 8).getDisplayValues().forEach(function (r) {
    if (want[r[7]] && (r[6] || r[5])) out.push({ id: r[7], reply: r[6], st: r[5] });
  });
  return { items: out };
}
function fbRows_(sh, cols, max) {
  const last = sh.getLastRow(); if (last < 2) return [];
  const from = Math.max(2, last - max + 1);
  return sh.getRange(from, 1, last - from + 1, cols).getDisplayValues().map(function (r, k) { return { row: from + k, r: r }; });
}
function fbList_(req) {
  const who = admNeed_(req);
  const teach = fbRows_(fbTeach_(), 8, 300).map(function (x) { const r = x.r; return { row: x.row, at: r[0], ver: r[1], page: r[2], name: r[3], text: r[4], st: r[5], reply: r[6], mine: !!r[7] }; }).filter(function (x) { return x.text; });
  let gym = [], gymErr = '';
  try {
    gym = fbRows_(fbGym_(), 13, 400).map(function (x) { const r = x.r; return { row: x.row, at: r[0], type: r[1], nick: r[2], stars: r[3], text: r[4], wish: r[5], qid: r[6], q: r[7], wk: r[8], pub: String(r[10]).trim().toUpperCase() === 'O', reply: r[11], st: r[12] }; }).filter(function (x) { return x.text; });
  } catch (e) { gymErr = String(e.message || e); }
  return Object.assign(admIssue_(who), { teach: teach.reverse(), gym: gym.reverse(), gymErr: gymErr });
}
/* 고치기: src 'teach'|'gym', row(시트 줄), chk(내용 앞 20자 — 줄이 바뀌었으면 멈춤), reply·st·pub(학생 글만) 중 보낸 것만 */
function fbSet_(req) {
  const who = admNeed_(req), gym = req.src === 'gym', sh = gym ? fbGym_() : fbTeach_(), row = Number(req.row || 0);
  if (row < 2 || row > sh.getLastRow()) throw new Error('그 글을 찾지 못했어요');
  const text = String(sh.getRange(row, 5).getDisplayValue());
  if (text.slice(0, 20) !== String(req.chk || '').slice(0, 20)) throw new Error('CONFLICT');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const C = gym ? { pub: 11, reply: 12, st: 13 } : { reply: 7, st: 6 }, done = [];
    if (req.reply != null) { sh.getRange(row, C.reply).setValue(txt_(req.reply, 1000)); done.push('답변'); }
    if (req.st != null) { sh.getRange(row, C.st).setValue(txt_(req.st, 20)); done.push('처리 ' + txt_(req.st, 20)); }
    if (gym && req.pub != null) { sh.getRange(row, C.pub).setValue(req.pub ? 'O' : ''); done.push(req.pub ? '공개' : '비공개'); }
    admLog_(who, '의견함: ' + (gym ? '학생' : '선생님') + ' 글 ' + row + '줄 · ' + done.join(' · '));
  } finally { lock.releaseLock(); }
  return admIssue_(who);
}
/* 편집기에서 한 번 실행: 두 시트를 읽을 수 있는지 확인 (처음 한 번은 다른 시트 열기 권한을 물을 수 있음) */
function 의견함_시험() {
  Logger.log('선생님 의견: ' + Math.max(0, fbTeach_().getLastRow() - 1) + '줄');
  Logger.log('학생 의견(공부 Gym 건의함): ' + Math.max(0, fbGym_().getLastRow() - 1) + '줄');
}
