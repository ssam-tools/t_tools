/* 쌤 노트 v2.52 · 🛡️ 관리자 · 🔐 학교 금고 (PLAN_금고)
   ─ 관리자 두 단계
     · 최고 관리자: 스크립트 속성 LIB_ADMIN 비밀번호 (지금 쓰는 자료실·학교 세팅 관리자 비밀번호 그대로)
     · 관리자(담당자): 최고 관리자가 쌤 노트 🛡️ 관리 → 🔑 비밀번호·열쇠에서 이름과 비밀번호를 만들어 줌 (ADM_LIST에 해시만 저장)
   ─ 관리자 모드: 비밀번호 확인 → 30분짜리 표(token, 서명됨)를 돌려줌. 관리자 요청마다 새 표(30분 연장).
     기기마다 5번, 학교 전체 20번 틀리면 10분 동안 막음. 긴급 잠금·관리자 회수 때 ADM_EPOCH를 올려 모든 표를 무효로.
   ─ 금고(D 묶음): 기기 안에서 '금고 문구'로 잠근 글자만 드라이브 '쌤노트_학교세팅' 폴더에 둠. 이 서버는 내용을 읽을 수 없음.
       vltver·vltget: 공용 비밀번호 / vltput: 관리자(문구를 바꾸는 판 kv 올리기는 최고 관리자) / vltwipe(긴급 잠금): 최고 관리자
   ─ 변경 기록 ADM_LOG: 언제·누가·무엇(요약)만 최근 200개. 내용은 남기지 않음.
   ─ 쓰는 법: Apps Script에 새 파일 Admin 을 만들어 붙여 넣고, Code.gs의 doPost 표에
       admlogin: () => admLogin_(req), admping: () => admPing_(req), admlist: () => admList_(req), admadd: () => admAdd_(req), admdel: () => admDel_(req), admlog: () => admLogGet_(req),
       vltver: () => vltVer_(req), vltget: () => vltGet_(req), vltput: () => vltPut_(req), vltwipe: () => vltWipe_(req),
     를 넣은 뒤 [배포 → 배포 관리 → ✏ 수정 → 새 버전 → 배포]. (SchoolSet.gs도 함께 새로 붙여 넣기) */
const ADM_LIST = 'ADM_LIST', ADM_SECRET = 'ADM_SECRET', ADM_EPOCH = 'ADM_EPOCH', ADM_LOG = 'ADM_LOG', VLT_META = 'VLT_META';
const ADM_TTL = 30 * 60 * 1000, VLT_MAX = 2 * 1024 * 1024;

