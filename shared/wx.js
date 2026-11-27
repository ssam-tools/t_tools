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
  function cfg(){ var c = window.TT_SCHOOL_WX; return c && isFinite(c.lat) && isFinite(c.lon) ? c : null; }
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
    var c = cache(); if(!force && c && Date.now() - c.t < TTL) return;
    busy = true;
    var q = "latitude=" + C.lat + "&longitude=" + C.lon + "&timezone=Asia%2FSeoul";
    var F = fetch("https://api.open-meteo.com/v1/forecast?" + q + "&forecast_days=1&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min").then(function(r){ if(!r.ok) throw 0; return r.json(); });
    var A = fetch("https://air-quality-api.open-meteo.com/v1/air-quality?" + q + "&current=pm10,pm2_5").then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
    Promise.all([F, A]).then(function(x){
      var n = new Date(), day = n.getFullYear() + "-" + ("0" + (n.getMonth() + 1)).slice(-2) + "-" + ("0" + n.getDate()).slice(-2);
      try{ localStorage.setItem(KEY, JSON.stringify({t: Date.now(), day: day, f: x[0], a: x[1]})); }catch(e){}
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
  window.TT_WX = {data: data, load: load, hint: hint, chip: chip, html: html};
  if(data()) setTimeout(function(){ try{ document.dispatchEvent(new CustomEvent("tt-wx")); }catch(e){} }, 0);   // 저장된 날씨가 있으면 맨 위 줄에 바로
  if(cfg()) load(); else window.addEventListener("load", function(){ setTimeout(function(){ load(); }, 300); });   // g/sites.js(학교 위치)가 늦게 올 수 있어서
  setInterval(function(){ if(!document.hidden) load(); }, 10 * 60e3);
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) load(); });
})();
