/* 쌤 노트 · 학교 세팅 공유 (PLAN_세팅공유, v2.40)
   인터넷과 공용 비밀번호만으로 학기초 세팅을 받고, 학기 중 바뀐 것도 저절로 맞춥니다.
   · 학교 업무판(앱스 스크립트 board/SchoolSet.gs)에는 '잠긴 글자'만 있습니다. 잠그기·풀기는 이 기기 안에서.
       A 묶음(학교 정보·교직원·학사일정·전체 시간표·학교 추천 세트) = 공용 비밀번호로 잠금
       B 묶음(학생 명렬) = 담당자가 따로 알려 준 '학생 명렬 비밀 문구'로 잠금
   · 저장: tt_schoolset_v1 {ver, at, sum, scope, ttAt, bk(학생 명렬 비밀 문구 — 내 기기에서만), recSeen, starSeen, booksOff}
           ttset_prev(되돌리기용 이전 판 1개 · 백업·동기화에 안 들어감) · ttset_chk·ttset_cal·ttset_books(마지막 확인 시각)
   · 교실 기기(전자칠판)에서는 학교 세팅을 저장하지 않고, 교과서만 쉬는 동안 받아 둡니다(학생 명렬 비밀 문구는 기억하지 않음). */
var TTSet = (function(){
  "use strict";
  var APP = "ssamnote-schoolset", ITER = 310000, KEY = "tt_schoolset_v1", PREV = "ttset_prev";
  var URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/?#\s]+|macros)\/s\/[\w-]+\/exec$/;
  var T = {};                                                                     // 밖에서 쓰는 이름표 (안에서도 T.api로 불러 바꿔 끼울 수 있게)
  var SNAP = ["tt_school_v1", "tt_roster_v1", "tt_staff_v1", "tt_calendar_v1", "tt_alltt_v1", "tt_timetable_v1", "tt_sites_v1", "tt_lib_star_v1"];
  function LS(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function LSset(k, v){ try{ if(v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
  function room(){ return LS("ttv_device") === "classroom"; }

  /* ================= 잠그기·풀기 (학기초 세팅 파일과 같은 방식: PBKDF2 31만 번 → AES-GCM 256, gzip) ================= */
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64(u8){ var s = "", i; for(i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function keyOf(pass, salt, iter){
    return crypto.subtle.importKey("raw", enc.encode(String(pass).normalize("NFC")), "PBKDF2", false, ["deriveKey"]).then(function(base){
      return crypto.subtle.deriveKey({name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: iter}, base, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]);
    });
  }
  function gz(u8, C){ return new Response(new Blob([u8]).stream().pipeThrough(new C("gzip"))).arrayBuffer().then(function(b){ return new Uint8Array(b); }); }
  function lock(obj, pass){
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), raw = enc.encode(JSON.stringify(obj)), z = typeof CompressionStream !== "undefined";
    return (z ? gz(raw, CompressionStream) : Promise.resolve(raw)).then(function(r){
      return keyOf(pass, salt, ITER).then(function(k){ return crypto.subtle.encrypt({name: "AES-GCM", iv: iv, additionalData: enc.encode(APP)}, k, r); });
    }).then(function(ct){ return JSON.stringify({salt: b64(salt), iter: ITER, iv: b64(iv), gz: z, ct: b64(new Uint8Array(ct))}); });
  }
  function unlock(text, pass){
    var f = typeof text === "string" ? JSON.parse(text) : text;
    return keyOf(pass, unb64(f.salt), +f.iter || ITER).then(function(k){
      return crypto.subtle.decrypt({name: "AES-GCM", iv: unb64(f.iv), additionalData: enc.encode(APP)}, k, unb64(f.ct));
    }).then(function(pt){
      pt = new Uint8Array(pt);
      if(f.gz){ if(typeof DecompressionStream === "undefined") throw new Error("OLD"); return gz(pt, DecompressionStream); }
      return pt;
    }).then(function(pt){ return JSON.parse(dec.decode(pt)); }, function(e){ throw new Error(e && e.message === "OLD" ? "OLD" : "LOCK"); });
  }

  /* ================= 업무판 ================= */
  function board(){
    var B = {}; try{ B = JSON.parse(LS("tt_board_v1") || "null") || {}; }catch(e){}
    if(!B.pw || !B.url){ var s = {}; try{ s = JSON.parse(LS("ttv_server") || "null") || {}; }catch(e){} if(s.url && s.pw && (!B.url || B.url === s.url)){ B = {url: s.url, pw: s.pw}; } }   // 교실 기기: 보관함 연결 정보
    if(!B.url && window.TT_GO_SCHOOLS && TT_GO_SCHOOLS[""]) B = Object.assign({}, B, {url: TT_GO_SCHOOLS[""]});   // 우리 학교 업무판 기본 주소 (g/schools.js)
    return B;
  }
  function api(action, extra, cfg){
    var c = cfg || board();
    if(!c.url || !URL_RE.test(c.url)) return Promise.reject(new Error("NOBOARD"));
    return fetch(c.url, {method: "POST", redirect: "follow", credentials: "omit", cache: "no-store", headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(Object.assign({action: action, pw: c.pw}, extra || {}))})
      .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function(t){ var j; try{ j = JSON.parse(t); }catch(e){ throw new Error("NO_DOPOST"); } if(!j.ok) throw new Error(j.error || "오류"); return j; });
  }
  function errText(e){
    var m = String(e && e.message || e);
    return m === "AUTH" ? "공용 비밀번호가 맞지 않아요." : m === "LOCK" ? "비밀번호(비밀 문구)가 맞지 않아 열 수 없어요." : m === "OLD" ? "이 브라우저로는 열 수 없어요. 최신 크롬·엣지를 써 주세요."
      : /지원하지 않는 요청/.test(m) ? "학교 업무판이 아직 '학교 세팅'을 지원하지 않아요(업무판 담당 선생님께 새 버전 배포를 부탁해 주세요)."
      : m === "NOBOARD" ? "학교 업무판이 연결되어 있지 않아요." : m === "NO_DOPOST" ? "업무판 주소를 확인해 주세요."
      : /Failed to fetch|NetworkError|Load failed/i.test(m) ? "인터넷 연결을 확인해 주세요." : m;
  }

  /* ================= 상태 ================= */
  function state(){ var o = TT.store.get(KEY, null); return o && typeof o === "object" ? o : {}; }
  function saveState(o){ if(room()) return; TT.store.set(KEY, o); }

  /* 서버에서 받아 풀기: A는 공용 비밀번호로, B는 비밀 문구(bk)가 있을 때만 */
  function pull(cfg, bk){
    var out = {};
    return T.api("setver", null, cfg).then(function(m){
      out.meta = m; if(!m.ver) return out;
      return T.api("setget", {part: "a"}, cfg).then(function(r){ return unlock(r.data, cfg.pw); }).then(function(A){
        out.A = A;
        if(!m.hasB || !bk) return out;
        return T.api("setget", {part: "b"}, cfg).then(function(r){ return unlock(r.data, bk); }).then(function(B){ out.B = B; return out; }, function(e){ out.bErr = e; return out; });
      });
    });
  }
  function pullB(cfg, bk){ return T.api("setget", {part: "b"}, cfg).then(function(r){ return unlock(r.data, bk); }); }

  /* ================= 적용 (세팅 파일 · 인터넷 둘 다) =================
     D = {school, board, staff, staffMain, calendar, alltt, roster, rec}
     o = {me, subj, home, scope:"mine"|"all", what:{school,cal,staff,tt}, update:true(학기 중 저절로 반영)} */
  function teacherOf(D, me){ return ((D.alltt || {}).teachers || []).filter(function(t){ return t.name === me; })[0] || null; }
  function myCodes(D, me){ var t = teacherOf(D, me), c = {}; if(t) Object.keys(t.slots).forEach(function(k){ var x = t.slots[k].cls; if(x) c[x] = 1; }); return c; }
  function homeGuess(D, me){
    var st = (D.staff || []).filter(function(s){ return s.name === me; })[0]; if(!st) return "";
    var m = /(\d)\s*[-학년]\s*(\d{1,2})\s*반?\s*담임/.exec((st.pos || "") + " " + (st.dept || "")); return m ? m[1] + "-" + (+m[2]) : "";
  }
  function apply(D, o){
    o = o || {}; var what = o.what || {school: 1, cal: 1, staff: 1, tt: 1}, done = [], S = state(), up = !!o.update;
    /* 학교 정보 · (처음에만) 내 이름 · 내 교과 */
    var sc = {};
    if(!up){ sc.teacher = o.me; sc.subject = o.subj || ""; }
    if(what.school && D.school){
      ["name", "principal", "addr", "tel", "comci"].forEach(function(k){ if(D.school[k] != null) sc[k] = D.school[k]; });
      ["neisA", "neisS", "neisKey"].forEach(function(k){ if(D.school[k]) sc[k] = D.school[k]; });
      if(D.school.hid) sc.hid = D.school.hid;                                    // 숨은 정보 (담당자가 정한 대로)
      if(D.school.neisS && !up) done.push("급식");
    }
    TT.school.save(sc);
    if(what.school && D.board && D.board.url && URL_RE.test(D.board.url)){
      var B = TT.store.get("tt_board_v1", null) || {}; if(B.url !== D.board.url){ B.url = D.board.url; delete B.hidden; TT.store.set("tt_board_v1", B); done.push("학교 업무판 주소"); }
    }
    /* 학생 명렬: 같은 학년·반은 명단만 새로 (학생 기록은 학년-반-번호로 이어짐) */
    if(D.roster && D.roster.length){
      var R = TT.roster.load(), n = 0, want;
      R.classes = R.classes.filter(function(c){ return c.students.length || c.grade != null; });
      if(up){
        var scope = S.scope || "mine";
        want = D.roster.filter(function(w){ return scope === "all" || R.classes.some(function(c){ return c.grade === w.grade && c.cls === w.cls; }); });
      } else {
        var codes = myCodes(D, o.me);
        want = D.roster.filter(function(c){ return o.scope === "all" || codes[c.grade * 100 + c.cls] || o.home === c.grade + "-" + c.cls; });
      }
      want.forEach(function(w){
        var ex = R.classes.filter(function(c){ return c.grade === w.grade && c.cls === w.cls; })[0];
        var st = w.students.map(function(s){ return {no: s.no, name: s.name}; });
        if(ex){ ex.students = st; ex.name = w.name; } else R.classes.push({id: TT.util.uid(), name: w.name, grade: w.grade, cls: w.cls, students: st});
        n += st.length;
      });
      if(!up){
        var hc = o.home ? R.classes.filter(function(c){ return c.grade + "-" + c.cls === o.home; })[0] : null;
        R.home = hc ? hc.id : (o.home === "" ? "" : R.home);
        R = TT.roster.clean(R); if(hc) R.current = hc.id;
        S.scope = o.scope || "mine";
      } else R = TT.roster.clean(R);
      TT.roster.save(R); done.push("학생 " + want.length + "개 반 " + n + "명");
    }
    /* 학사일정: 담당자가 넣은 일정(src:"set")만 바꿈 · 내가 넣은 일정·나이스 일정은 그대로(같은 일정은 한 번만) */
    if(what.cal && D.calendar && D.calendar.events){
      var C = TT.store.get("tt_calendar_v1", null) || {}, ev = Array.isArray(C.events) ? C.events : [];
      if(!up && !ev.some(function(e){ return e.src; })) ev = [];                // 예전 방식(세팅 파일)처럼 처음에는 새것으로
      ev = ev.filter(function(e){ return e.src !== "set"; });
      var nk2 = function(e){ return e.d + "|" + String(e.t).replace(/\s+/g, ""); }, have = {}; ev.forEach(function(e){ have[nk2(e)] = 1; });   // 나이스에 이미 있는 같은 일정은 한 번만
      var add = D.calendar.events.filter(function(e){ return !have[nk2(e)]; }).map(function(e){ return {d: e.d, t: e.t, k: e.k, src: "set"}; });
      C.v = 1; C.y = D.calendar.y || C.y; C.events = ev.concat(add).sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }); C.at = Date.now();
      TT.store.set("tt_calendar_v1", C); done.push("학사일정 " + D.calendar.events.length + "개");
    }
    if(what.staff && D.staff){ TT.store.set(TT.staff.KEY, {v: 1, list: D.staff, main: (D.staffMain || []).slice(0, 20), at: Date.now()}); done.push("교직원 " + D.staff.length + "명" + (D.staff.some(function(x){ return x.tel; }) ? "(내선번호 포함)" : "")); }
    /* 전체 교사 시간표 · 내 시간표 (학기 중에는 내가 고치지 않은 시간표만 새로) */
    if(D.alltt){
      TT.store.set("tt_alltt_v1", {v: 1, periods: D.alltt.periods, teachers: D.alltt.teachers, at: Date.now()});
      var me = up ? TT.school.load().teacher : o.me, t = teacherOf(D, me), cur = TT.timetable.load();
      var mine = up ? !!(cur && cur.from === "setup" && S.ttAt && cur.updatedAt === S.ttAt) : what.tt;
      if(mine && t){
        var old = cur || {v: 1}, subj = TT.school.load().subject, slots = {};
        Object.keys(t.slots).forEach(function(k){ var s = t.slots[k]; slots[k] = {code: s.code, cls: s.cls, subj: s.subj || subj}; });
        var maxP = Object.keys(slots).reduce(function(a, k){ return Math.max(a, +k.split("-")[1]); }, 0);
        old.periods = D.alltt.periods.filter(function(p){ return p.n <= Math.max(maxP, 7); });
        old.slots = slots; old.weeks = up ? (old.weeks || {}) : {}; old.updatedAt = Date.now(); old.from = "setup";
        TT.store.set(TT.timetable.KEY, old); S.ttAt = old.updatedAt; done.push("내 시간표 " + Object.keys(slots).length + "시간");
      }
    }
    /* 학교 추천 세트: 사이트 · ★ 문서 — 내가 고치거나 지운 것이 우선(한 번 내려 준 것은 다시 넣지 않음) */
    if(D.rec){
      var nAdd = 0;
      if(Array.isArray(D.rec.sites) && D.rec.sites.length){
        var SI = TT.store.get("tt_sites_v1", null) || {v: 1, items: []}; SI.items = SI.items || [];
        var seen = S.recSeen || {}, have = {}; SI.items.forEach(function(x){ have[x.u] = 1; });
        D.rec.sites.forEach(function(x){
          if(!x || !/^https?:\/\//.test(x.u || "") || seen[x.u]) return; seen[x.u] = 1;
          if(have[x.u]) return;
          SI.items.push({id: TT.util.uid(), t: String(x.t || "").slice(0, 30), u: x.u, c: x.c === "class" ? "class" : "work", src: "school"}); nAdd++;
        });
        S.recSeen = seen; TT.store.set("tt_sites_v1", SI);
      }
      if(Array.isArray(D.rec.stars) && D.rec.stars.length){
        var ST = TT.store.get("tt_lib_star_v1", null) || {}; ST.ids = ST.ids || {};
        var ss = S.starSeen || {};
        D.rec.stars.forEach(function(id){ id = String(id); if(ss[id]) return; ss[id] = 1; if(!ST.ids[id]){ ST.ids[id] = 1; nAdd++; } });
        S.starSeen = ss; TT.store.set("tt_lib_star_v1", ST);
      }
      if(nAdd) done.push("학교 추천 " + nAdd + "개");
    }
    saveState(S);
    return done;
  }

  /* ================= 되돌리기용 이전 판 (1개) ================= */
  function snapshot(ver){ var o = {ver: ver, at: Date.now(), keys: {}}; SNAP.forEach(function(k){ o.keys[k] = LS(k); }); LSset(PREV, JSON.stringify(o)); }
  function revert(){
    var o = null; try{ o = JSON.parse(LS(PREV) || "null"); }catch(e){}
    if(!o || !o.keys) return false;
    Object.keys(o.keys).forEach(function(k){ LSset(k, o.keys[k]); });
    LSset(PREV, null); return true;
  }

  /* ================= 4단계: 켤 때 판 번호만 확인 → 새 판이면 저절로 반영 ================= */
  function refresh(){ try{ window.dispatchEvent(new Event("storage")); }catch(e){} }
  function check(force){
    if(room() || !window.crypto || !crypto.subtle) return Promise.resolve(null);
    var c = board(); if(!c.url || !c.pw) return Promise.resolve(null);
    var last = +(LS("ttset_chk") || 0); if(!force && Date.now() - last < 15 * 60000) return Promise.resolve(null);
    LSset("ttset_chk", String(Date.now()));
    var S = state();
    return T.api("setver", null, c).then(function(m){
      if(!m.ver) return null;
      S = state(); S.books = !!m.books; saveState(S);
      if(!S.ver){                                                                // 아직 인터넷 세팅을 받지 않은 기기: 한 번만 알림
        if((S.offered || 0) >= m.ver) return null;
        S.offered = m.ver; saveState(S);
        TT.ui.toast("🦉 학교 세팅이 올라와 있어요. 명렬·시간표·학사일정을 한 번에 받을 수 있어요.", function(){ location.href = TT.BASE + "apps/setup/?cloud"; }, "받기", 12000);
        return null;
      }
      if(m.ver <= S.ver) return null;
      var bk = S.bk || "";
      return pull(c, m.hasB ? bk : "").then(function(r){
        if(!r.A) return null;
        var D = Object.assign({}, r.A), note = "";
        if(r.B) D.roster = r.B.roster;
        else if(r.bErr && bk){ S = state(); delete S.bk; saveState(S); note = " · 학생 명렬 비밀 문구가 바뀌었어요(학기초 세팅에서 다시 넣기)"; }
        snapshot(S.ver);
        apply(D, {update: true});
        S = state(); S.ver = m.ver; S.at = m.at; S.sum = m.sum || ""; saveState(S);
        refresh();
        TT.ui.toast("🦉 학교 세팅이 바뀌었어요" + (m.sum ? " · " + m.sum : "") + note, function(){
          var v = state().ver;
          if(revert()){ var s2 = state(); s2.ver = v; saveState(s2); refresh(); TT.ui.toast("이전 판으로 되돌렸어요. 다음 새 판이 올라오면 다시 맞춰요."); }
        }, "되돌리기", 14000);
        return m;
      }, function(e){
        if(String(e && e.message) === "LOCK") TT.ui.toast("🦉 학교 세팅을 열지 못했어요. 공용 비밀번호가 바뀐 것 같아요 — 설정 → 시작 세팅 → 학교 연결에서 새 비밀번호를 넣어 주세요.", null, null, 10000);
        return null;
      });
    }).catch(function(e){ var m = String(e && e.message); if(m === "AUTH") TT.ui.toast("업무판 공용 비밀번호가 바뀌었어요. 설정 → 시작 세팅 → 학교 연결에서 새 비밀번호를 넣어 주세요.", null, null, 9000); return null; });
  }

  /* ================= 6단계: 나이스 학사일정 저절로 (하루 한 번) ================= */
  var OFF = /휴업|방학(?!식)|공휴일|대체|재량|개교\s*기념|신정|설날|추석|어린이날|현충일|광복절|개천절|한글날|성탄|기독탄신|삼일절|3\.1절|3·1절|석가|부처님|선거일|연휴|휴일/, EXAM = /고사|시험|평가|모의고사/;
  function kindOf(t, sub){ return /휴업|공휴/.test(sub || "") || OFF.test(t) ? "off" : EXAM.test(t) ? "exam" : "evt"; }
  function ay(){ var d = new Date(); return d.getMonth() >= 2 ? d.getFullYear() : d.getFullYear() - 1; }
  function neisCal(force){
    if(room()) return Promise.resolve(null);
    var s = TT.school.load(); if(!s.neisA || !s.neisS) return Promise.resolve(null);
    var today = new Date().toISOString().slice(0, 10);
    if(!force && LS("ttset_cal") === today) return Promise.resolve(null);
    LSset("ttset_cal", today);
    var Y = ay(), c = board();
    var get = c.url && c.pw ? T.api("setcal", {a: s.neisA, s: s.neisS, y: Y, key: s.neisKey || ""}, c).then(function(r){ return r.rows; }) : Promise.reject(new Error("NOBOARD"));
    return get.catch(function(){                                                 // 업무판이 없거나 예전 것: 인증키가 있으면 바로 받기
      if(!s.neisKey) throw new Error("NOKEY");
      return fetch("https://open.neis.go.kr/hub/SchoolSchedule?Type=json&pIndex=1&pSize=1000&KEY=" + encodeURIComponent(s.neisKey) + "&ATPT_OFCDC_SC_CODE=" + s.neisA + "&SD_SCHUL_CODE=" + s.neisS + "&AA_FROM_YMD=" + Y + "0301&AA_TO_YMD=" + (Y + 1) + "0228")
        .then(function(r){ return r.json(); }).then(function(j){ var a = j && j.SchoolSchedule, r = a && a.filter(function(x){ return x.row; })[0]; return (r ? r.row : []).map(function(x){ return [x.AA_YMD, x.EVENT_NM, x.SBTR_DD_SC_NM]; }); });
    }).then(function(rows){
      if(!rows || !rows.length) return null;
      var seen = {}, list = [];
      rows.forEach(function(r){
        var d = String(r[0]), t = String(r[1] || "").trim(); if(!/^\d{8}$/.test(d) || !t || t === "토요휴업일") return;
        d = d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8);
        if(seen[d + "|" + t]) return; seen[d + "|" + t] = 1;
        list.push({d: d, t: t.slice(0, 40), k: kindOf(t, r[2]), src: "neis"});
      });
      if(!list.length) return null;
      var C = TT.store.get("tt_calendar_v1", null) || {v: 1, events: []}, ev = Array.isArray(C.events) ? C.events : [];
      var from = Y + "-03-01", to = (Y + 1) + "-02-31", inY = function(e){ return e.d >= from && e.d <= to; };
      var mine = ev.filter(function(e){ return !(inY(e) && e.src === "neis"); });       // 담당자가 넣은 일정·내 일정은 그대로 두고 나이스 것만 새로
      var nk = function(e){ return e.d + "|" + String(e.t).replace(/\s+/g, ""); }, own = {}; mine.forEach(function(e){ own[nk(e)] = 1; });
      var before = ev.filter(function(e){ return inY(e) && e.src === "neis"; }).length;
      C.events = mine.concat(list.filter(function(e){ return !own[nk(e)]; })).sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
      C.v = 1; C.y = Y; C.at = Date.now(); TT.store.set("tt_calendar_v1", C);
      var S = state(); S.neisY = S.neisY || {}; S.neisY[Y] = Date.now(); saveState(S);
      if(before !== list.length) refresh();
      return list.length;
    }).catch(function(){ return null; });
  }

  /* ================= 7단계: 교과서·수업 자료를 쉬는 동안 저절로 받기 ================= */
  function phone(){ try{ return matchMedia("(pointer:coarse)").matches && Math.min(screen.width, screen.height) < 820; }catch(e){ return false; } }
  function wifiOk(){ var n = navigator.connection; if(!n) return true; if(n.saveData) return false; if(n.type && /cellular|bluetooth|wimax/.test(n.type)) return false; if(/2g|3g/.test(n.effectiveType || "")) return false; return true; }
  function myGrades(){
    var T = TT.timetable.load(), g = {};
    if(T && T.slots) Object.keys(T.slots).forEach(function(k){ var c = +T.slots[k].cls || 0; if(c >= 100) g[Math.floor(c / 100)] = 1; });
    var h = TT.roster.home && TT.roster.home(); if(h && h.grade) g[h.grade] = 1;
    var L = Object.keys(g).map(Number).filter(function(x){ return x >= 1 && x <= 3; });
    return L.length ? L : [1, 2, 3];
  }
  var pill = null;
  function say(t, done){
    if(!pill){ pill = document.createElement("div"); pill.className = "ttset-pill"; pill.setAttribute("role", "status");
      pill.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:60;background:var(--card,#fff);color:var(--ink,#223);border:1px solid var(--line,#d8dee6);border-radius:999px;padding:6px 12px;font-size:12.5px;box-shadow:0 4px 14px rgba(0,0,0,.12);max-width:70vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
      document.body.appendChild(pill); }
    pill.textContent = t;
    if(done) setTimeout(function(){ if(pill){ pill.remove(); pill = null; } }, 6000);
  }
  function books(force){
    var S = state(), c = board();
    if(!c.url || !c.pw) return;
    if(!room() && (!S.books || S.booksOff)) return;                               // 담당자가 켠 학교만 · 내 기기에서 끌 수 있음
    if(room() && !LS("ttset_room_books")) return;                               // 교실 기기: QR로 세팅할 때 켬
    if(!force && (phone() || !wifiOk() || navigator.onLine === false)) return;
    var today = new Date().toISOString().slice(0, 10); if(!force && LS("ttset_books") === today) return;
    LSset("ttset_books", today);
    var g = room() ? [1, 2, 3] : myGrades(), fr = document.createElement("iframe");
    fr.src = TT.BASE + "apps/book/?auto=" + g.join(","); fr.title = "교과서 받기"; fr.setAttribute("aria-hidden", "true"); fr.tabIndex = -1;
    fr.style.cssText = "position:fixed;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0";
    var shown = false, end = setTimeout(function(){ fr.remove(); }, 20 * 60000);
    window.addEventListener("message", function on(e){
      var d = e.data; if(!d || e.source !== fr.contentWindow || !d.ttbook) return;
      if(d.ttbook === "prog"){ shown = true; say("📘 " + d.text); }
      else { window.removeEventListener("message", on); clearTimeout(end); setTimeout(function(){ fr.remove(); }, 500); if(shown || force) say("📘 " + (d.text || "교과서 준비 끝"), true); }
    });
    document.body.appendChild(fr);
  }

  /* ================= 10단계: 이 기기에서 학교 세팅 지우기 ================= */
  function wipeLocal(){
    TT.store.remove(KEY); ["ttset_prev", "ttset_chk", "ttset_cal", "ttset_books", "ttset_room_books"].forEach(function(k){ LSset(k, null); });
  }

  /* 첫 화면에서: 판 확인 → 학사일정 → 교과서 (쉬는 동안 차례로) */
  function boot(){
    if(window.top !== window) return;
    var idle = window.requestIdleCallback || function(fn){ return setTimeout(fn, 1); };
    setTimeout(function(){ idle(function(){
      check().then(function(){ return neisCal(); }).then(function(){ setTimeout(function(){ idle(function(){ books(); }, {timeout: 10000}); }, 8000); });
    }, {timeout: 6000}); }, 4000);
  }

  return Object.assign(T, {APP: APP, lock: lock, unlock: unlock, api: api, errText: errText, board: board, state: state, saveState: saveState, pull: pull, pullB: pullB,
          apply: apply, teacherOf: teacherOf, myCodes: myCodes, homeGuess: homeGuess, snapshot: snapshot, revert: revert, check: check, neisCal: neisCal,
          books: books, myGrades: myGrades, wipeLocal: wipeLocal, boot: boot, room: room, URL_RE: URL_RE});
})();
if(typeof window !== "undefined" && window.TT && !/\/apps\//.test(location.pathname)) TTSet.boot();
