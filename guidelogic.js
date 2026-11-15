/* 생활지도(결석계) 날짜·판정 규칙 — 생활지도 화면과 첫 화면 알림이 함께 씁니다. */
/* ======================= 날짜·판정 규칙 ======================= */
var Logic = (() => {
  const KD = ['일', '월', '화', '수', '목', '금', '토'];
  const cfg = { countApproved: false };
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); };
  const dow = s => parse(s).getDay();
  const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 86400000);
  const label = d => { const x = parse(d); return `${x.getMonth() + 1}/${x.getDate()}(${KD[x.getDay()]})`; };
  const isSchoolDay = (s, hol) => { const w = dow(s); return w !== 0 && w !== 6 && !(hol && hol[s]); };
  const step = (s, dir, hol) => { let x = addDays(s, dir), g = 0; while (!isSchoolDay(x, hol) && g++ < 400) x = addDays(x, dir); return x; };
  const prevSchoolDay = (s, hol) => step(s, -1, hol);
  const nextSchoolDay = (s, hol) => step(s, 1, hol);
  const weekStart = s => { const w = dow(s); return addDays(s, w === 0 ? -6 : 1 - w); };
  const weekDates = mon => [0, 1, 2, 3, 4].map(i => addDays(mon, i));
  /* 무단 지각만 기준에 넣음 (설정에서 인정 지각 포함 가능) */
  const isTardy = (T, hol, key, d) => { const r = T[d] && T[d][key]; return !!r && r.t === 'L' && (cfg.countApproved || !r.o) && isSchoolDay(d, hol); };
  function runAround(T, hol, key, d) {
    let start = d, end = d, len = 1, g = 0;
    while (g++ < 400) { const p = prevSchoolDay(start, hol); if (isTardy(T, hol, key, p)) { start = p; len++; } else break; }
    g = 0;
    while (g++ < 400) { const n = nextSchoolDay(end, hol); if (isTardy(T, hol, key, n)) { end = n; len++; } else break; }
    return { start, end, len };
  }
  function weekStatus(T, hol, key, mon, opt) {
    const weekN = (opt && opt.weekN) || 3, runN = (opt && opt.runN) || 2;
    const tardyDays = weekDates(mon).filter(d => isTardy(T, hol, key, d));
    const runDates = new Set(), runs = [], seen = new Set();
    tardyDays.forEach(d => { const r = runAround(T, hol, key, d); if (r.len >= runN) { runDates.add(d); if (!seen.has(r.start)) { seen.add(r.start); runs.push(r); } } });
    const alert = tardyDays.length >= weekN, caution = runs.length > 0;
    return { count: tardyDays.length, tardyDays, runDates, runs, alert, caution, level: alert ? 'alert' : caution ? 'caution' : 'ok' };
  }
  const allTardyDates = (T, hol, key) => Object.keys(T).filter(d => isTardy(T, hol, key, d)).sort();
  function allRuns(T, hol, key, runN) {
    const out = [], seen = new Set();
    allTardyDates(T, hol, key).forEach(d => { const r = runAround(T, hol, key, d); if (r.len >= (runN || 2) && !seen.has(r.start)) { seen.add(r.start); out.push(r); } });
    return out;
  }
  function describe(w) {
    const parts = [];
    if (w.alert) parts.push(`주 ${w.count}회 무단지각(${w.tardyDays.map(label).join(', ')})`);
    w.runs.forEach(r => parts.push(`${r.len}일 연속 무단지각(${label(r.start)}~${label(r.end)})`));
    return parts.join(' / ');
  }
  return { KD, cfg, fmt, parse, addDays, dow, diffDays, label, isSchoolDay, prevSchoolDay, nextSchoolDay, weekStart, weekDates, isTardy, runAround, weekStatus, allTardyDates, allRuns, describe };
})();
