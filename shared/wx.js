/* 쌤 노트 v2.12 · 날씨 (TT_WX) — 학교 위치(g/sites.js TT_SCHOOL_WX)의 날씨·미세먼지
   · Open-Meteo(가입·키 없음)에서 30분마다 한 번만 받아 이 기기에 잠깐 둠(sn_wx_v1, 동기화·백업 안 함). 보내는 것은 학교 좌표뿐.
   · 첫 화면 날짜 옆 "☀ 12°" (올리면/누르면 자세히 — shared/hidden.js "wx"), 쌤비 소품(우산·마스크·목도리)과 한마디(shared/sbhome.js). */
(function(){
  "use strict";
  if(!window.TT || window.TT_WX) return;   // v2.46 도구 화면 맨 위 줄에도 (모든 화면 같은 모양)
  var KEY = "sn_wx_v1", TTL = 30 * 60e3, OLD = 6 * 3600e3, busy = false;
  var CODES = [[0, "☀", "맑음"], [1, "🌤", "대체로 맑음"], [2, "⛅", "구름 조금"], [3, "☁", "흐림"], [48, "🌫", "안개"], [57, "🌦", "이슬비"], [67, "🌧", "비"], [77, "🌨", "눈"], [82, "🌧", "소나기"], [86, "🌨", "눈 소나기"], [99, "⛈", "뇌우"]];
  function code(c){ c = +c || 0; for(var i = 0; i < CODES.length; i++) if(c <= CODES[i][0]) return {ic: CODES[i][1], tx: CODES[i][2]}; return {ic: "☁", tx: "흐림"}; }
  function lv10(v){ return v == null ? null : v <= 30 ? ["좋음", 0] : v <= 80 ? ["보통", 1] : v <= 150 ? ["나쁨", 2] : ["매우 나쁨", 3]; }
  function lv25(v){ return v == null ? null : v <= 15 ? ["좋음", 0] : v <= 35 ? ["보통", 1] : v <= 75 ? ["나쁨", 2] : ["매우 나쁨", 3]; }
  /* v2.68 날씨 위치 = 우리 학교 주소의 시·군 (학교마다 저절로)
     · 순서: 학교 정보의 날씨 위치(wx) → 학교 주소(addr) → NEIS 학교 정보의 주소(급식 학교 코드로 한 번 받아 wx 로 저장) → 본교 기본값(g/sites.js)
     · 좌표는 시·군청 근처(날씨용 어림값) — 밖으로 보내는 것은 좌표뿐. 광역·특별시는 시 하나, 창원은 마산·진해를 나눔. */
  var PL = {"서울":[37.57,126.98],"부산":[35.18,129.08],"대구":[35.87,128.60],"인천":[37.46,126.71],"광주":[35.16,126.85],"대전":[36.35,127.38],"울산":[35.54,129.31],"세종":[36.48,127.29],
    "수원":[37.26,127.03],"성남":[37.42,127.13],"고양":[37.66,126.83],"용인":[37.24,127.18],"부천":[37.50,126.77],"안산":[37.32,126.83],"안양":[37.39,126.93],"남양주":[37.64,127.22],"화성":[37.20,126.83],"평택":[36.99,127.11],"의정부":[37.74,127.03],"시흥":[37.38,126.80],"파주":[37.76,126.78],"김포":[37.62,126.72],"광명":[37.48,126.86],"경기 광주":[37.43,127.26],"하남":[37.54,127.21],"군포":[37.36,126.94],"오산":[37.15,127.08],"이천":[37.27,127.44],"양주":[37.79,127.05],"구리":[37.59,127.13],"안성":[37.01,127.28],"포천":[37.89,127.20],"의왕":[37.34,126.97],"여주":[37.30,127.64],"동두천":[37.90,127.06],"과천":[37.43,126.99],"양평":[37.49,127.49],"가평":[37.83,127.51],"연천":[38.10,127.07],
    "춘천":[37.88,127.73],"원주":[37.34,127.92],"강릉":[37.75,128.88],"동해":[37.52,129.11],"태백":[37.16,128.99],"속초":[38.21,128.59],"삼척":[37.45,129.17],"홍천":[37.69,127.89],"횡성":[37.49,127.98],"영월":[37.18,128.46],"평창":[37.37,128.39],"정선":[37.38,128.66],"철원":[38.15,127.31],"화천":[38.11,127.71],"양구":[38.11,127.99],"인제":[38.07,128.17],"강원 고성":[38.38,128.47],"양양":[38.08,128.62],
    "청주":[36.64,127.49],"충주":[36.99,127.93],"제천":[37.13,128.19],"보은":[36.49,127.73],"옥천":[36.31,127.57],"영동":[36.18,127.78],"증평":[36.79,127.58],"진천":[36.86,127.44],"괴산":[36.81,127.79],"음성":[36.94,127.69],"단양":[36.98,128.37],
    "천안":[36.81,127.11],"공주":[36.45,127.12],"보령":[36.33,126.61],"아산":[36.79,127.00],"서산":[36.78,126.45],"논산":[36.19,127.10],"계룡":[36.27,127.25],"당진":[36.89,126.63],"금산":[36.11,127.49],"부여":[36.28,126.91],"서천":[36.08,126.69],"청양":[36.46,126.80],"홍성":[36.60,126.66],"예산":[36.68,126.85],"태안":[36.75,126.30],
    "전주":[35.82,127.15],"군산":[35.97,126.74],"익산":[35.95,126.96],"정읍":[35.57,126.86],"남원":[35.42,127.39],"김제":[35.80,126.88],"완주":[35.90,127.16],"진안":[35.79,127.42],"무주":[36.01,127.66],"장수":[35.65,127.52],"임실":[35.62,127.29],"순창":[35.37,127.14],"고창":[35.44,126.70],"부안":[35.73,126.73],
    "목포":[34.81,126.39],"여수":[34.76,127.66],"순천":[34.95,127.49],"나주":[35.02,126.71],"광양":[34.94,127.70],"담양":[35.32,126.99],"곡성":[35.28,127.29],"구례":[35.20,127.46],"고흥":[34.61,127.29],"보성":[34.77,127.08],"화순":[35.06,126.99],"장흥":[34.68,126.91],"강진":[34.64,126.77],"해남":[34.57,126.60],"영암":[34.80,126.70],"무안":[34.99,126.48],"함평":[35.07,126.52],"영광":[35.28,126.51],"장성":[35.30,126.78],"완도":[34.31,126.76],"진도":[34.49,126.26],"신안":[34.83,126.35],
    "포항":[36.02,129.34],"경주":[35.86,129.22],"김천":[36.14,128.11],"안동":[36.57,128.73],"구미":[36.12,128.34],"영주":[36.81,128.62],"영천":[35.97,128.94],"상주":[36.41,128.16],"문경":[36.59,128.19],"경산":[35.83,128.74],"의성":[36.35,128.70],"청송":[36.44,129.06],"영양":[36.67,129.11],"영덕":[36.42,129.37],"청도":[35.65,128.73],"고령":[35.73,128.26],"성주":[35.92,128.28],"칠곡":[35.99,128.40],"예천":[36.66,128.45],"봉화":[36.89,128.73],"울진":[36.99,129.40],"울릉":[37.48,130.91],
    "창원":[35.23,128.68],"마산합포구":[35.21,128.57,"마산"],"마산회원구":[35.22,128.58,"마산"],"진해구":[35.13,128.71,"진해"],"진주":[35.18,128.11],"통영":[34.85,128.43],"사천":[35.00,128.06],"김해":[35.23,128.89],"밀양":[35.50,128.75],"거제":[34.88,128.62],"양산":[35.34,129.04],"의령":[35.32,128.26],"함안":[35.27,128.41],"창녕":[35.54,128.49],"경남 고성":[34.97,128.32],"남해":[34.84,127.89],"하동":[35.07,127.75],"산청":[35.42,127.87],"함양":[35.52,127.73],"거창":[35.69,127.91],"합천":[35.57,128.17],
    "제주":[33.50,126.53],"서귀포":[33.25,126.56]};
  var PROV = [["서울","서울"],["부산","부산"],["대구","대구"],["인천","인천"],["광주광역","광주"],["대전","대전"],["울산","울산"],["세종","세종"],["경기","경기"],["강원","강원"],["충청북","충북"],["충북","충북"],["충청남","충남"],["충남","충남"],["전라북","전북"],["전북","전북"],["전라남","전남"],["전남","전남"],["경상북","경북"],["경북","경북"],["경상남","경남"],["경남","경남"],["제주","제주"]];
  var METRO = /^(서울|부산|대구|인천|광주|대전|울산|세종)$/;
  function place(addr){                                                 // "경상남도 창원시 마산합포구 …" → {name:"마산", lat, lon}
    var T = String(addr || "").replace(/[(),]/g, " ").trim().split(/\s+/); if(!T[0]) return null;
    var pv = ""; PROV.some(function(p){ if(T[0].indexOf(p[0]) === 0){ pv = p[1]; return true; } });
    function hit(k, nm){ var v = PL[k]; return v ? {name: v[2] || nm, lat: v[0], lon: v[1]} : null; }
    if(METRO.test(pv)) return hit(pv, pv);
    var i0 = pv ? 1 : 0, r = null;
    for(var i = i0; i < Math.min(T.length, i0 + 3) && !r; i++){
      var w = T[i]; if(!/[시군구]$/.test(w)) continue;
      r = hit(w, w) || (function(n){ return hit(pv + " " + n, n) || hit(n, n); })(w.replace(/[시군구]$/, ""));
    }
    if(r && i0 + 1 < T.length){ var g = hit(T[i0 + 1], T[i0 + 1]); if(g) r = g; }   // 구가 따로 있는 곳(마산·진해)
    return r;
  }
  function own(){                                                       // 우리 학교 위치 (없으면 null)
    try{
      var s = TT.school.load();
      var m = /^(.{1,12})\|(-?[\d.]+)\|(-?[\d.]+)$/.exec(s.wx || "");
      if(m) return {name: m[1], lat: +m[2], lon: +m[3]};
      var p = place(s.addr); if(p) return p;
    }catch(e){}
    return null;
  }
  function wxStr(p){ return p ? p.name + "|" + p.lat + "|" + p.lon : ""; }
  var TRY = "sn_wx_place_try";
  function fromNeis(){                                                  // 학교 정보에 위치가 없으면 NEIS 학교 주소로 한 번(하루 한 번까지) 찾아 저장
    try{
      var s = TT.school.load(); if(s.wx || !s.neisA || !s.neisS || !window.fetch) return;
      if(Date.now() - (+localStorage.getItem(TRY) || 0) < 864e5) return; localStorage.setItem(TRY, String(Date.now()));
      var q = "Type=json&pIndex=1&pSize=1&ATPT_OFCDC_SC_CODE=" + encodeURIComponent(s.neisA) + "&SD_SCHUL_CODE=" + encodeURIComponent(s.neisS) + (s.neisKey ? "&KEY=" + encodeURIComponent(s.neisKey) : "");
      fetch("https://open.neis.go.kr/hub/schoolInfo?" + q).then(function(r){ return r.json(); }).then(function(j){
        var a = j && j.schoolInfo, row = a && a.filter(function(x){ return x.row; })[0], x = row && row.row[0];
        var p = x && place(x.ORG_RDNMA || x.ORG_RDNDA || x.LCTN_SC_NM); if(!p) return;
        TT.school.save({wx: wxStr(p)}); try{ localStorage.removeItem(KEY); }catch(e){} load(true);
      }).catch(function(){});
    }catch(e){}
  }
  function cfg(){
    var o = own(); if(o && isFinite(o.lat) && isFinite(o.lon)) return o;
    var c = window.TT_SCHOOL_WX; if(c && c.home && !(window.TT_SCHOOL_HOME && TT_SCHOOL_HOME(true) === true)) return null;   // 본교 기본값은 본교(·견본)에서만
    return c && isFinite(c.lat) && isFinite(c.lon) ? c : null;
  }
  function cache(){ try{ return JSON.parse(localStorage.getItem(KEY)) || null; }catch(e){ return null; } }
  function data(){
    var c = cache(); if(!c || !c.f || Date.now() - c.t > OLD) return null;
    var f = c.f, a = c.a || {}, now = new Date(), h = now.getHours(), cur = f.current || {}, d = f.daily || {}, H = f.hourly || {};
    var rain = null, hours = [];
    (H.time || []).forEach(function(t, i){
      var hh = +String(t).slice(11, 13), p = (H.precipitation_probability || [])[i];
      if(String(t).slice(0, 10) !== c.day) return;
      if(hh >= h && hh <= 21) hours.push({h: hh, p: p, t: (H.temperature_2m || [])[i], c: (H.weather_code || [])[i]});
      if(rain == null && hh >= h && hh <= 18 && p >= 60) rain = hh;
    });
    var pm10 = a.current ? a.current.pm10 : null, pm25 = a.current ? a.current.pm2_5 : null, L10 = lv10(pm10), L25 = lv25(pm25);
    var dust = !L10 && !L25 ? null : (L25 && (!L10 || L25[1] >= L10[1])) ? L25 : L10;
    return {name: (cfg() || {}).name || "", t: c.t, temp: Math.round(cur.temperature_2m), now: code(cur.weather_code),
      max: d.temperature_2m_max ? Math.round(d.temperature_2m_max[0]) : null, min: d.temperature_2m_min ? Math.round(d.temperature_2m_min[0]) : null,
      rain: rain, raining: [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].indexOf(+cur.weather_code) >= 0, hours: hours,
      pm10: pm10 == null ? null : Math.round(pm10), pm25: pm25 == null ? null : Math.round(pm25), L10: L10, L25: L25, dust: dust};
  }
  function load(force){
    var C = cfg(); if(!C || busy || !window.fetch) return;
    var c = cache(), at = C.lat + "," + C.lon; if(!force && c && c.at === at && Date.now() - c.t < TTL) return;
    busy = true;
    var q = "latitude=" + C.lat + "&longitude=" + C.lon + "&timezone=Asia%2FSeoul";
    var F = fetch("https://api.open-meteo.com/v1/forecast?" + q + "&forecast_days=1&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min").then(function(r){ if(!r.ok) throw 0; return r.json(); });
    var A = fetch("https://air-quality-api.open-meteo.com/v1/air-quality?" + q + "&current=pm10,pm2_5").then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
    Promise.all([F, A]).then(function(x){
      var n = new Date(), day = n.getFullYear() + "-" + ("0" + (n.getMonth() + 1)).slice(-2) + "-" + ("0" + n.getDate()).slice(-2);
      try{ localStorage.setItem(KEY, JSON.stringify({t: Date.now(), day: day, at: at, f: x[0], a: x[1]})); }catch(e){}
      busy = false; try{ document.dispatchEvent(new CustomEvent("tt-wx")); }catch(e){}
    }, function(){ busy = false; });
  }
  /* 쌤비 소품 하나 + 한마디 (중요한 것 하나만): 비 > 미세먼지 > 추위 > 더위 */
  function hint(){
    var D = data(); if(!D) return null;
    if(D.raining) return {item: "umbrella", sub: "지금 비가 와요 · 우산 챙기세요"};
    if(D.rain != null) return {item: "umbrella", sub: (D.rain <= new Date().getHours() + 1 ? "곧" : hh(D.rain) + "쯤") + " 비 소식 · 우산 챙기세요"};
    if(D.dust && D.dust[1] >= 2) return {item: "mask", sub: "미세먼지 " + D.dust[0] + " · 환기는 짧게"};
    if(D.min != null && D.min <= 0) return {item: "scarf", sub: "오늘 최저 " + D.min + "° · 따뜻하게 입으세요"};
    if(D.max != null && D.max >= 31) return {item: "", sub: "오늘 최고 " + D.max + "° · 물 자주 드세요"};
    return null;
  }
  function hh(h){ return h === 12 ? "낮 12시" : h > 12 ? "오후 " + (h - 12) + "시" : "오전 " + h + "시"; }
  function chip(){ var D = data(); return D && isFinite(D.temp) ? D.now.ic + " " + D.temp + "°" : ""; }
  function html(){
    var D = data(); if(!D) return "<h4>🌤 날씨</h4><p class='m'>날씨를 받아 오는 중이에요.</p>";
    var h = "<h4>" + D.now.ic + " " + D.now.tx + " " + D.temp + "°<small>" + (D.name ? D.name + " · " : "") + new Date(D.t).getHours() + ":" + ("0" + new Date(D.t).getMinutes()).slice(-2) + " 기준</small></h4>";
    h += '<div class="r"><span>최저 / 최고</span><b>' + D.min + "° / " + D.max + "°</b></div>";
    h += '<div class="r"><span>비</span><b>' + (D.raining ? "지금 와요" : D.rain != null ? hh(D.rain) + "쯤 (" + Math.max.apply(null, D.hours.map(function(x){ return x.p || 0; })) + "%)" : "소식 없음") + "</b></div>";
    if(D.dust) h += '<div class="r"><span>미세먼지</span><b' + (D.dust[1] >= 2 ? ' class="on"' : "") + ">" + D.dust[0] + "</b></div>" + '<div class="m">PM10 ' + (D.pm10 == null ? "-" : D.pm10) + " · PM2.5 " + (D.pm25 == null ? "-" : D.pm25) + " ㎍/㎥</div>";
    var hs = D.hours.filter(function(x, i){ return i % 2 === 0; }).slice(0, 6);
    if(hs.length) h += "<hr><div class='r' style='gap:10px'>" + hs.map(function(x){ return "<span style='text-align:center'>" + (x.h > 12 ? x.h - 12 : x.h) + "시<br>" + code(x.c).ic + "<br><b>" + Math.round(x.t) + "°</b></span>"; }).join("") + "</div>";
    return h;
  }
  window.TT_WX = {data: data, load: load, hint: hint, chip: chip, html: html, place: place, str: wxStr, here: cfg};
  setTimeout(fromNeis, 1500);
  if(data()) setTimeout(function(){ try{ document.dispatchEvent(new CustomEvent("tt-wx")); }catch(e){} }, 0);   // 저장된 날씨가 있으면 맨 위 줄에 바로
  if(cfg()) load(); else window.addEventListener("load", function(){ setTimeout(function(){ load(); }, 300); });   // g/sites.js(학교 위치)가 늦게 올 수 있어서
  setInterval(function(){ if(!document.hidden) load(); }, 10 * 60e3);
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) load(); });
})();
