/* 쌤 노트 · 개인정보 가리기 공통 (TTMask) — 녹음 4단계에서 문서 도우미(apps/ai)의 mask()를 여기로 옮겨 함께 씁니다.
   AI로 보내기 전에: 명렬표의 모든 학생 이름(두 글자 이상, 긴 이름부터) → [학생1] [학생2] …
                    휴대전화·일반 전화 → [전화번호] · 주민번호 꼴 → [주민번호] · 이메일 → [이메일]
                    "더 가릴 말"(쉼표로 구분, 학부모 이름·별명 등) → 이름처럼 [학생N]
   받은 답의 [학생N]은 unmask()로 원래 이름으로 되돌립니다(되돌린 글은 밖으로 보내지 않기).
   쓰는 법: var r = TTMask.mask(글, "더 가릴 말1, 말2");  r.text, r.map({"[학생1]":"홍길동"}), r.cnt({name, phone, etc})
            TTMask.unmask(답, r.map) · TTMask.info(r.cnt) → "🔒 가림: 이름 2 · 연락처 1" */
(function(){
  "use strict";
  function names(extra){
    var L = [];
    try{ TT.roster.classes().forEach(function(c){ c.students.forEach(function(s){ if(s.name && s.name.length >= 2 && L.indexOf(s.name) < 0) L.push(s.name); }); }); }catch(e){}
    String(extra || "").split(",").map(function(x){ return x.trim(); }).filter(function(x){ return x.length >= 2; }).forEach(function(x){ if(L.indexOf(x) < 0) L.push(x); });
    return L.sort(function(a, b){ return b.length - a.length; });
  }
  function mask(t, extra){
    t = String(t == null ? "" : t);
    var map = {}, n = 0, cnt = {name: 0, phone: 0, etc: 0};
    names(extra).forEach(function(nm){
      if(t.indexOf(nm) < 0) return; n++; var tag = "[학생" + n + "]"; map[tag] = nm; t = t.split(nm).join(tag); cnt.name++;
    });
    t = t.replace(/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/g, function(){ cnt.phone++; return "[전화번호]"; })
         .replace(/\b\d{2,3}-\d{3,4}-\d{4}\b/g, function(){ cnt.phone++; return "[전화번호]"; })
         .replace(/\b\d{6}-?[1-4]\d{6}\b/g, function(){ cnt.etc++; return "[주민번호]"; })
         .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, function(){ cnt.etc++; return "[이메일]"; });
    return {text: t, map: map, cnt: cnt};
  }
  function unmask(t, map){
    t = String(t == null ? "" : t);
    Object.keys(map || {}).sort(function(a, b){ return b.length - a.length; }).forEach(function(k){   // [학생12]를 [학생1]보다 먼저
      var nm = map[k], c = nm.charCodeAt(nm.length - 1), bat = c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 : 0;
      var P = {"은":"는","는":"는","이":"가","가":"가","을":"를","를":"를","과":"와","와":"와"}, Q = {"는":"은","가":"이","를":"을","와":"과"};
      t = t.split(k).map(function(part, i){                                 // 조사 맞추기: [학생1]은 → 이바다는
        if(!i) return part; var j = part.charAt(0), nx = part.charAt(1);
        if(!P[j] || /[가-힣]/.test(nx) && j === "이") return part;          // "이다"·"이번" 같은 말은 그대로
        var a = P[j]; return (bat ? (Q[a] || a) : a) + part.slice(1);
      }).join(nm);
    });
    return t;
  }
  function info(c){
    var tot = c.name + c.phone + c.etc;
    return tot ? "🔒 가림: 이름 " + c.name + " · 연락처 " + c.phone + (c.etc ? " · 기타 " + c.etc : "") : "🔒 가릴 개인정보 없음";
  }
  window.TTMask = {mask: mask, unmask: unmask, info: info, names: names};
})();