function admJson_(k, d) { try { return JSON.parse(PROPS_.getProperty(k) || 'null') || d; } catch (e) { return d; } }
function admSecret_() { let s = PROPS_.getProperty(ADM_SECRET); if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); PROPS_.setProperty(ADM_SECRET, s); } return s; }
function admEpoch_() { return Number(PROPS_.getProperty(ADM_EPOCH) || 1); }
function admB64_(bytes) { return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, ''); }
function admHash_(pw, salt) {                                            // 소금 + 1000번 겹쳐 해시 (비밀번호 그대로는 저장하지 않음)
  let h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + pw, Utilities.Charset.UTF_8);
  for (let i = 0; i < 999; i++) h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h.concat(Utilities.newBlob(salt).getBytes()));
  return admB64_(h);
}
function admSame_(a, b) { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; }
function admSign_(o) {
  const body = admB64_(Utilities.newBlob(JSON.stringify(o)).getBytes());
  return body + '.' + admB64_(Utilities.computeHmacSha256Signature(body, admSecret_()));
}
function admTok_(tok) {                                                   // 표 확인 → {r: 'super'|'admin', n: 이름}
  const p = String(tok || '').split('.');
  if (p.length !== 2 || !admSame_(p[1], admB64_(Utilities.computeHmacSha256Signature(p[0], admSecret_())))) throw new Error('ADMIN_EXPIRED');
  let o; try { o = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(p[0] + '==='.slice((p[0].length + 3) % 4))).getDataAsString()); } catch (e) { throw new Error('ADMIN_EXPIRED'); }
  if (!o || o.e < Date.now() || o.p !== admEpoch_()) throw new Error('ADMIN_EXPIRED');
  if (o.r === 'admin' && !admJson_(ADM_LIST, []).some(function (a) { return a.n === o.n; })) throw new Error('ADMIN_EXPIRED');   // 회수된 관리자
  return { r: o.r, n: o.n };
}
function admIssue_(who) { const e = Date.now() + ADM_TTL; return { tok: admSign_({ r: who.r, n: who.n, e: e, p: admEpoch_() }), exp: e, role: who.r, name: who.n }; }
/* 관리자 요청 확인: 표(tok)가 있으면 표로, 없으면 예전 방식(admin = LIB_ADMIN)으로 → {r, n} */
function admNeed_(req, superOnly) {
  auth_(req.pw);
  let who;
  if (req.tok) who = admTok_(req.tok);
  else {
    const a = String(PROPS_.getProperty('LIB_ADMIN') || '');
    if (!a) throw new Error('관리자 비밀번호가 아직 없어요 (Apps Script → 프로젝트 설정 → 스크립트 속성 LIB_ADMIN)');
    if (!admSame_(String(req.admin || ''), a)) { admFail_(req); throw new Error('관리자 비밀번호가 맞지 않아요'); }
    who = { r: 'super', n: '최고 관리자' };
  }
  if (superOnly && who.r !== 'super') throw new Error('최고 관리자만 할 수 있어요');
  return who;
}
function admFail_(req) {
  const c = CacheService.getScriptCache(), dk = 'admf_' + String(req.dev || '-').slice(0, 40);
  c.put(dk, String(Number(c.get(dk) || 0) + 1), 600); c.put('admf_all', String(Number(c.get('admf_all') || 0) + 1), 600);
}
function admBlocked_(req) {
  const c = CacheService.getScriptCache();
  if (Number(c.get('admf_' + String(req.dev || '-').slice(0, 40)) || 0) >= 5) throw new Error('관리자 비밀번호를 5번 틀렸어요. 10분 뒤에 다시 해 주세요.');
  if (Number(c.get('admf_all') || 0) >= 20) throw new Error('관리자 비밀번호가 여러 번 틀려 잠시 막았어요. 10분 뒤에 다시 해 주세요.');
}
function admLog_(who, what) {
  const L = admJson_(ADM_LOG, []);
  L.unshift({ at: new Date().toISOString(), by: String(who && who.n || '관리자').slice(0, 20), r: who && who.r || '', w: txt_(what, 200) });
  PROPS_.setProperty(ADM_LOG, JSON.stringify(L.slice(0, 200)));
}

/* ── 관리자 모드 ── */
function admLogin_(req) {
  auth_(req.pw); admBlocked_(req);
  const pw = String(req.admin || ''), sup = String(PROPS_.getProperty('LIB_ADMIN') || '');
  if (!pw) throw new Error('관리자 비밀번호를 넣어 주세요');
  if (sup && admSame_(pw, sup)) { const nm = txt_(req.name, 20) || '최고 관리자'; admLog_({ r: 'super', n: nm }, '관리자 모드 시작'); return admIssue_({ r: 'super', n: nm }); }
  const me = admJson_(ADM_LIST, []).filter(function (a) { return admSame_(admHash_(pw, a.s), a.h); })[0];
  if (!me) { admFail_(req); throw new Error(sup ? '관리자 비밀번호가 맞지 않아요' : '관리자 비밀번호가 아직 없어요 (스크립트 속성 LIB_ADMIN)'); }
  admLog_({ r: 'admin', n: me.n }, '관리자 모드 시작');
  return admIssue_({ r: 'admin', n: me.n });
}
function admPing_(req) { auth_(req.pw); return admIssue_(admTok_(req.tok)); }
function admList_(req) { const who = admNeed_(req, true); return Object.assign(admIssue_(who), { list: admJson_(ADM_LIST, []).map(function (a) { return { n: a.n, at: a.at }; }), epoch: admEpoch_() }); }
function admAdd_(req) {
  const who = admNeed_(req, true), n = txt_(req.n, 20), np = String(req.npw || '');
  if (!n) throw new Error('관리자 이름을 넣어 주세요');
  if (np.length < 8) throw new Error('관리자 비밀번호는 8자 이상으로 해 주세요');
  if (admSame_(np, PROPS_.getProperty('LIB_ADMIN') || '') || admSame_(np, PROPS_.getProperty('PASSWORD') || '')) throw new Error('공용·최고 관리자 비밀번호와 다르게 해 주세요');
  const L = admJson_(ADM_LIST, []).filter(function (a) { return a.n !== n; }), s = Utilities.getUuid();
  L.push({ n: n, s: s, h: admHash_(np, s), at: new Date().toISOString() });
  PROPS_.setProperty(ADM_LIST, JSON.stringify(L.slice(0, 30)));
  admLog_(who, '관리자 ' + n + ' 만들기/비밀번호 바꾸기');
  return admList_(req);
}
function admDel_(req) {
  const who = admNeed_(req, true), n = txt_(req.n, 20);
  PROPS_.setProperty(ADM_LIST, JSON.stringify(admJson_(ADM_LIST, []).filter(function (a) { return a.n !== n; })));
  admLog_(who, '관리자 ' + n + ' 회수');
  return admList_(req);
}
function admLogGet_(req) { const who = admNeed_(req); return Object.assign(admIssue_(who), { log: admJson_(ADM_LOG, []) }); }

