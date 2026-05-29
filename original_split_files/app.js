/* Site mantigi: routing, lesson/problem/lab render, simulator UI, progress kaydi */

const Store = {
  KEY: 'avr-study-progress-v1',
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch (e) { return {}; }
  },
  save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },
  markSolved(pid) {
    const d = this.get();
    d.solved = d.solved || {};
    d.solved[pid] = Date.now();
    this.save(d);
  },
  isSolved(pid) {
    const d = this.get();
    return !!(d.solved && d.solved[pid]);
  },
  solvedCount() {
    const d = this.get();
    return d.solved ? Object.keys(d.solved).length : 0;
  },
  reset() { localStorage.removeItem(this.KEY); }
};

// ===== Routing =====
const routes = {
  'home': renderHome,
  'simulator': renderSimulator,
  'practice': renderPractice,
  'labs': renderLabs,
  'progress': renderProgress,
  'about': renderAbout
};

function navigate(route) {
  const main = document.getElementById('main');
  main.scrollTo({ top: 0 });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.route === route));
  // Mobile: close drawer
  document.getElementById('sidebar').classList.remove('open');

  // Lesson routes are 'lesson:<id>'
  if (route.startsWith('lesson:')) {
    renderLesson(route.slice(7));
    return;
  }
  const fn = routes[route] || renderHome;
  fn();
}

