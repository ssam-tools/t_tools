/* 학교 원본 파일 읽기 (TTSchoolFiles) — 학기초 세팅(apps/setup)이 씁니다.
   한글 .hwpx · 엑셀 .xlsx 를 이 기기 브라우저 안에서만 풀어 읽습니다(외부 라이브러리·서버 없음).
   TTSchoolFiles.read(file)  → {file, found:[...], data:{students, staff, phones, mainPhones, seats, timetable, calendar}}
     · students  학생 명렬 엑셀(반이 옆으로 늘어선 "1-1 | 1-2 …" 모양, 또는 학년·반·번호·이름 열)  [{g, c, n, name, note}]
     · staff     교직원 명렬 표(순 · 성명 · 직)                                                     [{name, role, cat}]
     · phones    내선번호 표(구분 · 성명 · 내선번호, 두 묶음 옆으로)                                  [{dept, role, name, ext}]
     · mainPhones 표 위 대표번호(행정실 055)…)                                                      [{label, number}]
     · seats     좌석배치도 칸 "이름(1-4) 271 / 과학" → 담임 반·교과                                 [{name, g, c, ext, subj}]
     · timetable 전체 교사 주간시간표(교사명 | 월 1~6 | 화 1~7 …, 칸 "303 / 과학")                    {teachers:[{name, hours, subj, slots}], periods}
     · calendar  학사일정 표("3/3(화) 시업식" · "3/31(화)∼4/2(목) …"), 요일로 학년도를 맞춤              {year, events:[{date, end, title, off}]}
   주소·계정·비밀번호처럼 표에 함께 적힌 다른 글은 읽어 두지 않습니다(이름·번호 칸만 골라 씀). */
