/* 쌤 노트 v2.40 · 학교 세팅 공유 (PLAN_세팅공유)
   학기초 세팅을 USB 없이: 초대 링크 → 공용 비밀번호 → 내 이름 고르기.
   - 서버(이 드라이브)에는 '잠긴 글자'만 둡니다. 잠그기·풀기는 선생님 기기 안에서 합니다.
       A 묶음(학교 정보·교직원·학사일정·전체 시간표·추천 세트): 공용 비밀번호로 잠금
       B 묶음(학생 명렬): 담당자가 따로 알려 주는 '학생 명렬 비밀 문구'로 잠금 → 업무판 담당자도 열 수 없음
   - 받기(setver·setget·setcal): 공용 비밀번호 · 올리기(setput·setadmin): 관리자(Admin.gs의 표 또는 LIB_ADMIN) · 모두 지우기(setwipe): 최고 관리자
   - v2.52: Admin.gs가 꼭 함께 있어야 합니다(admNeed_·admLog_).
   - 판 번호·요약은 스크립트 속성 SET_META 하나에(가볍게), 묶음은 드라이브 폴더 '쌤노트_학교세팅'에. 새 판을 올리면 예전 판 파일은 지움.
   - 쓰는 법: Apps Script에 새 파일 SchoolSet 을 만들어 붙여 넣고, Code.gs의 doPost 표에
       setver: () => setVer_(req), setget: () => setGet_(req), setput: () => setPut_(req), setwipe: () => setWipe_(req), setadmin: () => setAdmin_(req), setcal: () => setCal_(req),
     를 넣은 뒤 [배포 → 배포 관리 → ✏ 수정 → 새 버전 → 배포]. */