window.addEventListener('hashchange', () => navigate(getRoute()));
function getRoute() {
  return location.hash.replace(/^#/, '') || 'home';
}
function go(route) { location.hash = '#' + route; }

// ===== Sidebar =====
function renderSidebar() {
  const lessonsHTML = LESSONS.map(l =>
    `<div class="nav-item" data-route="lesson:${l.id}" onclick="go('lesson:${l.id}')">
       <span class="ico">${l.icon}</span> ${l.title.replace(/^\d+\.\s*/, '')}
     </div>`
  ).join('');

  const solved = Store.solvedCount();

  return `
    <div class="brand">
      <div class="brand-logo">AV</div>
      <div class="brand-text">
        <div class="t1">AVR Akademi</div>
        <div class="t2">Pratik Stüdyo</div>
      </div>
    </div>

    <div class="nav-item" data-route="home" onclick="go('home')">
      <span class="ico">🏠</span> Anasayfa
    </div>
    <div class="nav-item" data-route="simulator" onclick="go('simulator')">
      <span class="ico">🧪</span> Simulator
    </div>
    <div class="nav-item" data-route="practice" onclick="go('practice')">
      <span class="ico">🎯</span> Pratik
      <span class="badge">${solved}/${PROBLEMS.length}</span>
    </div>
    <div class="nav-item" data-route="labs" onclick="go('labs')">
      <span class="ico">🔧</span> Lab kodlari
    </div>

    <div class="nav-section">Dersler</div>
    ${lessonsHTML}

    <div class="nav-section">Diger</div>
    <div class="nav-item" data-route="progress" onclick="go('progress')">
      <span class="ico">📊</span> Ilerleme
    </div>
    <div class="nav-item" data-route="about" onclick="go('about')">
      <span class="ico">ℹ️</span> Hakkinda
    </div>
  `;
}

// ===== Basit assembly syntax highlight =====
const KW = new Set([
  'LDI','MOV','ADD','ADC','SUB','SUBI','SBC','SBCI','AND','ANDI','OR','ORI','EOR',
  'INC','DEC','NEG','COM','CLR','SER','TST','LSL','LSR','ASR','ROL','ROR','SWAP',
  'CP','CPI','CPC','BREQ','BRNE','BRCS','BRCC','BRLO','BRSH','BRMI','BRPL','BRLT','BRGE',
  'BRVS','BRVC','BRTS','BRTC','BRIS','BRIC','JMP','RJMP','IJMP','CALL','RCALL','RET','RETI',
  'PUSH','POP','LDS','STS','IN','OUT','LD','ST','LDD','STD','SBI','CBI','SBIC','SBIS',
  'SBRC','SBRS','NOP','SEI','CLI','SEC','CLC','SEZ','CLZ','SBR','CBR'
]);
function highlightAsm(src) {
  return src.split('\n').map(line => {
    const cIdx = line.indexOf(';');
    let code = line, comment = '';
    if (cIdx >= 0) { code = line.slice(0, cIdx); comment = line.slice(cIdx); }
    code = escapeHtml(code).replace(/\b([A-Z]{2,5})\b/gi, (m) => {
      if (KW.has(m.toUpperCase())) return `<span class="kw">${m}</span>`;
      return m;
    }).replace(/\b(R\d{1,2}|X[LH]?|Y[LH]?|Z[LH]?)\b/g, '<span class="reg">$1</span>')
      .replace(/(\$[0-9A-Fa-f]+|0x[0-9A-Fa-f]+|0b[01]+|\b\d+\b)/g, '<span class="num">$1</span>')
      .replace(/^(\s*)([A-Za-z_]\w*):/g, '$1<span class="lbl">$2:</span>');
    return code + (comment ? `<span class="com">${escapeHtml(comment)}</span>` : '');
  }).join('\n');
}
function escapeHtml(s) {
  return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
}

// ===== Home =====
function renderHome() {
  const solved = Store.solvedCount();
  const total = PROBLEMS.length;
  const pct = Math.round((solved / total) * 100);

  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>

    <div class="hero">
      <h1>AVR Assembly'i <span class="teal">simulatorde calistirarak</span> ogren</h1>
      <p>Bu site, gomulu sistemler dersine cesaretle hazirlanman icin tasarlandi. 8 dersi okuyabilir, kendine ait kodu <span class="gold">gercek calisan bir AVR simulatorunde</span> deneyebilir, ve 40+ pratik problemde kendini test edebilirsin.</p>
      <div class="hero-stats">
        <div class="stat"><div class="n">${LESSONS.length}</div><div class="l">Ders</div></div>
        <div class="stat"><div class="n">${PROBLEMS.length}</div><div class="l">Pratik Problem</div></div>
        <div class="stat"><div class="n">${LAB_CODES.length}</div><div class="l">Lab Kodu</div></div>
        <div class="stat"><div class="n">${pct}%</div><div class="l">Senin ilerlemen</div></div>
      </div>
    </div>

    <div class="card">
      <h2>Nasil baslayacaksin?</h2>
      <p style="color:var(--text-dim);margin:6px 0 14px">3 yoldan biri:</p>
      <div class="tile-grid">
        <div class="tile" onclick="go('lesson:basics')">
          <div class="ico">📝</div>
          <div class="t">1. Sifirdan ogren</div>
          <div class="d">Derslere bastan basla, her birinde calisan ornekler var.</div>
        </div>
        <div class="tile" onclick="go('practice')">
          <div class="ico">🎯</div>
          <div class="t">2. Pratikle ogren</div>
          <div class="d">42 problem, kolay-orta-zor. Her birinde 'Kontrol Et' butonu var.</div>
        </div>
        <div class="tile" onclick="go('simulator')">
          <div class="ico">🧪</div>
          <div class="t">3. Simulatorde dene</div>
          <div class="d">Bos editor, kendi kodunu yaz, register/SREG/I-O degisimini gor.</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🚀 Simulator neyi destekliyor?</h2>
      <div class="tile-grid">
        <div class="tile">
          <div class="ico">📦</div>
          <div class="t">40+ komut</div>
          <div class="d">LDI, MOV, ADD/ADC, SUB/SBC, AND/OR/EOR, shift, rotate, compare, branch, jump, call, push/pop, LD/ST indirect, SBI/CBI/SBIC/SBIS...</div>
        </div>
        <div class="tile">
          <div class="ico">🚦</div>
          <div class="t">SREG bayraklari</div>
          <div class="d">C, Z, N, V, S, H, T, I — hepsi her komut sonrasi guncellenir, ekranda anlik gorursun.</div>
        </div>
        <div class="tile">
          <div class="ico">💡</div>
          <div class="t">PORT/DDR/PIN gorsel LED</div>
          <div class="d">PORTB'nin pinleri 8 LED olarak gosterilir; SBI/CBI ile yanip soner.</div>
        </div>
        <div class="tile">
          <div class="ico">📚</div>
          <div class="t">Stack ve bellek</div>
          <div class="d">2 KB SRAM, PUSH/POP ile stack, X/Y/Z indirect adresleme tam destekli.</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📚 Lab kodlari</h2>
      <p style="color:var(--text-dim)">${LAB_CODES.length} adet Arduino C lab kodu — her birinde aciklama ve sana ekstra meydan okuma var.</p>
      <button class="btn teal" onclick="go('labs')">Lab kodlarina git →</button>
    </div>
  `;
}

// ===== Lesson page =====
function renderLesson(id) {
  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return renderHome();

  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
    <div class="page-head">
      <h1>${lesson.icon} ${lesson.title}</h1>
      <div class="sub">Once oku, sonra her ornegi tikla — simulatorde adim-adim calistirabilirsin.</div>
    </div>

    <div class="lesson-intro">${escapeHtml(lesson.intro).replace(/\n/g, '<br>')}</div>

    ${lesson.examples.map((ex, i) => `
      <div class="card">
        <div class="example-block">
          <div class="title">⚡ Ornek ${i+1}: ${escapeHtml(ex.title)}</div>
          <div class="editor-wrap">
            <div class="editor-header">
              <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
              <div class="lbl">ornek-${id}-${i+1}.asm</div>
            </div>
            <pre class="code code-asm">${highlightAsm(ex.code)}</pre>
          </div>
          <div class="toolbar">
            <button class="btn primary" onclick="openInSimulator(${JSON.stringify(ex.code).replace(/"/g, '&quot;')})">
              🧪 Simulatorde Ac
            </button>
            <button class="btn ghost" onclick="copyText(${JSON.stringify(ex.code).replace(/"/g, '&quot;')})">
              📋 Kopyala
            </button>
          </div>
        </div>
      </div>
    `).join('')}

    <div class="card">
      <h3>Ne yapmaliyim simdi?</h3>
      <p>Bu dersi anladigini hissedince <strong>Pratik</strong> sekmesine gec; bu konuyla ilgili problemleri filtreleyip cozebilirsin.</p>
      <button class="btn teal" onclick="goPracticeFiltered('${lesson.id}')">Bu konunun pratiklerine git →</button>
    </div>
  `;
}

