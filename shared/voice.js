/* 쌤 노트 · 말→글 공통 엔진 (TTVoice) — v1.2 녹음 1단계
   브라우저 음성 인식(SpeechRecognition, ko-KR)을 감싸서 여러 화면이 함께 씁니다(쌤비 말로 입력, 🎙️ 기록하기 등).

   쓰는 법
     var v = TTVoice.create({
       draftKey: "counsel",          // 넣으면 받아쓴 글을 2초마다 이 기기에 임시 저장(끊겨도 안 날아감). 빼면 저장 안 함
       continuous: true,             // true = 길게 받아쓰기(말 끊겨도 계속) / false = 한 마디만 듣고 끝
       wakeLock: true,               // 받아쓰는 동안 화면 꺼짐 방지
       onText:  function(full, interim){ ... },   // full = 확정된 글 전체, interim = 아직 듣는 중인 말
       onState: function(state){ ... },           // "listening" | "restarting" | "stopped"
       onError: function(code, msg){ ... },       // msg = 선생님께 보여 줄 한국어 안내
       onEnd:   function(full){ ... }             // 완전히 멈췄을 때(멈춤 단추·오류). abort()로 끊으면 부르지 않음
     });
     v.start();  v.stop();  v.abort();  v.text();  v.setText(s);  v.clear();  v.isOn();
     TTVoice.supported        → 이 브라우저에서 음성 인식이 되는지
     TTVoice.fallbackHTML()   → 안 될 때 보여 줄 "키보드 🎤(음성 입력) 쓰기" 안내
     TTVoice.noticeHTML()     → "음성이 구글 서버로 전송됩니다" 안내 한 줄
     TTVoice.draft(key) / TTVoice.clearDraft(key) → 임시 저장된 글 읽기·지우기

   동작
   · 말이 끊기거나 브라우저가 스스로 멈춰도(크롬은 조용하면 수십 초 뒤 끊음) 멈춤을 누르기 전까지 자동으로 다시 시작합니다.
     짧은 시간에 계속 실패하면(10초에 6번) 멈추고 알려 드립니다.
   · 안드로이드 크롬은 '계속 듣기'에서 같은 말이 겹쳐 나오는 문제가 있어, 한 마디씩 듣고 바로 다시 시작하는 방식으로 이어 받습니다.
   🔒 소리(녹음 원본)는 어디에도 저장하지 않습니다. 받아쓴 글만 이 기기(localStorage)에 임시 저장하고,
      3일이 지난 임시 저장 글은 읽을 때 지웁니다. 단, 음성 인식 자체는 브라우저 회사(구글 등) 서버를 거칩니다. */
