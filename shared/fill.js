/* 쌤 노트 · 문서 자동 채움 (17단계) — 가정통신문·안내 문자·신청서·공문 틀에 학교명·날짜·담임·학급·명단을 채웁니다.
   선생님은 빈칸 한두 곳만 씁니다. 계산은 모두 이 기기 안에서 합니다(밖으로 보내지 않음).

   ■ 틀에 쓰는 표시 (중괄호)
     자동으로 채움 : {학교} {학교장} {교장} {주소} {전화} {담임} {교과} {학급} {학년} {반} {인원} {학생} {번호} {오늘} {올해} {학년도}
     날짜 계산     : {날짜:다음 주 금요일}  {날짜:내일|길게}  {날짜:기말고사}(학사일정에서 찾음)  {날짜:다음 등교일}
                     모양 → 짧게(기본) 11월 27일(금) · 길게 2026년 11월 27일(금요일) · 공문 2026. 11. 27.(금) · 숫자 11/27(금)
     선생님이 쓰는 칸 : {빈칸:이름=기본값}  {글칸:이름=기본값}(여러 줄)  {날짜칸:이름=다음 주 금요일|길게}
                     같은 이름은 한 번만 물어봅니다. 날짜칸에는 "다음 주 월요일", "11/27", "3일 뒤"처럼 써도 됩니다.
   ■ 날짜 말 : 오늘·내일·모레·글피 · N일 뒤/후 · N주 뒤 · (이번/다음/다다음) 주 X요일 · X요일 · (이번/다음) 달 N일
              · 11월 27일 · 11/27 · 2026. 11. 27. · 다음 등교일(수업일) · 학사일정 행사 이름
   ■ 저장 : 내 틀 "tt_filltpl_v1" {v:1, list:[{id, ic, n, kind:"text"|"paper", title, body, at}]} */