function goPracticeFiltered(topic) {
  sessionStorage.setItem('practice-topic', topic);
  go('practice');
}

// ===== Simulator page =====
const DEFAULT_SIM_CODE = `; AVR Assembly simulatorune hosgeldin
; Asagidaki kodu degistir, sonra "Calistir" tikla

LDI R20, 10
LDI R21, 20
ADD R20, R21      ; R20 = 30
LDI R22, 5
SUB R20, R22      ; R20 = 25

; PORTB'yi yak: en kolay LED ornegi
LDI R16, 0xFF
OUT DDRB, R16
LDI R16, 0xA5     ; 10100101
OUT PORTB, R16
`;

let simState = null;

function renderSimulator(initialCode) {
  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
    <div class="page-head">
      <h1>🧪 AVR Assembly Simulator</h1>
      <div class="sub">Kodunu yaz, <kbd>Calistir</kbd> ile baslat, <kbd>Adim</kbd> ile tek tek ilerle. Register'lar, SREG ve PORTB LED'leri canli guncellenir.</div>
    </div>

    <div class="card">
      <div class="editor-wrap">
        <div class="editor-header">
          <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
          <div class="lbl">kod.asm</div>
        </div>
        <textarea id="sim-code" class="code-editor" spellcheck="false">${escapeHtml(initialCode || DEFAULT_SIM_CODE)}</textarea>
      </div>
      <div class="toolbar">
        <button class="btn primary" onclick="simRun()">▶ Calistir (hepsi)</button>
        <button class="btn teal" onclick="simStep()">→ Adim (1 komut)</button>
        <button class="btn gold" onclick="simReset()">↻ Resetle</button>
        <button class="btn ghost" onclick="simLoad()">📥 Yukle (programi yeniden parse)</button>
      </div>

      <div class="sim-row">
        <div>
          <div class="sim-panel">
            <h4>SREG bayraklari</h4>
            <div id="sim-flags" class="flags"></div>
          </div>
          <div class="sim-panel" style="margin-top:10px">
            <h4>PORTB LED gorseli (Pin 7 ← → Pin 0)</h4>
            <div id="sim-leds" class="led-bar"></div>
            <div style="font-family:Fira Code,monospace;font-size:11.5px;color:var(--text-dim)" id="sim-port-vals"></div>
          </div>
          <div class="sim-panel" style="margin-top:10px">
            <h4>Stack pointer & sayim</h4>
            <div id="sim-misc" style="font-family:Fira Code,monospace;font-size:12px;color:var(--text)"></div>
          </div>
        </div>
        <div>
          <div class="sim-panel">
            <h4>Register'lar R0–R31</h4>
            <div id="sim-regs" class="regs-grid"></div>
          </div>
        </div>
      </div>

      <div class="sim-panel" style="margin-top:10px">
        <h4>Bellek (0x100..0x14F)</h4>
        <div id="sim-mem" class="mem-box"></div>
      </div>

      <div id="sim-console" class="console">Hazir. "Yukle"ye sonra "Calistir"a bas.</div>
    </div>
  `;
  simInit();
}

function openInSimulator(code) {
  navigate('simulator');
  setTimeout(() => {
    document.getElementById('sim-code').value = code;
    simLoad();
    toast('Kod simulatore yuklendi', 'success');
  }, 50);
}

function simInit() {
  simState = { sim: new AVRSim(), prevRegs: new Uint8Array(32) };
  // Render skeleton
  simReset();
}

function simLoad() {
  const code = document.getElementById('sim-code').value;
  simState.sim = new AVRSim();
  try {
    simState.sim.load(code);
    simState.prevRegs = new Uint8Array(32);
    simRender('info', `Yuklendi: ${simState.sim.program.length} komut.`);
  } catch (e) {
    simRender('err', e.message);
  }
}

function simReset() {
  if (!simState) return;
  simState.sim.reset();
  // Re-parse current code so labels are kept
  const code = document.getElementById('sim-code').value;
  try {
    simState.sim.load(code);
  } catch (e) {
    simRender('err', e.message);
    return;
  }
  simState.prevRegs = new Uint8Array(32);
  simRender('info', 'Resetlendi. PC = 0.');
}

function simStep() {
  if (!simState || !simState.sim.program) {
    simLoad();
    if (!simState.sim.program) return;
  }
  const prev = new Uint8Array(simState.sim.regs);
  const ok = simState.sim.step();
  simState.prevRegs = prev;
  if (!ok && simState.sim.error) {
    simRender('err', '⚠ ' + simState.sim.error);
  } else if (simState.sim.halted) {
    simRender('ok', `✓ Program tamamlandi (toplam ${simState.sim.stepsExecuted} adim, ${simState.sim.cycles} cevrim).`);
  } else {
    simRender('info', `Adim ${simState.sim.stepsExecuted} — PC = ${simState.sim.pc} / ${simState.sim.program.length}`);
  }
}

function simRun() {
  if (!simState || !simState.sim.program) {
    simLoad();
    if (!simState.sim.program) return;
  }
  const prev = new Uint8Array(simState.sim.regs);
  simState.sim.run();
  simState.prevRegs = prev;
  if (simState.sim.error) {
    simRender('err', '⚠ ' + simState.sim.error);
  } else {
    simRender('ok', `✓ Tamamlandi. Adim: ${simState.sim.stepsExecuted}, Cevrim: ${simState.sim.cycles}`);
  }
}

function simRender(kind, msg) {
  const sim = simState.sim;
  // Registers
  const regsEl = document.getElementById('sim-regs');
  regsEl.innerHTML = '';
  for (let i = 0; i < 32; i++) {
    const v = sim.regs[i];
    const changed = simState.prevRegs && simState.prevRegs[i] !== v;
    regsEl.insertAdjacentHTML('beforeend',
      `<div class="reg ${changed ? 'changed' : ''}">
        <span class="n">R${i}</span>
        <span class="v">${hex2(v)}</span>
      </div>`);
  }
  // Flags
  const flagsEl = document.getElementById('sim-flags');
  flagsEl.innerHTML = ['I','T','H','S','V','N','Z','C'].map(n => {
    const idx = { C:0,Z:1,N:2,V:3,S:4,H:5,T:6,I:7 }[n];
    const val = (sim.sreg >> idx) & 1;
    return `<div class="flag ${val ? 'set' : 'unset'}"><span class="n">${n}</span><span class="v">${val}</span></div>`;
  }).join('');
  // LEDs (PORTB pin 7 .. pin 0 visually)
  const portB = sim.io[IO_ADDR.PORTB];
  const ddrB = sim.io[IO_ADDR.DDRB];
  const ledsEl = document.getElementById('sim-leds');
  ledsEl.innerHTML = '';
  for (let i = 7; i >= 0; i--) {
    const isOutput = (ddrB >> i) & 1;
    const isOn = isOutput && ((portB >> i) & 1);
    ledsEl.insertAdjacentHTML('beforeend',
      `<div class="led ${isOn ? 'on' : ''}" title="PB${i}">${i}</div>`);
  }
  document.getElementById('sim-port-vals').textContent =
    `DDRB=0x${hex2(ddrB)}  PORTB=0x${hex2(portB)}  PINB=0x${hex2(sim.io[IO_ADDR.PINB])}` +
    `   |   DDRC=0x${hex2(sim.io[IO_ADDR.DDRC])}  PORTC=0x${hex2(sim.io[IO_ADDR.PORTC])}` +
    `   |   DDRD=0x${hex2(sim.io[IO_ADDR.DDRD])}  PORTD=0x${hex2(sim.io[IO_ADDR.PORTD])}`;
  // SP and counters
  document.getElementById('sim-misc').innerHTML =
    `SP = 0x${hex4(sim.SP)}   |   PC = ${sim.pc}   |   Adim = ${sim.stepsExecuted}   |   Cevrim = ${sim.cycles}`;
  // Memory dump 0x100..0x14F
  const memEl = document.getElementById('sim-mem');
  let mem = '';
  for (let row = 0; row < 5; row++) {
    const base = 0x100 + row * 16;
    let line = `<span style="color:var(--text-mute)">0x${hex4(base)}</span>  `;
    for (let i = 0; i < 16; i++) {
      const v = sim.readMem(base + i);
      const color = v !== 0 ? 'var(--teal)' : 'var(--text-mute)';
      line += `<span style="color:${color}">${hex2(v)}</span> `;
      if (i === 7) line += ' ';
    }
    mem += line + '\n';
  }
  memEl.innerHTML = mem;

  // Console
  if (msg) {
    const c = document.getElementById('sim-console');
    const cls = kind === 'err' ? 'err' : (kind === 'ok' ? 'ok' : 'info');
    const time = new Date().toLocaleTimeString();
    c.innerHTML += `\n<span class="${cls}">[${time}] ${escapeHtml(msg)}</span>`;
    c.scrollTop = c.scrollHeight;
  }
}

function hex2(n) { return ('0' + (n & 0xFF).toString(16)).slice(-2).toUpperCase(); }
function hex4(n) { return ('000' + (n & 0xFFFF).toString(16)).slice(-4).toUpperCase(); }

// ===== Practice page =====
function renderPractice() {
  const topics = [...new Set(PROBLEMS.map(p => p.topic))];
  const levels = ['Kolay', 'Orta', 'Zor'];

  const activeTopic = sessionStorage.getItem('practice-topic') || 'all';
  const activeLevel = sessionStorage.getItem('practice-level') || 'all';

  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
    <div class="page-head">
      <h1>🎯 Pratik Problemler</h1>
      <div class="sub">${PROBLEMS.length} problem. Her birinin altinda <strong>Kontrol Et</strong> butonu var — kodun dogru cikti uretirse otomatik onaylanir.</div>
    </div>

    <div class="card">
      <h3>Filtreler</h3>
      <div class="filter-bar" id="topic-filter">
        <div class="chip ${activeTopic==='all'?'active':''}" data-v="all">Tum konular</div>
        ${topics.map(t => `<div class="chip ${activeTopic===t?'active':''}" data-v="${t}">${topicLabel(t)}</div>`).join('')}
      </div>
      <div class="filter-bar" id="level-filter">
        <div class="chip ${activeLevel==='all'?'active':''}" data-v="all">Tum seviyeler</div>
        ${levels.map(l => `<div class="chip ${activeLevel===l?'active':''}" data-v="${l}">${l}</div>`).join('')}
      </div>
    </div>

    <div id="problems-list"></div>
  `;

  // Wire filter chips
  document.querySelectorAll('#topic-filter .chip').forEach(c => {
    c.onclick = () => {
      sessionStorage.setItem('practice-topic', c.dataset.v);
      renderPractice();
    };
  });
  document.querySelectorAll('#level-filter .chip').forEach(c => {
    c.onclick = () => {
      sessionStorage.setItem('practice-level', c.dataset.v);
      renderPractice();
    };
  });

  renderProblemsList(activeTopic, activeLevel);
}