(function (G) {
  'use strict';

  /* ---------- ZIP ---------- */
  async function inflateRaw(u8) {
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([u8]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function unzip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('압축 형식이 아닌 파일입니다');
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const entries = {};
    const td = new TextDecoder('utf-8');
    for (let k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
      const lo = dv.getUint32(p + 42, true);
      const name = td.decode(u8.subarray(p + 46, p + 46 + nl));
      entries[name] = { method, csize, lo };
      p += 46 + nl + el + cl;
    }
    return {
      names: Object.keys(entries),
      async text(name) {
        const e = entries[name]; if (!e) return null;
        const nl = dv.getUint16(e.lo + 26, true), el = dv.getUint16(e.lo + 28, true);
        const start = e.lo + 30 + nl + el, data = u8.subarray(start, start + e.csize);
        const out = e.method === 0 ? data : await inflateRaw(data);
        return td.decode(out);
      }
    };
  }

  /* ---------- 작은 XML 파서 ---------- */
  const ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
  function decodeEnt(s) {
    return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENT[e] !== undefined ? ENT[e] : m;
    });
  }
  function parseXML(s) {
    const root = { tag: '#root', a: {}, ch: [] }, st = [root];
    const re = /<!\[CDATA\[([\s\S]*?)\]\]>|<!--[\s\S]*?-->|<[!?][^>]*>|<(\/?)([^\s>\/]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>|([^<]+)/g;
    let m;
    while ((m = re.exec(s))) {
      const top = st[st.length - 1];
      if (m[1] !== undefined) { top.ch.push({ text: m[1] }); continue; }
      if (m[6] !== undefined) { top.ch.push({ text: decodeEnt(m[6]) }); continue; }
      if (!m[3]) continue; // comment / declaration
      const tag = m[3].includes(':') ? m[3].split(':').pop() : m[3];
      if (m[2] === '/') { if (st.length > 1) st.pop(); continue; }
      const a = {};
      m[4].replace(/([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g, (x, k, v, v1, v2) => {
        a[k.includes(':') ? k.split(':').pop() : k] = decodeEnt(v1 !== undefined ? v1 : v2); return '';
      });
      const el = { tag, a, ch: [] };
      top.ch.push(el);
      if (m[5] === '/') continue;
      st.push(el);
    }
    return root;
  }
  function kids(el, tag) { return el.ch.filter(c => c.tag === tag); }
  function find(el, tag) { for (const c of el.ch) { if (c.tag === tag) return c; } return null; }

  /* ---------- HWPX ---------- */
  function tText(t) {
    let s = '';
    for (const c of t.ch) {
      if (c.text !== undefined) s += c.text;
      else if (c.tag === 'lineBreak') s += '\n';
      else if (c.tag === 'tab' || c.tag === 'fwSpace' || c.tag === 'nbSpace') s += ' ';
    }
    return s;
  }
  function pText(p) {
    let s = '';
    (function go(el) {
      for (const c of el.ch) {
        if (!c.tag || c.tag === 'tbl') continue;
        if (c.tag === 't') s += tText(c); else go(c);
      }
    })(p);
    return s;
  }
  function parasOf(el, out) {
    for (const c of el.ch) {
      if (!c.tag || c.tag === 'tbl') continue;
      if (c.tag === 'p') { out.push(pText(c)); parasOf(c, out); } else parasOf(c, out);
    }
    return out;
  }
  function makeTable(tbl) {
    const cells = [];
    for (const tr of kids(tbl, 'tr')) for (const tc of kids(tr, 'tc')) {
      const ad = find(tc, 'cellAddr'), sp = find(tc, 'cellSpan');
      if (!ad) continue;
      const text = parasOf(tc, []).map(x => x.replace(/[  ]+/g, ' ').trim()).filter(Boolean).join('\n');
      cells.push({ r: +ad.a.rowAddr, c: +ad.a.colAddr, rs: sp ? +sp.a.rowSpan || 1 : 1, cs: sp ? +sp.a.colSpan || 1 : 1, text });
    }
    const rows = Math.max(+tbl.a.rowCnt || 0, ...cells.map(x => x.r + x.rs));
    const cols = Math.max(+tbl.a.colCnt || 0, ...cells.map(x => x.c + x.cs));
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(null));
    for (const x of cells) for (let r = x.r; r < x.r + x.rs && r < rows; r++) for (let c = x.c; c < x.c + x.cs && c < cols; c++) grid[r][c] = x;
    return { rows, cols, cells, at: (r, c) => (grid[r] && grid[r][c]) || null, tx: (r, c) => { const x = grid[r] && grid[r][c]; return x ? x.text : ''; } };
  }
  async function readHwpx(zip) {
    const secs = zip.names.filter(n => /^Contents\/section\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
    const tables = [], paras = [];
    for (const n of secs) {
      const root = parseXML(await zip.text(n));
      (function walk(el, inT) {
        for (const c of el.ch) {
          if (!c.tag) continue;
          if (c.tag === 'tbl') { tables.push(makeTable(c)); walk(c, true); }
          else if (c.tag === 'p' && !inT) { paras.push(pText(c)); walk(c, inT); }
          else walk(c, inT);
        }
      })(root, false);
    }
    return { tables, paras };
  }

  /* ---------- XLSX ---------- */
  function colIdx(ref) { const m = ref.match(/^([A-Z]+)(\d+)$/); let n = 0; for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return [+m[2] - 1, n - 1]; }
  function allText(el) { let s = ''; (function g(e) { for (const c of e.ch) { if (c.text !== undefined) s += c.text; else if (c.tag !== 'rPh') g(c); } })(el); return s; }
  async function readXlsx(zip) {
    const ss = [];
    const sst = await zip.text('xl/sharedStrings.xml');
    if (sst) { const r = parseXML(sst); (function g(e) { for (const c of e.ch) { if (c.tag === 'si') ss.push(allText(c)); else if (c.tag) g(c); } })(r); }
    const wb = parseXML(await zip.text('xl/workbook.xml') || '<x/>');
    const rels = parseXML(await zip.text('xl/_rels/workbook.xml.rels') || '<x/>');
    const relMap = {};
    (function g(e) { for (const c of e.ch) { if (c.tag === 'Relationship') relMap[c.a.Id] = c.a.Target; else if (c.tag) g(c); } })(rels);
    const sheets = [];
    const list = [];
    (function g(e) { for (const c of e.ch) { if (c.tag === 'sheet') list.push(c); else if (c.tag) g(c); } })(wb);
    for (const sh of list) {
      let target = relMap[sh.a.id] || '';
      target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
      const xml = await zip.text('xl/' + target);
      if (!xml) continue;
      const root = parseXML(xml), grid = [];
      (function g(e) {
        for (const c of e.ch) {
          if (c.tag === 'c' && c.a.r) {
            const [r, k] = colIdx(c.a.r); let v = null;
            const vEl = find(c, 'v');
            if (c.a.t === 's') v = vEl ? ss[+allText(vEl)] : null;
            else if (c.a.t === 'inlineStr') { const is = find(c, 'is'); v = is ? allText(is) : null; }
            else if (vEl) { const raw = allText(vEl); v = c.a.t === 'str' || c.a.t === 'e' ? raw : (raw !== '' && !isNaN(+raw) ? +raw : raw); }
            if (v !== null && v !== '') { (grid[r] = grid[r] || [])[k] = v; }
          } else if (c.tag) g(c);
        }
      })(root);
      sheets.push({ name: sh.a.name, grid });
    }
    return sheets;
  }

  /* ---------- 공통 ---------- */
  const NS = s => String(s == null ? '' : s).replace(/\s+/g, '');
  const isName = s => /^[가-힣]{2,5}$/.test(NS(s));
  const DAYS = ['월', '화', '수', '목', '금', '토'];

  /* ---------- 학생 명렬 ---------- */
  function parseStudents(sheets) {
    const out = [];
    for (const { grid } of sheets) {
      const g = (r, c) => (grid[r] ? grid[r][c] : undefined);
      const isNum = v => typeof v === 'number' ? v >= 1 && v <= 99 && v % 1 === 0 : /^\d{1,2}$/.test(NS(v));
      const isStu = v => typeof v === 'string' && /[가-힣A-Za-z]/.test(v) && !/^=/.test(v) && !/[학년반현원계]$/.test(NS(v)) || (typeof v === 'string' && /^[가-힣]{2,5}$/.test(NS(v)));
      // 1) 가로형: "1-1" 머리글
      const heads = [];
      grid.forEach((row, r) => row && row.forEach((v, c) => { const m = typeof v === 'string' && NS(v).match(/^(\d)-(\d{1,2})$/); if (m) heads.push({ r, c, g: +m[1], k: +m[2] }); }));
      if (heads.length) {
        const used = new Set();
        const plans = heads.map(h => {
          let num = h.c, name = h.c + 1;
          if (!(isNum(g(h.r + 1, h.c)) && isStu(g(h.r + 1, h.c + 1)))) { num = h.c - 1; name = h.c; }
          used.add(num); used.add(name);
          return { h, num, name };
        });
        for (const { h, num, name } of plans) {
          const note = used.has(name + 1) ? -1 : name + 1;
          for (let r = h.r + 1; r < h.r + 70; r++) {
            const n = g(r, num);
            if (!isNum(n)) break;
            const nm = g(r, name);
            if (!isStu(nm)) continue;
            const nt = note >= 0 ? g(r, note) : '';
            out.push({ g: h.g, c: h.k, n: +n, name: String(nm).trim(), note: nt && typeof nt === 'string' ? nt.trim() : '' });
          }
        }
        continue;
      }
      // 2) 세로형: 학년/반/번호/이름 열
      for (let r = 0; r < Math.min(grid.length, 15); r++) {
        const row = grid[r] || []; const idx = {};
        row.forEach((v, c) => { const t = NS(v); if (t === '학년') idx.g = c; else if (t === '반') idx.c = c; else if (t === '번호' || t === '번') idx.n = c; else if (t === '이름' || t === '성명' || t === '학생명') idx.name = c; else if (t === '비고') idx.note = c; });
        if (idx.c !== undefined && idx.n !== undefined && idx.name !== undefined) {
          for (let k = r + 1; k < grid.length; k++) {
            const R = grid[k] || [];
            if (!isNum(R[idx.n]) || !isStu(R[idx.name])) continue;
            const cl = String(R[idx.c]).match(/(\d+)\D*(\d+)?/);
            let gg = idx.g !== undefined ? parseInt(R[idx.g]) : NaN, cc = cl ? +cl[1] : NaN;
            if (cl && cl[2] && isNaN(gg)) { gg = +cl[1]; cc = +cl[2]; }
            out.push({ g: gg || 0, c: cc, n: +R[idx.n], name: String(R[idx.name]).trim(), note: idx.note !== undefined && R[idx.note] ? String(R[idx.note]) : '' });
          }
          break;
        }
      }
    }
    out.sort((a, b) => a.g - b.g || a.c - b.c || a.n - b.n);
    return out;
  }

  /* ---------- 시간표 ---------- */
  function parseTimetable(t) {
    let hr = -1;
    for (let r = 0; r < Math.min(t.rows, 6) && hr < 0; r++) {
      let n = 0; for (let c = 0; c < t.cols; c++) { const x = t.at(r, c); if (x && x.c === c && DAYS.includes(NS(x.text))) n++; }
      if (n >= 4) hr = r;
    }
    if (hr < 0) return null;
    const map = {};
    for (let c = 0; c < t.cols; c++) {
      const d = NS(t.tx(hr, c)), p = parseInt(NS(t.tx(hr + 1, c)));
      if (DAYS.includes(d) && p >= 1 && p <= 9) map[c] = { d: DAYS.indexOf(d), p };
    }
    if (Object.keys(map).length < 15) return null;
    const teachers = [];
    for (let r = hr + 2; r < t.rows; r++) {
      const head = t.tx(r, 0); if (!head) continue;
      const lines = head.split('\n').map(s => s.trim()).filter(Boolean);
      const nm = (lines[0] || '').replace(/^\(\d+\)\s*/, '').replace(/\s/g, '');
      if (!nm) continue;
      const hm = head.match(/\((\d+)\)\s*$/);
      const slots = [];
      for (const c in map) {
        const x = t.at(r, +c); if (!x || x.c !== +c || !x.text) continue;
        const ls = x.text.split('\n').map(s => s.trim()).filter(Boolean);
        let g = 0, k = 0, cm = (ls[0] || '').match(/^(\d)(\d{2})$/) || (ls[0] || '').match(/^(\d)\s*-\s*(\d{1,2})$/);
        if (cm) { g = +cm[1]; k = +cm[2]; }
        slots.push({ d: map[c].d, p: map[c].p, g, c: k, subj: cm ? (ls[1] || '') : ls.join(' '), raw: cm ? '' : x.text });
      }
      const cnt = {}; slots.forEach(s => { if (s.subj && !/^(창체|창동|스동|자율|동아리)$/.test(s.subj)) cnt[s.subj] = (cnt[s.subj] || 0) + 1; });
      const subj = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || '';
      teachers.push({ name: nm, hours: hm ? +hm[1] : slots.length, subj, slots });
    }
    const periods = DAYS.slice(0, 5).map((_, d) => Math.max(0, ...Object.values(map).filter(v => v.d === d).map(v => v.p)));
    return teachers.length ? { teachers, periods } : null;
  }

  /* ---------- 학사일정 ---------- */
  const DTOK = /(\d{1,2})\s*[\/.]\s*(\d{1,2})\s*\(?\s*([월화수목금토일])\s*\)(?:\s*[~∼～〜\-]\s*(?:(\d{1,2})\s*[\/.]\s*)?(\d{1,2})\s*\(\s*([월화수목금토일])\s*\))?/g;
  const WD = '일월화수목금토';
  const OFF = /(공휴일|휴업일|대체|어린이날|노동절|근로자의\s*날|현충일|광복절|추석|설날|설\s*연휴|성탄|기독탄신일|개천절|한글날|부처님|석가|삼일절|3\.1절|신정|방학식?$|선거일)/;
  function parseCalendar(texts, forceYear) {
    const raw = [];
    for (const text of texts) {
      if (!text) continue; DTOK.lastIndex = 0; if (!DTOK.test(text)) continue;
      let cur = null;
      for (const line of text.split('\n')) {
        const toks = []; let m; DTOK.lastIndex = 0;
        while ((m = DTOK.exec(line))) toks.push({ m, i: m.index, j: DTOK.lastIndex });
        if (!toks.length) { if (cur) cur.title += ' ' + line.trim(); continue; }
        if (cur && toks[0].i > 0) cur.title += ' ' + line.slice(0, toks[0].i).trim();
        toks.forEach((tk, k) => {
          const m2 = tk.m;
          cur = { m: +m2[1], d: +m2[2], w: m2[3], m2: m2[5] ? +(m2[4] || m2[1]) : 0, d2: m2[5] ? +m2[5] : 0, w2: m2[6] || '', title: line.slice(tk.j, k + 1 < toks.length ? toks[k + 1].i : undefined).trim() };
          raw.push(cur);
        });
      }
    }
    if (!raw.length) return null;
    const yOf = (Y, m) => (m <= 2 ? Y + 1 : Y);
    let year = forceYear;
    if (!year) {
      const now = new Date().getFullYear(); let best = -1;
      for (let Y = now - 2; Y <= now + 1; Y++) {
        const s = raw.reduce((a, e) => a + (WD[new Date(yOf(Y, e.m), e.m - 1, e.d).getDay()] === e.w ? 1 : 0), 0);
        if (s > best) { best = s; year = Y; }
      }
    }
    const iso = (m, d) => { const y = yOf(year, m); return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); };
    const seen = new Set(), events = [];
    for (const e of raw) {
      const title = e.title.replace(/^[,，·\s]+|[,，\s]+$/g, '').replace(/\s{2,}/g, ' ');
      if (!title) continue;
      const ev = { date: iso(e.m, e.d), end: e.d2 ? iso(e.m2, e.d2) : '', title, off: OFF.test(title) };
      const key = ev.date + ev.end + ev.title;
      if (!seen.has(key)) { seen.add(key); events.push(ev); }
    }
    events.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    return { year, events };
  }

  /* ---------- 내선번호 ---------- */
  function parsePhone(t) {
    let hr = -1;
    for (let r = 0; r < Math.min(t.rows, 6) && hr < 0; r++) for (let c = 0; c < t.cols; c++) if (NS(t.tx(r, c)) === '내선번호') { hr = r; break; }
    if (hr < 0) return null;
    const groups = [];
    let gstart = 0;
    for (let c = 0; c < t.cols; c++) {
      const x = t.at(hr, c); if (!x || x.c !== c) continue;
      const h = NS(x.text);
      if (h === '구분' || h === '부서') gstart = c;
      if (h === '내선번호') { groups.push({ g: gstart, e: c }); gstart = c + 1; }
    }
    const list = [];
    for (const { g, e } of groups) {
      for (let r = hr + 1; r < t.rows; r++) {
        const dc = t.at(r, g);
        if (dc && (dc.c < g || dc.c + dc.cs - 1 > g)) continue; // 그룹을 넘는 칸(주소 등)은 건너뜀
        const ec = t.at(r, e);
        if (!ec || ec.c !== e) { /* 합쳐진 번호: 위 칸과 같은 번호 */ }
        const ext = ec ? NS(ec.text) : '';
        const mids = [];
        for (let c = g + 1; c < e; c++) { const x = t.at(r, c); if (x && (c === g + 1 || x.c === c)) { if (x.c < g + 1 || x.c + x.cs - 1 >= e + 1) { mids.length = 0; break; } if (!mids.includes(x)) mids.push(x); } }
        let role = '', name = '';
        if (mids.length === 1) name = NS(mids[0].text); else if (mids.length >= 2) { role = mids[0].text.trim(); name = NS(mids[mids.length - 1].text); }
        if (!/^\d{2,4}$/.test(ext) && !name) continue;
        if (!/^\d{2,4}$/.test(ext) && !isName(name)) continue;
        list.push({ dept: dc ? dc.text.replace(/\s+/g, '') : '', role, name: isName(name) ? name : '', ext: /^\d{2,4}$/.test(ext) ? ext : '' });
      }
    }
    return list.length ? list : null;
  }
  function parseMainPhones(paras) {
    const s = paras.join('\n');
    const re = /(행정실장실|행정실|교장실|교무실|교감실|보건실|급식소|급식실|상담실|위클래스|FAX|팩스|전산실|도서실)\s*:?\s*(0\d{1,2})\s*\)?\s*-?\s*(\d{3,4})\s*-\s*(\d{4})(\s*~\s*\d{1,4})?/g;
    const out = []; let m;
    while ((m = re.exec(s))) out.push({ label: m[1] === 'FAX' ? '팩스' : m[1], number: m[2] + '-' + m[3] + '-' + m[4] + (m[5] ? m[5].replace(/\s/g, '') : '') });
    return out;
  }
  /* 좌석배치도: "이름(1-4) 271\n과학" */
  function parseSeats(t) {
    const out = [];
    for (const x of t.cells) {
      const m = x.text.match(/^\s*([가-힣]{2,4})\s*(?:\(\s*(\d)\s*-\s*(\d{1,2})\s*\))?\s+(\d{3})\s*(?:\n\s*([가-힣]{1,4}))?\s*$/);
      if (m) out.push({ name: m[1], g: m[2] ? +m[2] : 0, c: m[3] ? +m[3] : 0, ext: m[4], subj: m[5] || '' });
    }
    return out.length >= 5 ? out : null;
  }

  /* ---------- 교직원 명렬 ---------- */
  function parseStaff(t) {
    let hr = -1;
    for (let r = 0; r < Math.min(t.rows, 6) && hr < 0; r++) {
      let n = 0; for (let c = 0; c < t.cols; c++) { const x = t.at(r, c); if (x && x.c === c && /^(성명|이름)$/.test(NS(x.text))) n++; }
      if (n) hr = r;
    }
    if (hr < 0) return null;
    const nameCols = [];
    for (let c = 0; c < t.cols; c++) { const x = t.at(hr, c); if (x && x.c === c && /^(성명|이름)$/.test(NS(x.text))) nameCols.push(c); }
    const out = [];
    nameCols.forEach((n, gi) => {
      const lo = gi === 0 ? 0 : nameCols[gi - 1] + 2, hi = gi + 1 < nameCols.length ? nameCols[gi + 1] - 2 : t.cols - 1;
      let cat = '교원';
      for (let r = hr + 1; r < t.rows; r++) {
        const sc = t.at(r, Math.max(lo, n - 1));
        if (sc && sc.cs >= 2 && !/^\d+$/.test(NS(sc.text)) && NS(sc.text)) { cat = NS(sc.text); continue; }
        const nm = NS(t.tx(r, n));
        if (!isName(nm)) continue;
        const rc = n + 1 <= hi ? t.at(r, n + 1) : null;
        let role = rc && rc.c === n + 1 ? rc.text.replace(/\s+/g, ' ').trim() : '';
        const seq = NS(t.tx(r, n - 1));
        if (!role && /^(교장|교감)$/.test(seq)) role = seq;
        out.push({ name: nm, role, cat: cat === '행정실' ? '행정실' : (/^(교장|교감)$/.test(seq) ? '교원' : cat) });
      }
    });
    return out.length ? out : null;
  }

  /* ---------- 파일 하나 읽기 ---------- */
  async function parseFile(name, buf, opts) {
    opts = opts || {};
    const res = { file: name, found: [], data: {} };
    const lower = name.toLowerCase();
    if (lower.endsWith('.hwp')) throw new Error('예전 한글(.hwp) 형식입니다. 한글에서 [다른 이름으로 저장] → 파일 형식 "HWPX"로 저장한 뒤 넣어 주세요');
    if (lower.endsWith('.xls')) throw new Error('예전 엑셀(.xls) 형식입니다. 엑셀에서 .xlsx로 저장한 뒤 넣어 주세요');
    const zip = unzip(buf);
    if (lower.endsWith('.xlsx') || zip.names.includes('xl/workbook.xml')) {
      const st = parseStudents(await readXlsx(zip));
      if (st.length) { res.data.students = st; res.found.push('students'); }
      return res;
    }
    const { tables, paras } = await readHwpx(zip);
    const calTexts = [];
    for (const t of tables) {
      const tt = parseTimetable(t);
      if (tt) { res.data.timetable = tt; res.found.push('timetable'); continue; }
      const ph = parsePhone(t);
      if (ph) { res.data.phones = (res.data.phones || []).concat(ph); if (!res.found.includes('phones')) res.found.push('phones'); continue; }
      const sf = parseStaff(t);
      if (sf) { res.data.staff = (res.data.staff || []).concat(sf); if (!res.found.includes('staff')) res.found.push('staff'); continue; }
      const se = parseSeats(t);
      if (se) { res.data.seats = (res.data.seats || []).concat(se); if (!res.found.includes('seats')) res.found.push('seats'); }
      for (const x of t.cells) if (x.text) calTexts.push(x.text);
    }
    if (res.data.phones) { const mp = parseMainPhones(paras.concat(tables.flatMap(t => t.cells.map(x => x.text)))); if (mp.length) res.data.mainPhones = mp; }
    if (!res.found.length || res.found.every(f => f === 'seats')) {
      const cal = parseCalendar(calTexts.concat(paras), opts.year);
      if (cal && cal.events.length >= 5) { res.data.calendar = cal; res.found.push('calendar'); }
    }
    return res;
  }

  /* ---------- 쌤 노트 형식으로 바꾸기 ---------- */
  /* 교직원: 명렬 · 내선 · 시간표 교과 · 좌석배치도 담임을 이름으로 합침. old(이미 있는 목록)는 그대로 두고 새 값으로 채움.
     → [{name, dept, pos, subj, tel}]  (pos 에 "3-3 담임"을 붙여 두면 선생님 불러오기에서 담임 반을 알아서 고름) */
  function staffList(p, old) {
    const map = new Map(), order = [];
    const get = n => { if (!map.has(n)) { map.set(n, { name: n, dept: '', pos: '', subj: '', tel: '', home: '' }); order.push(n); } return map.get(n); };
    (old || []).forEach(o => { if (!o || !o.name) return; const x = get(o.name); x.dept = o.dept || ''; x.subj = o.subj || ''; x.tel = o.tel || ''; const m = /(\d)-(\d{1,2})\s*담임/.exec(o.pos || ''); x.home = m ? m[1] + '-' + m[2] : ''; x.pos = String(o.pos || '').replace(/\s*·?\s*\d-\d{1,2}\s*담임/, '').trim(); });
    (p.staff || []).forEach(s => { const x = get(s.name); if (s.role) x.pos = s.role; if (!x.dept && s.cat === '행정실') x.dept = '행정실'; });
    (p.phones || []).forEach(q => { if (!q.name) return; const x = get(q.name); if (q.ext) x.tel = q.ext; if (q.dept) x.dept = q.dept; if (!x.pos && q.role) x.pos = q.role; });
    ((p.timetable && p.timetable.teachers) || []).forEach(t => { if (!isName(t.name) || /^(강사|미정|공석)$/.test(t.name)) return; const x = get(t.name); if (t.subj) x.subj = t.subj; });
    (p.seats || []).forEach(s => { const x = map.get(s.name); if (!x) return; if (s.g && s.c) x.home = s.g + '-' + s.c; if (!x.subj && s.subj && s.subj.length <= 3) x.subj = s.subj; if (!x.tel) x.tel = s.ext; });
    return order.map(n => { const x = map.get(n); return { name: x.name, dept: x.dept.slice(0, 20), pos: (x.pos + (x.home ? (x.pos ? ' · ' : '') + x.home + ' 담임' : '')).slice(0, 30), subj: x.subj.slice(0, 12), tel: x.tel }; });
  }
  /* 학생 명렬 → 명렬표 학급 [{name, grade, cls, students:[{no, name}]}] */
  function rosterClasses(students) {
    const by = {};
    (students || []).forEach(s => { const k = s.g + '-' + s.c; (by[k] = by[k] || { name: s.g + '학년 ' + s.c + '반', grade: s.g, cls: s.c, students: [] }).students.push({ no: s.n, name: s.name.slice(0, 20) }); });
    return Object.keys(by).map(k => by[k]);
  }
  /* 전체 교사 시간표 → {teachers:[{name, subj, slots:{"요일(1~5)-교시":{code, cls, subj}}}], maxP} (컴시간 엑셀과 같은 모양) */
  function allTT(tt) {
    let maxP = 0;
    const teachers = (tt.teachers || []).map(t => {
      const slots = {};
      t.slots.forEach(s => { const code = s.g ? String(s.g * 100 + s.c) : String(s.subj || '').split(' ')[0]; if (!code) return; slots[(s.d + 1) + '-' + s.p] = { code: code.slice(0, 12), cls: s.g ? s.g * 100 + s.c : null, subj: String(s.g ? s.subj : '').slice(0, 12) || t.subj.slice(0, 12) }; maxP = Math.max(maxP, s.p); });
      return { name: t.name, subj: t.subj.slice(0, 12), slots };
    });
    return { teachers, maxP };
  }
  /* 학사일정 → TTCal 목록 [{d, to, t, k}] (k: evt·off·exam — TTCal.kind 가 있으면 그것으로) */
  function calList(cal, kind) {
    return (cal.events || []).map(e => ({ d: e.date, to: e.end || '', t: e.title.slice(0, 60), k: kind ? kind(e.title) : (e.off ? 'off' : 'evt') }));
  }
  async function read(file, opts) { return parseFile(file.name, await file.arrayBuffer(), opts); }

  G.TTSchoolFiles = { read, parseFile, staffList, rosterClasses, allTT, calList, supported: typeof DecompressionStream !== 'undefined' };
})(typeof window !== 'undefined' ? window : globalThis);