/* ── 🔐 금고 (D 묶음) ── */
function vltMeta_() { return admJson_(VLT_META, null); }
function vltVer_(req) { auth_(req.pw); const m = vltMeta_(); return m ? { ver: m.ver, at: m.at, sum: m.sum || '', kv: m.kv || 1, wiped: !!m.wiped, size: m.size || 0 } : { ver: 0 }; }
function vltGet_(req) {
  auth_(req.pw);
  const m = vltMeta_(); if (!m || !m.d) return { ver: m ? m.ver : 0, kv: m ? m.kv || 1 : 1, wiped: !!(m && m.wiped), data: '' };
  return { ver: m.ver, kv: m.kv || 1, data: DriveApp.getFileById(m.d).getBlob().getDataAsString() };
}
/* 올리기: d(잠긴 글자), sum(요약), base(고치기 시작한 판 — 다른 관리자가 먼저 올렸으면 멈춤), kv(문구 판: 올리면 최고 관리자만) */
function vltPut_(req) {
  const who = admNeed_(req), d = String(req.d || '');
  if (!/^\{"salt"/.test(d)) throw new Error('잠긴 금고가 아니에요');
  if (d.length > VLT_MAX) throw new Error('금고가 너무 커요 (2MB까지)');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const old = vltMeta_() || { ver: 0, kv: 1 }, kv = Number(req.kv || old.kv || 1);
    if (!old.d && who.r !== 'super') throw new Error('금고는 최고 관리자가 처음 만들어요');
    if (old.d && Number(req.base || 0) !== Number(old.ver || 0)) throw new Error('CONFLICT');   // 다른 관리자가 먼저 올림
    if (kv !== (old.kv || 1) && who.r !== 'super') throw new Error('금고 문구 바꾸기는 최고 관리자만 할 수 있어요');
    const f = setFolder_(), ver = Math.max(Date.now(), (old.ver || 0) + 1), fd = f.createFile('D_' + ver + '.txt', d, MimeType.PLAIN_TEXT);
    const m = { ver: ver, at: new Date().toISOString(), sum: txt_(req.sum, 200), d: fd.getId(), kv: kv, size: d.length, by: who.n };
    PROPS_.setProperty(VLT_META, JSON.stringify(m));
    if (old.d) { try { DriveApp.getFileById(old.d).setTrashed(true); } catch (e) {} }
    admLog_(who, '금고: ' + (m.sum || '고침') + (kv !== (old.kv || 1) ? ' · 금고 문구 바꿈' : ''));
    return Object.assign(admIssue_(who), { ver: ver, kv: kv });
  } finally { lock.releaseLock(); }
}
/* 긴급 잠금: 서버의 금고를 지우고, 모든 관리자 표를 무효로. 선생님 기기는 다음 확인 때 기억한 금고·문구를 지움 */
function vltWipe_(req) {
  const who = admNeed_(req, true), old = vltMeta_() || {};
  if (old.d) { try { DriveApp.getFileById(old.d).setTrashed(true); } catch (e) {} }
  PROPS_.setProperty(VLT_META, JSON.stringify({ ver: Math.max(Date.now(), (old.ver || 0) + 1), at: new Date().toISOString(), sum: '긴급 잠금', d: '', kv: (old.kv || 1) + 1, wiped: true, by: who.n }));
  PROPS_.setProperty(ADM_EPOCH, String(admEpoch_() + 1));
  admLog_(who, '🚨 금고 긴급 잠금 (모든 관리자 모드 끝냄)');
  return { ok: true };
}
/* 편집기에서 한 번 실행해 확인 */
function 관리자_시험() {
  Logger.log('관리자 수: ' + admJson_(ADM_LIST, []).length + ' · 최고 관리자 비밀번호: ' + (PROPS_.getProperty('LIB_ADMIN') ? '있음' : '없음(LIB_ADMIN을 넣어 주세요)'));
  Logger.log('금고: ' + JSON.stringify(vltMeta_()));
  const t = admIssue_({ r: 'super', n: '시험' }); Logger.log('표 확인: ' + JSON.stringify(admTok_(t.tok)));
}