function topicLabel(t) {
  return ({
    basics: 'Temel komutlar',
    flags: 'Bayrak & Dallanma',
    stack: 'Stack & Fonksiyon',
    io: 'I/O portlari',
    arith: 'Aritmetik & Mantik',
    addressing: 'Adresleme modlari',
    timer: 'Timer',
    interrupt: 'Interrupt'
  })[t] || t;
}

function renderProblemsList(topic, level) {
  const list = PROBLEMS.filter(p =>
    (topic === 'all' || p.topic === topic) &&
    (level === 'all' || p.level === level)
  );
  const html = list.map((p, idx) => problemCard(p, idx)).join('') ||
    `<div class="card"><em style="color:var(--text-mute)">Bu filtreyle problem bulunamadi.</em></div>`;
  document.getElementById('problems-list').innerHTML = html;

  // Wire collapse toggles
  list.forEach((p) => {
    const root = document.getElementById('p-' + p.id);
    if (!root) return;
    root.querySelectorAll('.collapse-header').forEach(h => {
      h.onclick = () => h.parentElement.classList.toggle('open');
    });
  });
}

function problemCard(p, idx) {
  const solved = Store.isSolved(p.id);
  const code = p.starter || '';
  return `
    <div class="problem" id="p-${p.id}">
      <div class="problem-head">
        <span class="level ${p.level.toLowerCase()}">${p.level}</span>
        <span class="topic">${topicLabel(p.topic)}</span>
        <span class="title">${escapeHtml(p.title)}</span>
        <span class="status ${solved?'done':''}">${solved ? '✓ Cozuldu' : ''}</span>
      </div>
      <div class="desc">${escapeHtml(p.desc)}</div>

      <div class="editor-wrap">
        <div class="editor-header">
          <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
          <div class="lbl">${p.id}.asm</div>
        </div>
        <textarea class="code-editor" id="ed-${p.id}" spellcheck="false" style="min-height:160px">${escapeHtml(code)}</textarea>
      </div>

      <div class="toolbar">
        <button class="btn primary" onclick="checkProblem('${p.id}')">✓ Kontrol Et</button>
        <button class="btn teal" onclick="runOnly('${p.id}')">▶ Sadece Calistir</button>
        <button class="btn ghost" onclick="openProblemInSim('${p.id}')">🧪 Buyuk Simulatorde Ac</button>
      </div>

      <div class="collapse">
        <div class="collapse-header">
          <span class="chev">▶</span> Cozumu goster
        </div>
        <div class="collapse-content">
          <div class="editor-wrap" style="margin-top:8px">
            <div class="editor-header">
              <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
              <div class="lbl">cozum.asm</div>
            </div>
            <pre class="code code-asm">${highlightAsm(p.solution)}</pre>
          </div>
          <div class="toolbar" style="margin-top:8px">
            <button class="btn ghost" onclick="loadSolution('${p.id}')">📋 Cozumu editor'e kopyala</button>
          </div>
        </div>
      </div>

      <div class="console" id="out-${p.id}" style="display:none"></div>
    </div>
  `;
}