(function(){
  "use strict";
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var ANDROID = /Android/i.test(navigator.userAgent || "");
  var DKEY = "ttvoice_draft_", DRAFT_DAYS = 3;

  var MSG = {
    "not-allowed": "마이크 사용을 허용해 주세요 (주소창 옆 🔒 → 마이크 허용).",
    "service-not-allowed": "마이크 사용을 허용해 주세요 (주소창 옆 🔒 → 마이크 허용).",
    "audio-capture": "마이크를 찾지 못했어요. 다른 앱이 마이크를 쓰고 있는지 확인해 주세요.",
    "network": "인터넷이 연결되어야 음성 인식이 돼요. 글 칸에 키보드로 적어 주세요.",
    "no-speech": "말소리가 들리지 않았어요. 다시 눌러 말씀해 주세요.",
    "language-not-supported": "이 브라우저에서 한국어 음성 인식이 되지 않아요.",
    "too-many": "음성 인식이 자꾸 끊겨서 멈췄어요. 다시 눌러 주세요.",
    "unsupported": "이 브라우저는 음성 인식을 지원하지 않아요.",
    "other": "잘 못 들었어요. 다시 눌러 주세요."
  };
  function msg(code){ return MSG[code] || MSG.other; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function join(a, b){ a = a || ""; b = (b || "").trim(); if(!b) return a; return a && !/\s$/.test(a) ? a + " " + b : a + b; }

  /* ── 임시 저장 ── */
  function readDraft(key){
    if(!key) return null;
    try{
      var d = JSON.parse(localStorage.getItem(DKEY + key) || "null");
      if(!d || typeof d.t !== "string") return null;
      if(Date.now() - (d.at || 0) > DRAFT_DAYS * 864e5){ localStorage.removeItem(DKEY + key); return null; }
      return d;
    }catch(e){ return null; }
  }
  function writeDraft(key, t){
    if(!key) return;
    try{ if(t && t.trim()) localStorage.setItem(DKEY + key, JSON.stringify({ t: t, at: Date.now() })); else localStorage.removeItem(DKEY + key); }catch(e){}
  }

  /* ── 화면 꺼짐 방지 ── */
  function WakeLock(){
    var lock = null, want = false;
    function get(){
      if(!want || lock || !navigator.wakeLock || document.visibilityState !== "visible") return;
      navigator.wakeLock.request("screen").then(function(l){
        if(!want){ try{ l.release(); }catch(e){} return; }
        lock = l; l.addEventListener("release", function(){ lock = null; });
      }).catch(function(){});
    }
    document.addEventListener("visibilitychange", get);       // 다른 앱 갔다 오면 다시 잡기
    return {
      on: function(){ want = true; get(); },
      off: function(){ want = false; if(lock){ try{ lock.release(); }catch(e){} lock = null; } }
    };
  }

  function create(o){
    o = o || {};
    var cont = o.continuous !== false;
    var key = o.draftKey || "";
    var wl = o.wakeLock !== false && cont ? WakeLock() : null;
    var base = "";            // 지난 세션들에서 확정된 글
    var sess = "";            // 이번 세션에서 확정된 글
    var interim = "";
    var rec = null, want = false, state = "stopped";
    var fails = [], timer = null, saveT = null, lastSaved = null, stopCode = "";

    var d = readDraft(key); if(d) base = d.t;

    function full(){ return join(base, sess); }
    function fire(){ if(o.onText) try{ o.onText(full(), interim); }catch(e){} }
    function setState(s){ if(state === s) return; state = s; if(o.onState) try{ o.onState(s); }catch(e){} }
    function save(){ var t = full(); if(t !== lastSaved){ writeDraft(key, t); lastSaved = t; } }
    function commit(){ base = full(); sess = ""; interim = ""; }

    function finish(code){            // 완전히 멈춤
      want = false; clearTimeout(timer); clearInterval(saveT); saveT = null;
      if(rec){ var r = rec; rec = null; r.onend = r.onresult = r.onerror = null; try{ r.abort(); }catch(e){} }
      commit(); if(key) save(); fire();
      if(wl) wl.off();
      setState("stopped");
      if(code && o.onError) try{ o.onError(code, msg(code)); }catch(e){}
      if(o.onEnd) try{ o.onEnd(full()); }catch(e){}
    }

    function open(){
      if(!want) return;
      var r;
      try{ r = new SR(); }catch(e){ finish("unsupported"); return; }
      rec = r;
      r.lang = o.lang || "ko-KR";
      r.interimResults = true;
      r.maxAlternatives = 1;
      r.continuous = cont && !ANDROID;
      stopCode = "";
      r.onresult = function(e){
        var f = "", it = "";
        for(var i = 0; i < e.results.length; i++){
          var tr = e.results[i][0].transcript;
          if(e.results[i].isFinal) f = join(f, tr); else it = join(it, tr);
        }
        sess = f; interim = it; fire();
      };
      r.onerror = function(e){ stopCode = e.error || "other"; };
      r.onend = function(){
        if(rec !== r) return;
        rec = null; commit(); fire();
        var c = stopCode;
        if(!want || !cont) { finish(c === "aborted" || (c === "no-speech" && cont) ? "" : c); return; }
        if(c === "not-allowed" || c === "service-not-allowed" || c === "audio-capture" || c === "language-not-supported"){ finish(c); return; }
        var now = Date.now();                                      // 짧은 시간 안에 실패가 이어지면 멈춤
        fails = fails.filter(function(t){ return now - t < 10000; });
        if(c && c !== "no-speech"){ fails.push(now); }
        if(fails.length >= 6){ finish(c === "network" ? "network" : "too-many"); return; }
        setState("restarting");
        timer = setTimeout(open, c && c !== "no-speech" ? 600 : 150);
      };
      try{ r.start(); setState("listening"); }
      catch(e){ rec = null; timer = setTimeout(open, 500); }
    }

    var api = {
      start: function(){
        if(!SR){ if(o.onError) try{ o.onError("unsupported", msg("unsupported")); }catch(e){} return false; }
        if(want) return true;
        want = true; fails = []; interim = "";
        if(wl) wl.on();
        if(key && !saveT) saveT = setInterval(save, 2000);
        open(); return true;
      },
      stop: function(){                                            // 들은 말까지 받고 멈춤
        if(!want && !rec) return;
        want = false; clearTimeout(timer);
        if(rec){ try{ rec.stop(); }catch(e){ finish(""); } } else finish("");
      },
      abort: function(){                                           // 바로 끊기(onEnd 안 부름)
        var cb = o.onEnd; o.onEnd = null; finish(""); o.onEnd = cb;
      },
      isOn: function(){ return want; },
      state: function(){ return state; },
      text: function(){ return full(); },
      setText: function(t){ base = String(t || ""); sess = ""; interim = ""; if(key) save(); },   // 선생님이 글을 고쳤을 때
      clear: function(){ base = ""; sess = ""; interim = ""; writeDraft(key, ""); lastSaved = ""; fire(); }
    };
    if(key) window.addEventListener("pagehide", function(){ if(want || full()) save(); });
    return api;
  }

  window.TTVoice = {
    supported: !!SR,
    create: create,
    message: msg,
    draft: function(key){ var d = readDraft(key); return d ? d.t : ""; },
    draftAt: function(key){ var d = readDraft(key); return d ? d.at : 0; },
    clearDraft: function(key){ writeDraft(key, ""); },
    noticeHTML: function(){ return '🔒 음성이 <b>구글 서버로 전송</b>되어 글로 바뀝니다. 소리는 저장하지 않아요. 학생은 <b>이름 대신 번호</b>로 말해 주세요.'; },
    fallbackHTML: function(){
      return '<span class="er">이 브라우저는 음성 인식을 지원하지 않아요.</span><br>'
        + '글 칸을 누른 뒤 <b>키보드의 🎤(음성 입력)</b> 단추로 말하면 똑같이 글로 바뀝니다.'
        + (/iPhone|iPad/i.test(navigator.userAgent || "") ? ' (아이폰: 키보드 아래 🎤)' : ' (갤럭시: 키보드 위 🎤 · PC: 크롬·엣지 권장)');
    },
    esc: esc
  };
})();