const SET_FOLDER = '쌤노트_학교세팅', SET_META = 'SET_META', SET_MAX = 8 * 1024 * 1024;
function setFolder_() { const it = DriveApp.getFoldersByName(SET_FOLDER); return it.hasNext() ? it.next() : DriveApp.createFolder(SET_FOLDER); }
function setMeta_() { try { return JSON.parse(PROPS_.getProperty(SET_META) || 'null'); } catch (e) { return null; } }
function setAdminOk_(req) { return admNeed_(req); }   // v2.52: 관리자 표(tok) 또는 예전 관리자 비밀번호(LIB_ADMIN) — board/Admin.gs
/* 가벼운 확인: 판 번호·요약만 (드라이브를 읽지 않음) */
function setVer_(req) {
  auth_(req.pw);
  const m = setMeta_();
  return m ? { ver: m.ver, at: m.at, sum: m.sum || '', hasB: !!m.b, sizeA: m.sizeA || 0, sizeB: m.sizeB || 0, books: !!m.books } : { ver: 0 };
}
/* 묶음 받기: part = 'a' | 'b' — 잠긴 글자 그대로 */
function setGet_(req) {
  auth_(req.pw);
  const m = setMeta_(); if (!m) return { ver: 0 };
  const id = req.part === 'b' ? m.b : m.a;
  if (!id) return { ver: m.ver, data: '' };
  return { ver: m.ver, data: DriveApp.getFileById(id).getBlob().getDataAsString() };
}
/* 관리자 비밀번호 확인만 */
function setAdmin_(req) { setAdminOk_(req); const m = setMeta_(); return { ver: m ? m.ver : 0 }; }
/* 올리기: a(잠긴 글자, 꼭), b(잠긴 글자, 없으면 '' · keepB면 예전 것 그대로), sum(바뀐 점 요약) */
function setPut_(req) {
  const who = setAdminOk_(req);
  const a = String(req.a || ''), b = String(req.b || '');
  if (!/^\{"salt"/.test(a)) throw new Error('잠긴 묶음이 아니에요');
  if (b && !/^\{"salt"/.test(b)) throw new Error('잠긴 묶음이 아니에요');
  if (a.length + b.length > SET_MAX) throw new Error('세팅이 너무 커요 (8MB까지)');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const old = setMeta_() || {};
    if (req.base != null && Number(req.base) !== Number(old.ver || 0)) throw new Error('CONFLICT');   // v2.52 다른 관리자가 먼저 올림
    const f = setFolder_(), ver = Math.max(Date.now(), (old.ver || 0) + 1);
    const fa = f.createFile('A_' + ver + '.txt', a, MimeType.PLAIN_TEXT);
    let fb = null;
    if (b) fb = f.createFile('B_' + ver + '.txt', b, MimeType.PLAIN_TEXT);
    const keepB = !b && req.keepB && old.b;
    const m = { ver: ver, at: new Date().toISOString(), sum: txt_(req.sum, 300), a: fa.getId(), b: fb ? fb.getId() : (keepB ? old.b : ''),
                sizeA: a.length, sizeB: b ? b.length : (keepB ? old.sizeB || 0 : 0), books: req.books == null ? !!old.books : !!req.books, by: who.n };
    PROPS_.setProperty(SET_META, JSON.stringify(m));
    [old.a, keepB ? '' : old.b].forEach(function (id) { if (id) { try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {} } });   // 예전 판은 지움
    admLog_(who, '학교 세팅: ' + (m.sum || '올림'));
    return Object.assign(req.tok ? admIssue_(who) : {}, { ver: ver });
  } finally { lock.releaseLock(); }
}
/* 새 학년·비밀번호를 바꿀 때: 서버의 학교 세팅을 모두 지움 */
function setWipe_(req) {
  const who = admNeed_(req, true); admLog_(who, '학교 세팅 모두 지움');
  const m = setMeta_() || {};
  [m.a, m.b].forEach(function (id) { if (id) { try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {} } });
  PROPS_.deleteProperty(SET_META);
  return { ver: 0 };
}
/* 나이스 학사일정: 인증키 없이도 5줄씩 나눠 받아 한 번에 돌려줌 (12시간 기억). 학교 코드·학년도만 받음(학생 자료 아님) */
function setCal_(req) { auth_(req.pw); return setCalRows_(String(req.a || ''), String(req.s || ''), Number(req.y) || 0, String(req.key || '')); }
function setCalRows_(A, S, Y, K) {
  if (!/^[A-Z]\d{2}$/.test(A) || !/^\d{7}$/.test(S) || Y < 2020 || Y > 2100) throw new Error('학교 코드가 올바르지 않아요');
  const ck = 'cal_' + A + S + Y, cache = CacheService.getScriptCache(), hit = cache.get(ck);
  if (hit) return { rows: JSON.parse(hit), cached: true };
  const base = 'https://open.neis.go.kr/hub/SchoolSchedule?Type=json&ATPT_OFCDC_SC_CODE=' + A + '&SD_SCHUL_CODE=' + S +
               '&AA_FROM_YMD=' + Y + '0301&AA_TO_YMD=' + (Y + 1) + '0228' + (K ? '&KEY=' + encodeURIComponent(K) : '');
  const size = K ? 1000 : 5;
  function rows_(j) { const a = j && j.SchoolSchedule; if (!a) return []; const r = a.filter(function (x) { return x.row; })[0]; return r ? r.row : []; }
  function total_(j) { try { return Number(j.SchoolSchedule[0].head[0].list_total_count) || 0; } catch (e) { return 0; } }
  const first = JSON.parse(UrlFetchApp.fetch(base + '&pIndex=1&pSize=' + size, { muteHttpExceptions: true }).getContentText());
  let all = rows_(first);
  const pages = Math.min(Math.ceil(total_(first) / size), 120);
  if (pages > 1) {
    const reqs = []; for (let p = 2; p <= pages; p++) reqs.push({ url: base + '&pIndex=' + p + '&pSize=' + size, muteHttpExceptions: true });
    UrlFetchApp.fetchAll(reqs).forEach(function (r) { try { all = all.concat(rows_(JSON.parse(r.getContentText()))); } catch (e) {} });
  }
  const out = all.map(function (x) { return [String(x.AA_YMD), String(x.EVENT_NM || '').trim(), String(x.SBTR_DD_SC_NM || '')]; })
                 .filter(function (r) { return /^\d{8}$/.test(r[0]) && r[1] && r[1] !== '토요휴업일'; });
  try { cache.put(ck, JSON.stringify(out), 43200); } catch (e) {}
  return { rows: out };
}
/* 편집기에서 한 번 실행해 권한(외부 접속·드라이브) 확인 */
function 학교세팅_시험() {
  Logger.log('드라이브 폴더: ' + setFolder_().getName());
  Logger.log('올라간 판: ' + JSON.stringify(setMeta_()));
  const r = setCalRows_('S10', '9022130', new Date().getMonth() >= 2 ? new Date().getFullYear() : new Date().getFullYear() - 1, '');
  Logger.log('나이스 학사일정 ' + r.rows.length + '줄 · 예: ' + JSON.stringify(r.rows.slice(0, 3)));
}