function checkProblem(pid) {
  const p = PROBLEMS.find(x => x.id === pid);
  const code = document.getElementById('ed-' + pid).value;
  const out = document.getElementById('out-' + pid);
  out.style.display = 'block';
  const sim = new AVRSim();
  try {
    sim.load(code);
    sim.run();
    if (sim.error) {
      out.innerHTML = `<span class="err">⚠ Calisma hatasi: ${escapeHtml(sim.error)}</span>`;
      toast('Hata var, konsola bak', 'error');
      return;
    }
    const res = p.check(sim);
    if (res.ok) {
      out.innerHTML = `<span class="ok">✓ Dogru! Sonuc beklendigi gibi.</span>\n` +
        `<span class="info">Adim: ${sim.stepsExecuted}, Cevrim: ${sim.cycles}</span>`;
      Store.markSolved(pid);
      // Update status chip
      const status = document.querySelector(`#p-${pid} .status`);
      status.classList.add('done');
      status.textContent = '✓ Cozuldu';
      // Update sidebar badge
      document.getElementById('sidebar').innerHTML = renderSidebar();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.route === getRoute()));
      toast(`✓ ${p.title} cozuldu! Toplam: ${Store.solvedCount()}/${PROBLEMS.length}`, 'success');
    } else {
      out.innerHTML = `<span class="err">✗ Yanlis: ${escapeHtml(res.msg || 'Sonuc beklendigi gibi degil')}</span>`;
      toast('Henuz dogru degil, tekrar dene', 'error');
    }
  } catch (e) {
    out.innerHTML = `<span class="err">⚠ Hata: ${escapeHtml(e.message)}</span>`;
  }
}

