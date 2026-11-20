/* 쌤 노트 v2.13.0 · 쌤비 이야기 — 학교 소식 · 교육 소식
   - 학교 소식: 쌤 노트 설정 → 쌤비 이야기(또는 찾기 칸 "소식: …")에서 보낸 글을 '쌤비소식' 시트에 모아,
     모든 선생님 쌤비 말풍선에 정한 기간 동안 하루 한 번 먼저 보여 줍니다. 시트에서 직접 고치거나 지워도 됩니다.
   - 교육 소식: 구글 뉴스(검색) RSS에서 교육 기사 제목·링크만 받아 3시간 동안 저장해 둡니다(본문은 가져오지 않음).
     검색어는 스크립트 속성 NEWS_QUERY 로 바꿀 수 있습니다(기본: 교육부 OR 교육청 학교 교사). 끄려면 NEWS_QUERY 를 off.
   - 쓰는 법: 이 파일을 Apps Script에 새 파일(Talk.gs)로 추가하고, Code.gs의 doPost 안 fb: () => fb_(req), 뒤에
       talk: () => talkGet_(req), talkadd: () => talkAdd_(req), talkdel: () => talkDel_(req),
     를 넣은 뒤 [배포 → 배포 관리 → ✏ 수정 → 새 버전 → 배포]. */
var TALK_SHEET = '쌤비소식';
function talkGet_(req) { auth_(req.pw); return { notices: talkList_(), news: talkNews_() }; }

function talkYmd_(d) { return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd'); }
function talkSheet_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(TALK_SHEET);
  if (!sh) {
    sh = ss.insertSheet(TALK_SHEET);
    sh.getRange(1, 1, 1, 6).setValues([['번호', '소식(80자)', '시작', '끝', '보낸 이', '올린 때']]).setFontWeight('bold');
    sh.setFrozenRows(1); sh.setColumnWidth(2, 420);
  }
  return sh;
}
function talkCell_(v) { return v instanceof Date ? talkYmd_(v) : String(v == null ? '' : v).trim(); }
function talkList_() {
  var sh = talkSheet_(), n = sh.getLastRow(); if (n < 2) return [];
  var t = talkYmd_(new Date());
  return sh.getRange(2, 1, n - 1, 5).getValues().map(function (r) {
    return { id: talkCell_(r[0]), text: talkCell_(r[1]).slice(0, 80), from: talkCell_(r[2]), to: talkCell_(r[3]), by: talkCell_(r[4]).slice(0, 10) };
  }).filter(function (x) { return x.id && x.text && (!x.to || x.to >= t); }).slice(-30);
}
function talkAdd_(req) {
  auth_(req.pw);
  var text = String(req.text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (text.length < 2) throw new Error('내용이 없어요');
  var re = /^\d{4}-\d{2}-\d{2}$/, t = talkYmd_(new Date());
  var from = re.test(req.from) ? req.from : t, to = re.test(req.to) ? req.to : from;
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = talkSheet_(), id = 'n' + new Date().getTime().toString(36);
    sh.appendRow([id, text, from, to, String(req.by || '').trim().slice(0, 10), new Date()]);
    sh.getRange(sh.getLastRow(), 3, 1, 2).setNumberFormat('@').setValues([[from, to]]);
    return { id: id };
  } finally { lock.releaseLock(); }
}
function talkDel_(req) {
  auth_(req.pw);
  var id = String(req.id || ''); if (!id) throw new Error('번호가 없어요');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = talkSheet_(), n = sh.getLastRow(); if (n < 2) return {};
    var ids = sh.getRange(2, 1, n - 1, 1).getValues();
    for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) sh.deleteRow(i + 2);
    return {};
  } finally { lock.releaseLock(); }
}
/* 교육 소식: 제목 · 언론사 · 링크 · 날짜만 (3시간 저장) */
function talkNews_() {
  var q = PropertiesService.getScriptProperties().getProperty('NEWS_QUERY') || '교육부 OR 교육청 학교 교사';
  if (q === 'off') return [];
  var cache = CacheService.getScriptCache(), key = 'talk_news_' + Utilities.base64EncodeWebSafe(q).slice(0, 40), c = cache.get(key);
  if (c) return JSON.parse(c);
  var out = [];
  try {
    var url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q + ' when:3d') + '&hl=ko&gl=KR&ceid=KR:ko';
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (res.getResponseCode() === 200) {
      var items = XmlService.parse(res.getContentText()).getRootElement().getChild('channel').getChildren('item');
      items.slice(0, 12).forEach(function (it) {
        var title = it.getChildText('title') || '', src = it.getChildText('source') || '';
        if (src && title.slice(-(src.length + 3)) === ' - ' + src) title = title.slice(0, -(src.length + 3));
        var pd = it.getChildText('pubDate'); var d = pd ? new Date(pd) : null;
        out.push({ t: title.slice(0, 90), src: src.slice(0, 20), link: it.getChildText('link') || '', date: d && !isNaN(d) ? talkYmd_(d) : '' });
      });
    }
  } catch (err) { out = []; }
  cache.put(key, JSON.stringify(out), out.length ? 3 * 3600 : 1800);
  return out;
}
/* 편집기에서 한 번 실행해 보세요: 시트를 만들고 교육 소식을 받아 와 로그에 보여 줍니다(외부 접속 권한 승인). */
function 쌤비이야기_시험() {
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/script.external_request']);   // 외부 접속(교육 소식) 권한을 한 번 묻기
  talkSheet_();
  Logger.log(JSON.stringify(talkNews_().slice(0, 3)));
}