var TTFill = (function(){
  "use strict";
  var TN = function(id, j, fb){ return typeof ttTool === "function" && ttTool(id) ? ttName(id, j) : fb; };   // 도구 이름은 shared/tools.js 한 곳에서 (개편 0단계)
  var DOW = "일월화수목금토", MINE = "tt_filltpl_v1";
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function day0(d){ var x = new Date(d || new Date()); x.setHours(0, 0, 0, 0); return x; }
  function add(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function valid(y, m, d){ var x = new Date(y, m - 1, d); return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d ? x : null; }

  /* ---------- 학사일정 (휴업일·행사) ---------- */
  function cal(){ var C = TT.store.get("tt_calendar_v1", null); return C && Array.isArray(C.events) ? C.events : []; }
  function offMap(){ var o = {}; cal().forEach(function(e){ if(e.k === "off") o[e.d] = e.t; }); return o; }
  function isSchool(d, off){ var w = d.getDay(); return w >= 1 && w <= 5 && !(off || offMap())[ymd(d)]; }

  /* ---------- 날짜 말 → 날짜 ---------- */
  function when(expr, base){
    var t0 = day0(base), s = String(expr == null ? "" : expr).replace(/\s+/g, " ").trim().replace(/\s*(까지|부터|에)$/, "");
    if(!s) return null;
    var m;
    if(s === "오늘") return t0;
    if(s === "내일") return add(t0, 1);
    if(s === "모레") return add(t0, 2);
    if(s === "글피") return add(t0, 3);
    if(s === "어제") return add(t0, -1);
    if(/^다음\s?(등교일|수업일)$/.test(s)){ var off = offMap(), x = t0, g = 0; do{ x = add(x, 1); }while(!isSchool(x, off) && g++ < 40); return x; }
    if((m = s.match(/^(\d{1,3})\s*일\s*(뒤|후|전)$/))) return add(t0, (m[2] === "전" ? -1 : 1) * +m[1]);
    if((m = s.match(/^(\d{1,2})\s*주\s*(뒤|후|전)$/))) return add(t0, (m[2] === "전" ? -7 : 7) * +m[1]);
    if((m = s.match(/^(이번|다음|담|다다음|지난)\s?주\s?([월화수목금토일])(요일)?$/))){
      var mon = add(t0, -((t0.getDay() + 6) % 7)), wk = {"이번": 0, "다음": 7, "담": 7, "다다음": 14, "지난": -7}[m[1]];
      return add(mon, wk + (DOW.indexOf(m[2]) + 6) % 7);
    }
    if((m = s.match(/^([월화수목금토일])요일$/))) return add(t0, (DOW.indexOf(m[1]) - t0.getDay() + 7) % 7);
    if((m = s.match(/^(이번|다음)\s?달\s?(\d{1,2})\s*일$/))) return valid(t0.getFullYear(), t0.getMonth() + 1 + (m[1] === "다음" ? 1 : 0), +m[2]) || (function(){ var y = t0.getFullYear(), mo = t0.getMonth() + 2; return valid(mo > 12 ? y + 1 : y, mo > 12 ? 1 : mo, +m[2]); })();
    if((m = s.match(/^(\d{4})\s*[.\-\/년]\s*(\d{1,2})\s*[.\-\/월]\s*(\d{1,2})\s*(일|\.)?(\s*\(.\))?$/))) return valid(+m[1], +m[2], +m[3]);
    if((m = s.match(/^(\d{1,2})\s*(?:월\s*|[\/.]\s*)(\d{1,2})\s*(일|\.)?(\s*\(.\))?$/))){
      var y0 = t0.getFullYear(), d1 = valid(y0, +m[1], +m[2]);
      if(d1 && d1 < add(t0, -60)) d1 = valid(y0 + 1, +m[1], +m[2]);                      // 두 달 넘게 지난 날은 내년
      return d1;
    }
    if((m = s.match(/^(\d{1,2})\s*일$/))){ var d2 = new Date(t0.getFullYear(), t0.getMonth(), +m[1]); if(d2 < t0) d2.setMonth(d2.getMonth() + 1); return d2; }
    /* 학사일정 행사 이름 (가장 가까운 다가오는 날) */
    var key = s.replace(/\s+/g, ""); if(key.length < 2) return null;
    var hit = cal().filter(function(e){ return e.d >= ymd(t0) && String(e.t).replace(/\s+/g, "").indexOf(key) >= 0; }).sort(function(a, b){ return a.d < b.d ? -1 : 1; })[0];
    if(hit){ var p = hit.d.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
    return null;
  }
  function fmt(d, shape){
    if(!d) return "";
    var Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate(), w = DOW[d.getDay()];
    if(shape === "길게") return Y + "년 " + M + "월 " + D + "일(" + w + "요일)";
    if(shape === "공문") return Y + ". " + M + ". " + D + ".(" + w + ")";
    if(shape === "숫자") return M + "/" + D + "(" + w + ")";
    if(shape === "요일없이") return M + "월 " + D + "일";
    return M + "월 " + D + "일(" + w + ")";
  }
  /* 그 날짜에 조심할 점: 지난 날 · 주말 · 휴업일 */
  function check(d){
    if(!d) return "";
    var off = offMap()[ymd(d)], w = d.getDay(), t0 = day0();
    if(d < t0) return "지난 날짜";
    if(off) return "휴업일(" + off + ")";
    if(w === 0 || w === 6) return DOW[w] + "요일";
    return "";
  }

  /* ---------- 자동으로 채우는 값 ---------- */
  function clsLabel(c){ return !c ? "" : c.grade && c.cls ? c.grade + "학년 " + c.cls + "반" : String(c.name || ""); }
  function ctx(c, st){
    var sc = TT.school.load(), now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
    c = c === undefined ? TT.roster.home() : c;
    var sname = sc.name || "", head = sname ? sname.replace(/\s+/g, "") + "장" : "";
    return {"학교": sname, "학교장": head, "교장": sc.principal || "", "주소": sc.addr || "", "전화": sc.tel || "",
      "담임": sc.teacher || "", "교사": sc.teacher || "", "교과": sc.subject || "",
      "학급": clsLabel(c), "학년": c && c.grade ? String(c.grade) : "", "반": c && c.cls ? String(c.cls) : "",
      "인원": c ? c.students.length + "명" : "", "학생": st ? st.name : "", "번호": st ? String(st.no) : "",
      "오늘": fmt(now), "올해": String(y), "학년도": String(m >= 3 ? y : y - 1)};
  }
  var AUTO = ["학교", "학교장", "교장", "주소", "전화", "담임", "교사", "교과", "학급", "학년", "반", "인원", "학생", "번호", "오늘", "올해", "학년도"];

  /* ---------- 틀 읽기: 선생님이 써야 할 칸 ---------- */
  var TOK = /\{([^{}]{1,400})\}/g;
  function part(raw){
    var m = raw.match(/^(빈칸|글칸|날짜칸|날짜)\s*:\s*([^=|]*?)\s*(?:\|\s*([^=]*?)\s*)?(?:=\s*([\s\S]*?)\s*(?:\|\s*(길게|공문|숫자|짧게|요일없이))?)?$/);
    if(!m) return {kind: "auto", name: raw.trim()};
    var shape = m[3] || m[5] || "";
    if(m[1] === "날짜") return {kind: "date0", name: m[2], expr: m[2], shape: shape};
    return {kind: m[1], name: m[2] || "칸", def: m[4] == null ? "" : m[4], shape: shape};
  }
  function scan(){
    var out = [], seen = {};
    Array.prototype.forEach.call(arguments, function(t){
      String(t || "").replace(TOK, function(all, raw){
        var p = part(raw);
        if(p.kind === "auto" || p.kind === "date0" || seen[p.name]) return all;
        seen[p.name] = 1; out.push(p); return all;
      });
    });
    return out;
  }
  function needs(t){ var s = String(t || ""); return {cls: /\{(학급|학년|반|인원|명단)\}/.test(s), stu: /\{(학생|번호)\}/.test(s)}; }

  /* 틀 채우기. vals = {칸 이름: 쓴 값}. 비어 있는 칸은 [이름] 으로 남김 (blank 이면 손으로 쓰게 비워 둠 — 인쇄 서류) */
  function fill(t, vals, cx, blank){
    vals = vals || {}; cx = cx || ctx();
    var first = {};
    return String(t || "").replace(TOK, function(all, raw){
      var p = part(raw);
      if(p.kind === "auto"){ return Object.prototype.hasOwnProperty.call(cx, p.name) ? (cx[p.name] || "[" + p.name + "]") : all; }
      if(p.kind === "date0"){ var d0 = when(p.expr); return d0 ? fmt(d0, p.shape) : "[" + p.expr + "]"; }
      if(!first[p.name]) first[p.name] = p;
      var shape = p.shape || first[p.name].shape;
      var v = vals[p.name] != null ? vals[p.name] : (first[p.name].def || "");
      if(p.kind === "날짜칸"){ var d = when(v); return d ? fmt(d, shape) : (v || "[" + p.name + "]"); }
      return String(v).trim() ? v : blank ? "" : "[" + p.name + "]";
    });
  }

  /* ---------- 글 속 날짜 말 → 날짜 ("다음 주 월요일" → "11월 23일(월)") ----------
     상대 날짜는 바꾸고, "11월 27일"처럼 요일이 없는 날짜에는 요일을 붙이고, 요일이 틀리면 알려 줍니다. */
  var REL = /(다다음\s?주|다음\s?주|담주|이번\s?주|지난\s?주)\s?([월화수목금토일])요일|(내일|모레|글피)|(\d{1,2})\s?일\s?(뒤|후)|다음\s?(등교일|수업일)/g;
  var ABS = /(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s*\(([월화수목금토일])(?:요일)?\))?/g;
  function dates(text, keepWords){
    var hits = [], s = String(text || "");
    s = s.replace(REL, function(all){
      var d = when(all.replace(/\s+/g, " ")); if(!d) return all;
      var to = fmt(d); hits.push({from: all, to: to, warn: check(d)});
      return keepWords ? all + "(" + fmt(d, "요일없이") + ")" : to;
    });
    s = s.replace(ABS, function(all, y, mo, dd, w, off, str){
      if(/^\(/.test(str.slice(off + all.length).trim()) && !w) return all;
      var d = y ? valid(+y, +mo, +dd) : when(mo + "월 " + dd + "일"); if(!d) return all;
      var right = DOW[d.getDay()];
      if(w && w === right){ var wn0 = check(d); if(wn0 && hits.every(function(h){ return h.to !== fmt(d); })) hits.push({from: all, to: all, warn: wn0}); return all; }
      var to = (y ? y + "년 " : "") + (+mo) + "월 " + (+dd) + "일(" + right + ")";
      hits.push({from: all, to: to, warn: (w ? "요일 고침(" + w + "→" + right + ")" : "") + (check(d) ? (w ? " · " : "") + check(d) : "")});
      return to;
    });
    return {text: s, hits: hits};
  }

  /* ---------- 처음 들어 있는 틀 ----------
     kind: "text" 복사해서 쓰는 글(문자·쿨메신저) / "paper" 인쇄하는 문서
     paper 선택: reply(회신서) · sign("head" 학교장 / "to" 학교장 귀하 / "") · table("roster" 학급 명단 표) · cols(명단 표 칸) · form([[칸 이름, 값 틀]]) · each(학생마다 한 장) */
  var LETTER_HI = "학부모님, 안녕하십니까?\n늘 본교 교육활동에 관심을 가지고 협조해 주셔서 감사드립니다.\n\n";
  var TPL = [
    {id: "letter", ic: "📨", n: "가정통신문 (회신서)", kind: "paper", sign: "head", reply: true,
     help: "제목과 안내 내용만 쓰면 학교명·날짜·학교장·회신서(학년·반 칸)까지 채워집니다.",
     title: "{빈칸:제목=○○ 안내}",
     body: LETTER_HI + "{글칸:안내 내용=안내할 내용을 적어 주세요.}\n\n아래 회신서를 {날짜칸:회신 마감=다음 주 금요일}까지 담임 선생님께 제출해 주시기 바랍니다.\n가정에 늘 건강과 행복이 함께하시기를 바랍니다."},
    {id: "event", ic: "🏫", n: "행사 안내 가정통신문", kind: "paper", sign: "head",
     help: "행사 이름·날짜·시각만 쓰면 됩니다. 날짜는 \"다음 주 수요일\"처럼 써도 요일까지 계산합니다.",
     title: "{빈칸:행사 이름=학부모 공개수업} 안내",
     body: LETTER_HI + "본교에서는 아래와 같이 {빈칸:행사 이름}을(를) 실시하고자 하오니, 많은 관심과 협조를 부탁드립니다.\n\n- 아   래 -\n\n1. 일시: {날짜칸:날짜=다음 주 수요일|길게} {빈칸:시각=14:00~15:00}\n2. 장소: {빈칸:장소=각 학급 교실}\n3. 대상: {빈칸:대상=학부모님}\n4. 준비물: {빈칸:준비물=없음}\n\n자세한 사항은 {학급} 담임({담임}, {전화})에게 문의해 주시기 바랍니다."},
    {id: "sms", ic: "✉️", n: "학부모 안내 문자", kind: "text",
     help: "학급 전체 학부모님께 보내는 안내 문자입니다. 학교·학급·담임 이름이 들어갑니다.",
     body: "[{학교} {학급}] 안내\n안녕하세요. {학급} 담임 {담임}입니다.\n{글칸:안내 내용=안내할 내용을 적어 주세요.}\n{날짜칸:확인 날짜=내일}까지 확인 부탁드립니다. 감사합니다."},
    {id: "cool", ic: "📣", n: "쿨메신저 학급 안내", kind: "text",
     help: "학생·학부모에게 쿨메신저로 보낼 학급 안내입니다. 붙여 넣기 좋게 ■ 와 - 로 정리합니다.",
     body: "[{학급} 안내] {날짜:오늘|숫자}\n\n■ {빈칸:제목=준비물·제출물 안내}\n- {글칸:내용=}\n- 마감: {날짜칸:마감=다음 주 금요일}\n\n담임 {담임}"},
    {id: "list", ic: "📋", n: "학급 명단 표 (신청·확인)", kind: "paper", sign: "", table: "roster",
     help: "학급 명단이 번호 순서로 채워진 표입니다. 방과후 신청, 동의서 회수, 물품 확인 등에 씁니다.",
     title: "{학급} {빈칸:제목=방과후학교 신청} 명단",
     body: "마감: {날짜칸:마감=다음 주 금요일}   ·   담임 {담임}   ·   인원 {인원}",
     cols: "{빈칸:확인 칸=신청(○/×)}, 보호자 확인, 비고"},
    {id: "trip", ic: "🙋", n: "교외체험학습 신청서", kind: "paper", sign: "to", each: true,
     help: "학생을 고르면 학년·반·번호·이름이 채워집니다. [반 전체 인쇄]는 학생마다 한 장씩 이름을 넣어 뽑습니다.",
     title: "교외체험학습 신청서",
     form: [["학년·반·번호", "{학년}학년 {반}반 {번호}번"], ["학생 이름", "{학생}"], ["기간", "{날짜칸:시작일=다음 주 월요일|길게} ~ {날짜칸:끝나는 날=다음 주 화요일|길게}"], ["체험 형태", "□ 가족 동반 여행  □ 친인척 방문  □ 견학·체험  □ 기타(          )"], ["목적지", "{빈칸:목적지=}"], ["체험 목적·계획", "{글칸:계획=}"], ["보호자", "성명:              (서명)     관계:        연락처:"]],
     body: "위와 같이 교외체험학습을 신청합니다.\n\n{날짜:오늘|길게}"},
    {id: "agree", ic: "📝", n: "신청서·동의서 (학생별)", kind: "paper", sign: "to", each: true,
     help: "참가 신청·개인정보 동의 같은 학생별 서류입니다. 반 전체를 한 번에 이름을 넣어 인쇄할 수 있습니다.",
     title: "{빈칸:서류 이름=참가 신청서}",
     form: [["학년·반·번호", "{학년}학년 {반}반 {번호}번"], ["학생 이름", "{학생}"], ["내용", "{글칸:내용=}"], ["신청·동의", "□ 신청(동의)합니다     □ 신청(동의)하지 않습니다"], ["보호자", "성명:              (서명)     연락처:"]],
     body: "위 내용을 확인하고 {날짜칸:제출 마감=다음 주 금요일}까지 담임 선생님께 제출합니다.\n\n{날짜:오늘|길게}"},
    {id: "gong", ic: "🏛️", n: "공문 기안문", kind: "gong",
     help: "학교명·발신 명의·기안자·시행일·주소·전화가 자동으로 들어갑니다. 본문은 줄을 띄어 쓰면 1. 가. 1) 기호와 '끝.'을 붙입니다. 예산·품의 같은 판단은 넣지 않습니다.",
     title: "{빈칸:제목=}", to: "{빈칸:수신=내부결재}",
     body: "{글칸:본문=관련: \n  (근거 문서)\n○○을 다음과 같이 실시하고자 합니다.\n  일시: \n  장소: \n  대상: }"},
    {id: "absence", ic: "📄", n: "결석신고서", kind: "link", href: "../tardy/?tab=report",
     help: TN("tardy", "", "출결·결석계") + "에 적은 결석 기록으로 학생·기간·사유·담임·학교장이 이미 채워집니다."}
  ];

  /* ---------- 내 틀 ---------- */
  function mine(){ var o = TT.store.get(MINE, null) || {}; return Array.isArray(o.list) ? o.list : []; }
  function saveMine(list){ return TT.store.set(MINE, {v: 1, list: list.slice(0, 60), at: Date.now()}); }
  function all(){ return TPL.concat(mine().map(function(t){ return Object.assign({mine: true, sign: t.kind === "paper" ? "head" : ""}, t); })); }

  return {when: when, fmt: fmt, check: check, ymd: ymd, ctx: ctx, AUTO: AUTO, scan: scan, needs: needs, fill: fill, dates: dates,
    clsLabel: clsLabel, TPL: TPL, mine: mine, saveMine: saveMine, all: all, KEY: MINE};
})();