function runOnly(pid) {
  const code = document.getElementById('ed-' + pid).value;
  const out = document.getElementById('out-' + pid);
  out.style.display = 'block';
  const sim = new AVRSim();
  try {
    sim.load(code);
    sim.run();
    if (sim.error) {
      out.innerHTML = `<span class="err">⚠ ${escapeHtml(sim.error)}</span>`;
      return;
    }
    let s = `<span class="ok">✓ Calisma tamam.</span>\n`;
    s += `<span class="info">Adim: ${sim.stepsExecuted}, Cevrim: ${sim.cycles}</span>\n`;
    s += `R16=${hex2(sim.regs[16])} R17=${hex2(sim.regs[17])} R18=${hex2(sim.regs[18])} R19=${hex2(sim.regs[19])}\n`;
    s += `R20=${hex2(sim.regs[20])} R21=${hex2(sim.regs[21])} R22=${hex2(sim.regs[22])} R23=${hex2(sim.regs[23])}\n`;
    s += `R24=${hex2(sim.regs[24])} R25=${hex2(sim.regs[25])} R26=${hex2(sim.regs[26])} R27=${hex2(sim.regs[27])}\n`;
    s += `PORTB=0x${hex2(sim.io[IO_ADDR.PORTB])} DDRB=0x${hex2(sim.io[IO_ADDR.DDRB])}\n`;
    s += `SREG: I=${sim.I} T=${sim.T} H=${sim.H} S=${sim.S} V=${sim.V} N=${sim.N} Z=${sim.Z} C=${sim.C}`;
    out.innerHTML = s;
  } catch (e) {
    out.innerHTML = `<span class="err">⚠ ${escapeHtml(e.message)}</span>`;
  }
}

function loadSolution(pid) {
  const p = PROBLEMS.find(x => x.id === pid);
  document.getElementById('ed-' + pid).value = p.solution;
  toast('Cozum yuklendi', 'success');
}

function openProblemInSim(pid) {
  const code = document.getElementById('ed-' + pid).value;
  openInSimulator(code);
}

// ===== Labs page =====
function renderLabs() {
  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
    <div class="page-head">
      <h1>🔧 Lab kodlari (Arduino C)</h1>
      <div class="sub">${LAB_CODES.length} adet lab senaryosu. Her biri icin tam kod, aciklama ve ekstra meydan okuma.</div>
    </div>

    ${LAB_CODES.map(lab => `
      <div class="card">
        <h2>${escapeHtml(lab.title)}</h2>
        <p style="color:var(--text-dim)">${escapeHtml(lab.desc)}</p>

        <div class="editor-wrap">
          <div class="editor-header">
            <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
            <div class="lbl">${lab.id}.ino</div>
          </div>
          <pre class="code">${escapeHtml(lab.code)}</pre>
        </div>

        <div class="toolbar">
          <button class="btn ghost" onclick="copyText(${JSON.stringify(lab.code).replace(/"/g, '&quot;')})">📋 Kopyala</button>
        </div>

        <div style="margin-top:14px;background:rgba(43,212,196,0.08);border-left:3px solid var(--teal);border-radius:6px;padding:10px 14px;color:var(--text)">
          <strong style="color:var(--teal)">📖 Aciklama: </strong>${escapeHtml(lab.explanation)}
        </div>
        <div style="margin-top:10px;background:rgba(245,185,69,0.1);border-left:3px solid var(--gold);border-radius:6px;padding:10px 14px;color:var(--text)">
          <strong style="color:var(--gold)">🎯 Meydan Okuma: </strong>${escapeHtml(lab.challenge)}
        </div>
      </div>
    `).join('')}
  `;
}

// ===== Progress =====
function renderProgress() {
  const solved = Store.solvedCount();
  const total = PROBLEMS.length;
  const pct = Math.round(solved / total * 100);
  const data = Store.get();
  const recent = data.solved
    ? Object.entries(data.solved).sort((a,b) => b[1]-a[1]).slice(0, 10)
    : [];

  // Per-topic stats
  const byTopic = {};
  PROBLEMS.forEach(p => {
    byTopic[p.topic] = byTopic[p.topic] || { total: 0, solved: 0 };
    byTopic[p.topic].total++;
    if (Store.isSolved(p.id)) byTopic[p.topic].solved++;
  });

  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
    <div class="page-head">
      <h1>📊 Ilerleme</h1>
      <div class="sub">Senin yolculugun.</div>
    </div>

    <div class="card">
      <h2>Toplam: <span style="color:var(--teal)">${solved}</span> / ${total} (${pct}%)</h2>
      <div class="progress-bar"><div class="fill" style="width:${pct}%"></div></div>

      <h3 style="margin-top:18px">Konuya gore</h3>
      ${Object.entries(byTopic).map(([t, s]) => `
        <div style="margin:8px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px">
            <span>${topicLabel(t)}</span>
            <span style="color:var(--text-dim)">${s.solved}/${s.total}</span>
          </div>
          <div class="progress-bar"><div class="fill" style="width:${Math.round(s.solved/s.total*100)}%"></div></div>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <h2>Son cozulen problemler</h2>
      ${recent.length === 0
        ? `<p style="color:var(--text-mute)">Henuz problem cozmedin. <a href="#practice">Pratik sayfasina</a> git!</p>`
        : recent.map(([pid, ts]) => {
            const p = PROBLEMS.find(x => x.id === pid);
            return p ? `<div style="padding:6px 0;border-bottom:1px solid var(--border-soft);font-size:13px">
              <span style="color:var(--green)">✓</span> ${escapeHtml(p.title)}
              <span style="float:right;color:var(--text-mute);font-size:11px">${new Date(ts).toLocaleString()}</span>
            </div>` : '';
          }).join('')}
    </div>

    <div class="card">
      <h3>Tum ilerlemeyi sifirla</h3>
      <p style="color:var(--text-dim);font-size:12px">Bu, tarayicidaki tum cozum kayitlarini siler. Geri alinamaz.</p>
      <button class="btn ghost" style="border-color:var(--red);color:var(--red)" onclick="resetProgress()">Sifirla</button>
    </div>
  `;
}

function resetProgress() {
  if (confirm('Tum ilerleme silinecek. Emin misin?')) {
    Store.reset();
    toast('Sifirlandi', 'success');
    renderProgress();
    document.getElementById('sidebar').innerHTML = renderSidebar();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.route === getRoute()));
  }
}

// ===== About =====
function renderAbout() {
  document.getElementById('main').innerHTML = `
    <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
    <div class="page-head">
      <h1>ℹ️ Hakkinda</h1>
    </div>
    <div class="card">
      <h2>Bu site nedir?</h2>
      <p>Bu site, COE304 / COE302 Embedded Systems dersine hazirlanmana yardim etmek icin yapildi. Ozellikle <strong>AVR Assembly</strong> yazip simule edebilesin diye gercek bir simulator iceriyor.</p>

      <h3 style="margin-top:14px">Simulator hangi komutlari destekliyor?</h3>
      <p style="color:var(--text-dim)">LDI, MOV, ADD, ADC, SUB, SUBI, SBC, SBCI, INC, DEC, NEG, COM, CLR, SER, TST, AND, ANDI, OR, ORI, EOR, SBR, CBR, LSL, LSR, ASR, ROL, ROR, SWAP, CP, CPI, CPC, BREQ, BRNE, BRCS, BRCC, BRLO, BRSH, BRMI, BRPL, BRLT, BRGE, BRVS, BRVC, BRTS, BRTC, BRIS, BRIC, JMP, RJMP, IJMP, CALL, RCALL, RET, RETI, PUSH, POP, LDS, STS, IN, OUT, LD/ST (X/Y/Z, ±, +q), SBI, CBI, SBIC, SBIS, SBRC, SBRS, NOP, SEI/CLI, SEC/CLC, vb.</p>

      <h3 style="margin-top:14px">Ne yapamaz?</h3>
      <p style="color:var(--text-dim)">Bu egitim amacli bir simulator. Gercek bir timer atmasi, gercek dunya kesmesi (INT0/INT1 pin sinyali) yok. Bu donanim olaylarini elle (STS ile PIN register'ina yazarak) tetikleyebilirsin.</p>

      <h3 style="margin-top:14px">Klavye kisayollari (Simulator sayfasinda)</h3>
      <p style="color:var(--text-dim)"><kbd>Ctrl/Cmd + Enter</kbd> → Calistir, <kbd>F10</kbd> → Adim, <kbd>F8</kbd> → Reset</p>
    </div>
  `;
}

// ===== Utility =====
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('Kopyalandi', 'success'));
}
function toast(msg, kind = '') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.className = 'toast ' + (kind || '') + ' show';
  t.textContent = msg;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== Init =====
function init() {
  document.getElementById('sidebar').innerHTML = renderSidebar();
  document.addEventListener('keydown', (e) => {
    if (getRoute() === 'simulator') {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); simRun(); }
      else if (e.key === 'F10') { e.preventDefault(); simStep(); }
      else if (e.key === 'F8') { e.preventDefault(); simReset(); }
    }
  });
  navigate(getRoute());
}
init();
