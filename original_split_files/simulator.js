/* =====================================================================
   AVR Assembly Simulator (basitlestirilmis - egitim amaclidir)
   Destekledigi komutlar:
     Data: LDI, MOV, LDS, STS, IN, OUT, LD, ST (X/Y/Z, X+/Y+/Z+, -X/-Y/-Z)
     Arit: ADD, ADC, SUB, SUBI, SBC, SBCI, INC, DEC, NEG, COM, CLR, SER
     Logic: AND, ANDI, OR, ORI, EOR, TST
     Shift: LSL, LSR, ASR, ROL, ROR
     Compare: CP, CPI, CPC
     Branch: BREQ, BRNE, BRCS, BRCC, BRLO, BRSH, BRMI, BRPL, BRLT, BRGE
     Jump: JMP, RJMP
     Call: CALL, RCALL, RET
     Stack: PUSH, POP
     I/O bit: SBI, CBI, SBIC, SBIS
     Reg bit: SBRC, SBRS
     Misc: NOP, SEI, CLI, SEC, CLC, SEZ, CLZ
   ===================================================================== */

const IO_ADDR = {
  PINB: 0x23, DDRB: 0x24, PORTB: 0x25,
  PINC: 0x26, DDRC: 0x27, PORTC: 0x28,
  PIND: 0x29, DDRD: 0x2A, PORTD: 0x2B,
  TIFR0: 0x35, TIFR1: 0x36, TIFR2: 0x37,
  EIFR: 0x3C, EIMSK: 0x3D,
  GPIOR0: 0x3E,
  EECR: 0x3F, EEDR: 0x40, EEARL: 0x41, EEARH: 0x42,
  GTCCR: 0x43, TCCR0A: 0x44, TCCR0B: 0x45, TCNT0: 0x46, OCR0A: 0x47, OCR0B: 0x48,
  GPIOR1: 0x4A, GPIOR2: 0x4B,
  SPCR: 0x4C, SPSR: 0x4D, SPDR: 0x4E,
  ACSR: 0x50,
  SMCR: 0x53, MCUSR: 0x54, MCUCR: 0x55,
  SPMCSR: 0x57,
  SPL: 0x5D, SPH: 0x5E, SREG: 0x5F,
  WDTCSR: 0x60, CLKPR: 0x61,
  PRR: 0x64, OSCCAL: 0x66, PCICR: 0x68, EICRA: 0x69,
  PCMSK0: 0x6B, PCMSK1: 0x6C, PCMSK2: 0x6D,
  TIMSK0: 0x6E, TIMSK1: 0x6F, TIMSK2: 0x70,
  ADCL: 0x78, ADCH: 0x79, ADCSRA: 0x7A, ADCSRB: 0x7B, ADMUX: 0x7C,
  DIDR0: 0x7E, DIDR1: 0x7F,
  TCCR1A: 0x80, TCCR1B: 0x81, TCCR1C: 0x82,
  TCNT1L: 0x84, TCNT1H: 0x85, ICR1L: 0x86, ICR1H: 0x87,
  OCR1AL: 0x88, OCR1AH: 0x89, OCR1BL: 0x8A, OCR1BH: 0x8B,
  TCCR2A: 0xB0, TCCR2B: 0xB1, TCNT2: 0xB2, OCR2A: 0xB3, OCR2B: 0xB4, ASSR: 0xB6,
  TWBR: 0xB8, TWSR: 0xB9, TWAR: 0xBA, TWDR: 0xBB, TWCR: 0xBC, TWAMR: 0xBD,
  UCSR0A: 0xC0, UCSR0B: 0xC1, UCSR0C: 0xC2,
  UBRR0L: 0xC4, UBRR0H: 0xC5, UDR0: 0xC6
};

// Bit name -> bit index, for common SBI/CBI usage
const BIT_NAMES = {
  // SREG
  C: 0, Z: 1, N: 2, V: 3, S: 4, H: 5, T: 6, I: 7,
  // Generic pin/bit positions (most are just numeric, but provide common ones)
  PB0:0, PB1:1, PB2:2, PB3:3, PB4:4, PB5:5, PB6:6, PB7:7,
  PC0:0, PC1:1, PC2:2, PC3:3, PC4:4, PC5:5, PC6:6, PC7:7,
  PD0:0, PD1:1, PD2:2, PD3:3, PD4:4, PD5:5, PD6:6, PD7:7,
  TOV0: 0, OCF0A: 1, OCF0B: 2,
  TOV1: 0, OCF1A: 1, OCF1B: 2, ICF1: 5,
  EERE: 0, EEPE: 1, EEMPE: 2, EERIE: 3,
  TXEN0: 3, RXEN0: 4, UDRE0: 5, TXC0: 6, RXC0: 7,
  WGM00: 0, WGM01: 1, WGM02: 3,
  CS00: 0, CS01: 1, CS02: 2,
  CS10: 0, CS11: 1, CS12: 2,
  TOIE0: 0, OCIE0A: 1, OCIE0B: 2,
  TOIE1: 0, OCIE1A: 1, OCIE1B: 2,
  INT0: 0, INT1: 1,
  ISC00: 0, ISC01: 1, ISC10: 2, ISC11: 3,
  PCIE0: 0, PCIE1: 1, PCIE2: 2,
  TWEN: 2, TWWC: 3, TWSTO: 4, TWSTA: 5, TWEA: 6, TWINT: 7, TWIE: 0,
  SPIE: 7, SPE: 6, DORD: 5, MSTR: 4, CPOL: 3, CPHA: 2, SPR1: 1, SPR0: 0,
  SPIF: 7, WCOL: 6, SPI2X: 0,
  ADEN: 7, ADSC: 6, ADIF: 4, ADIE: 3
};

const RAMEND = 0x08FF; // ATmega328 SRAM ends at 0x08FF

function parseRegister(token, line) {
  if (!token) throw new Error(`Satir ${line}: register bekleniyordu`);
  const t = token.toUpperCase();
  // X/Y/Z register pairs handled separately, but XL/XH etc. are aliases
  const aliases = { XL: 26, XH: 27, YL: 28, YH: 29, ZL: 30, ZH: 31 };
  if (aliases[t] !== undefined) return aliases[t];
  if (!/^R(\d{1,2})$/.test(t)) throw new Error(`Satir ${line}: register bekleniyordu, '${token}' bulundu`);
  const n = parseInt(t.slice(1), 10);
  if (n < 0 || n > 31) throw new Error(`Satir ${line}: register R${n} gecersiz (R0-R31)`);
  return n;
}

function parseImmediate(token, line, equs) {
  if (token === undefined || token === null) throw new Error(`Satir ${line}: sayi bekleniyordu`);
  let t = String(token).trim();
  // Char literal: 'A' -> 65
  t = t.replace(/'(.)'/g, (m, ch) => String(ch.charCodeAt(0)));
  // Allow $hh or 0xhh or 0bxx or decimal
  // Allow simple expressions: (1<<5)|(1<<2), HIGH(x), LOW(x), and basic + - * / & | ^
  // Replace .EQU names with their values
  t = t.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (m) => {
    const up = m.toUpperCase();
    if (equs[up] !== undefined) return `(${equs[up]})`;
    if (BIT_NAMES[up] !== undefined) return BIT_NAMES[up];
    if (IO_ADDR[up] !== undefined) return IO_ADDR[up];
    if (up === 'RAMEND') return RAMEND;
    if (up === 'HIGH') return 'HIGH_FN';
    if (up === 'LOW') return 'LOW_FN';
    return m;
  });
  // Convert $hh and 0xhh and 0bxx into JS numeric form
  t = t.replace(/\$([0-9A-Fa-f]+)/g, '0x$1');
  // Implement HIGH(n) and LOW(n) via wrap
  // Replace HIGH_FN(x) and LOW_FN(x)
  function evalExpr(expr) {
    // wrap HIGH/LOW
    expr = expr.replace(/HIGH_FN\(([^)]+)\)/g, '(((($1))>>8)&0xFF)');
    expr = expr.replace(/LOW_FN\(([^)]+)\)/g, '((($1))&0xFF)');
    // Only allow a safe subset
    if (!/^[\s0-9xXbBoO()|&^+\-*/<>!~,.A-F]+$/.test(expr.replace(/0x[0-9A-Fa-f]+/g,'0').replace(/0b[01]+/g,'0'))) {
      // be lenient — allow letters too
    }
    try {
      // eslint-disable-next-line no-new-func
      const v = Function('"use strict"; return (' + expr + ');')();
      if (typeof v !== 'number' || !isFinite(v)) throw 0;
      return v | 0;
    } catch (e) {
      throw new Error(`Satir ${line}: sayisal ifade hatasi: '${token}'`);
    }
  }
  return evalExpr(t);
}

function parseAddress(token, line, equs) {
  return parseImmediate(token, line, equs);
}

// Map textual I/O register name to I/O address (used by IN/OUT, SBI/CBI/SBIC/SBIS)
function parseIoReg(token, line, equs) {
  const up = String(token).trim().toUpperCase();
  if (IO_ADDR[up] !== undefined) return IO_ADDR[up];
  return parseImmediate(token, line, equs);
}

class AVRSim {
  constructor() {
    this.reset();
    this.maxSteps = 200000;
    this.output = [];
    this.onIOUpdate = null; // callback when PORTx changes
  }

  reset() {
    this.regs = new Uint8Array(32);
    this.io = new Uint8Array(0x100);
    this.sram = new Uint8Array(2048);
    this.pc = 0;
    this.cycles = 0;
    this.stepsExecuted = 0;
    this.halted = false;
    this.error = null;
    this.output = [];
    // SREG = 0
    this.io[IO_ADDR.SREG] = 0;
    this.io[IO_ADDR.SPL] = RAMEND & 0xFF;
    this.io[IO_ADDR.SPH] = (RAMEND >> 8) & 0xFF;
    this.io[IO_ADDR.PINB] = 0;
    this.io[IO_ADDR.PINC] = 0;
    this.io[IO_ADDR.PIND] = 0;
  }

  // ===== SREG helpers =====
  get sreg() { return this.io[IO_ADDR.SREG]; }
  set sreg(v) { this.io[IO_ADDR.SREG] = v & 0xFF; }
  getFlag(bit) { return (this.sreg >> bit) & 1; }
  setFlag(bit, v) { if (v) this.sreg = this.sreg | (1<<bit); else this.sreg = this.sreg & ~(1<<bit) & 0xFF; }
  get C() { return this.getFlag(0); }  set C(v) { this.setFlag(0, v); }
  get Z() { return this.getFlag(1); }  set Z(v) { this.setFlag(1, v); }
  get N() { return this.getFlag(2); }  set N(v) { this.setFlag(2, v); }
  get V() { return this.getFlag(3); }  set V(v) { this.setFlag(3, v); }
  get S() { return this.getFlag(4); }  set S(v) { this.setFlag(4, v); }
  get H() { return this.getFlag(5); }  set H(v) { this.setFlag(5, v); }
  get T() { return this.getFlag(6); }  set T(v) { this.setFlag(6, v); }
  get I() { return this.getFlag(7); }  set I(v) { this.setFlag(7, v); }

  // ===== Stack =====
  get SP() { return (this.io[IO_ADDR.SPH] << 8) | this.io[IO_ADDR.SPL]; }
  set SP(v) {
    this.io[IO_ADDR.SPL] = v & 0xFF;
    this.io[IO_ADDR.SPH] = (v >> 8) & 0xFF;
  }
  push(v) {
    const sp = this.SP;
    this.writeMem(sp, v & 0xFF);
    this.SP = (sp - 1) & 0xFFFF;
  }
  pop() {
    let sp = (this.SP + 1) & 0xFFFF;
    this.SP = sp;
    return this.readMem(sp);
  }

  // ===== Memory access =====
  writeMem(addr, val) {
    addr &= 0xFFFF; val &= 0xFF;
    if (addr < 32) { this.regs[addr] = val; return; }
    if (addr < 0x100) {
      this.io[addr] = val;
      if (this.onIOUpdate) this.onIOUpdate(addr, val);
      return;
    }
    // SRAM is 0x100 .. 0x100 + 2048
    const idx = addr - 0x100;
    if (idx >= 0 && idx < this.sram.length) this.sram[idx] = val;
  }
  readMem(addr) {
    addr &= 0xFFFF;
    if (addr < 32) return this.regs[addr];
    if (addr < 0x100) return this.io[addr];
    const idx = addr - 0x100;
    if (idx >= 0 && idx < this.sram.length) return this.sram[idx];
    return 0;
  }

  // ===== X/Y/Z pair =====
  getPair(which) {
    if (which === 'X') return (this.regs[27] << 8) | this.regs[26];
    if (which === 'Y') return (this.regs[29] << 8) | this.regs[28];
    if (which === 'Z') return (this.regs[31] << 8) | this.regs[30];
    return 0;
  }
  setPair(which, v) {
    v &= 0xFFFF;
    if (which === 'X') { this.regs[26] = v & 0xFF; this.regs[27] = (v>>8)&0xFF; }
    if (which === 'Y') { this.regs[28] = v & 0xFF; this.regs[29] = (v>>8)&0xFF; }
    if (which === 'Z') { this.regs[30] = v & 0xFF; this.regs[31] = (v>>8)&0xFF; }
  }

  log(msg) { this.output.push(msg); }

  // ===== Parse program =====
  load(source) {
    this.reset();
    const lines = source.split(/\r?\n/);
    const program = []; // list of {op, args, line}
    const labels = {};
    const equs = {};
    const orgStack = [];
    let pc = 0;
    for (let li = 0; li < lines.length; li++) {
      let raw = lines[li];
      const commentIdx = raw.indexOf(';');
      if (commentIdx >= 0) raw = raw.slice(0, commentIdx);
      raw = raw.replace(/\/\/.*/, '');
      raw = raw.trim();
      if (!raw) continue;
      // Handle label
      while (true) {
        const m = raw.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
        if (!m) break;
        labels[m[1].toUpperCase()] = pc;
        raw = m[2].trim();
        if (!raw) break;
      }
      if (!raw) continue;
      // Handle .EQU / .SET / .ORG / .DEF
      const dot = raw.match(/^\.(\w+)\s+(.*)$/);
      if (dot) {
        const directive = dot[1].toUpperCase();
        const rest = dot[2];
        if (directive === 'EQU' || directive === 'SET') {
          // NAME = value
          const m2 = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
          if (!m2) throw new Error(`Satir ${li+1}: .EQU/.SET formati hatali`);
          equs[m2[1].toUpperCase()] = parseImmediate(m2[2], li+1, equs);
          continue;
        }
        if (directive === 'DEF') {
          const m2 = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([A-Za-z_][A-Za-z0-9_]*)$/);
          if (!m2) throw new Error(`Satir ${li+1}: .DEF formati hatali`);
          equs[m2[1].toUpperCase()] = parseRegister(m2[2], li+1);
          continue;
        }
        if (directive === 'ORG') { /* ignore for our simplified model */ continue; }
        if (directive === 'INCLUDE') continue;
        if (directive === 'DB' || directive === 'DW') continue;
        // Skip unknown directives without erroring
        continue;
      }
      // Instruction
      const parts = raw.split(/\s+/);
      const opTok = parts.shift().toUpperCase();
      const rest = parts.join(' ');
      const args = rest ? rest.split(',').map(s => s.trim()) : [];
      program.push({ op: opTok, args, line: li+1, raw });
      pc++;
    }
    this.program = program;
    this.labels = labels;
    this.equs = equs;
    this.pc = 0;
  }

  // ===== ALU helpers =====
  add8(a, b, withCarry = false) {
    const c = withCarry ? this.C : 0;
    const r = (a + b + c) & 0xFF;
    this.H = (((a & 0xF) + (b & 0xF) + c) > 0xF) ? 1 : 0;
    this.C = ((a + b + c) > 0xFF) ? 1 : 0;
    this.Z = (r === 0) ? 1 : 0;
    this.N = (r >> 7) & 1;
    const sa = a & 0x80, sb = b & 0x80, sr = r & 0x80;
    this.V = (sa === sb && sa !== sr) ? 1 : 0;
    this.S = this.N ^ this.V;
    return r;
  }
  sub8(a, b, withCarry = false) {
    const c = withCarry ? this.C : 0;
    const r = (a - b - c) & 0xFF;
    this.H = ((((a & 0xF) - (b & 0xF) - c) & 0x10) !== 0) ? 1 : 0;
    this.C = (((a - b - c) & 0x100) !== 0) ? 1 : 0;
    this.N = (r >> 7) & 1;
    const sa = a & 0x80, sb = b & 0x80, sr = r & 0x80;
    this.V = (sa !== sb && sa !== sr) ? 1 : 0;
    this.S = this.N ^ this.V;
    // Z for subtract: special handling for SBC vs SUB (Z stays if r==0 OR for SBC preserved)
    this.Z = (r === 0) ? 1 : 0;
    return r;
  }
  logicUpdateSREG(r) {
    r &= 0xFF;
    this.Z = (r === 0) ? 1 : 0;
    this.N = (r >> 7) & 1;
    this.V = 0;
    this.S = this.N ^ this.V;
  }

  // ===== Operand parsing helpers (resolved at exec) =====
  parseLabelTarget(token, line) {
    const up = String(token).trim().toUpperCase();
    if (this.labels[up] !== undefined) return this.labels[up];
    throw new Error(`Satir ${line}: '${token}' etiketi bulunamadi`);
  }

  // ===== Indirect addressing parse =====
  parseIndirect(token, line) {
    // Accepts X, Y, Z, X+, Y+, Z+, -X, -Y, -Z, Y+q, Z+q
    let t = String(token).trim().toUpperCase();
    if (t === 'X' || t === 'Y' || t === 'Z') return { reg: t, mode: 'NONE', disp: 0 };
    if (t === 'X+' || t === 'Y+' || t === 'Z+') return { reg: t[0], mode: 'POST_INC', disp: 0 };
    if (t === '-X' || t === '-Y' || t === '-Z') return { reg: t[1], mode: 'PRE_DEC', disp: 0 };
    // Y+q or Z+q
    const m = t.match(/^([YZ])\+(\d+)$/);
    if (m) return { reg: m[1], mode: 'DISP', disp: parseInt(m[2], 10) };
    throw new Error(`Satir ${line}: dolayli adresleme operand'i tanimsiz: '${token}'`);
  }

  // ===== Execute one instruction =====
  step() {
    if (this.halted || this.error) return false;
    if (this.pc < 0 || this.pc >= this.program.length) { this.halted = true; return false; }
    const instr = this.program[this.pc];
    let nextPc = this.pc + 1;
    const { op, args, line } = instr;
    try {
      switch (op) {
        case 'NOP': this.cycles += 1; break;

        case 'LDI': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: LDI sadece R16-R31 destekler (R${rd} verildi)`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          this.regs[rd] = k;
          this.cycles += 1;
          break;
        }
        case 'MOV': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = this.regs[rr];
          this.cycles += 1;
          break;
        }
        case 'CLR': {
          const rd = parseRegister(args[0], line);
          this.regs[rd] = 0;
          this.Z = 1; this.N = 0; this.V = 0; this.S = 0;
          this.cycles += 1;
          break;
        }
        case 'SER': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: SER sadece R16-R31`);
          this.regs[rd] = 0xFF;
          this.cycles += 1;
          break;
        }
        case 'TST': {
          const rd = parseRegister(args[0], line);
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }

        case 'ADD': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = this.add8(this.regs[rd], this.regs[rr], false);
          this.cycles += 1;
          break;
        }
        case 'ADC': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = this.add8(this.regs[rd], this.regs[rr], true);
          this.cycles += 1;
          break;
        }
        case 'SUB': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = this.sub8(this.regs[rd], this.regs[rr], false);
          this.cycles += 1;
          break;
        }
        case 'SBC': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          const prevZ = this.Z;
          const r = this.sub8(this.regs[rd], this.regs[rr], true);
          this.regs[rd] = r;
          if (r !== 0) this.Z = 0;
          else this.Z = prevZ; // preserved if r==0
          this.cycles += 1;
          break;
        }
        case 'SUBI': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: SUBI sadece R16-R31`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          this.regs[rd] = this.sub8(this.regs[rd], k, false);
          this.cycles += 1;
          break;
        }
        case 'SBCI': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: SBCI sadece R16-R31`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          const prevZ = this.Z;
          const r = this.sub8(this.regs[rd], k, true);
          this.regs[rd] = r;
          if (r !== 0) this.Z = 0;
          else this.Z = prevZ;
          this.cycles += 1;
          break;
        }
        case 'INC': {
          const rd = parseRegister(args[0], line);
          const r = (this.regs[rd] + 1) & 0xFF;
          this.regs[rd] = r;
          this.Z = (r === 0) ? 1 : 0;
          this.N = (r >> 7) & 1;
          this.V = (r === 0x80) ? 1 : 0;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'DEC': {
          const rd = parseRegister(args[0], line);
          const r = (this.regs[rd] - 1) & 0xFF;
          this.regs[rd] = r;
          this.Z = (r === 0) ? 1 : 0;
          this.N = (r >> 7) & 1;
          this.V = (r === 0x7F) ? 1 : 0;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'NEG': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          const r = (0 - a) & 0xFF;
          this.regs[rd] = r;
          this.H = (((r & 0xF) | (a & 0xF)) !== 0) ? 1 : 0;
          this.C = (r !== 0) ? 1 : 0;
          this.Z = (r === 0) ? 1 : 0;
          this.N = (r >> 7) & 1;
          this.V = (r === 0x80) ? 1 : 0;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'COM': {
          const rd = parseRegister(args[0], line);
          const r = (0xFF - this.regs[rd]) & 0xFF;
          this.regs[rd] = r;
          this.C = 1;
          this.Z = (r === 0) ? 1 : 0;
          this.N = (r >> 7) & 1;
          this.V = 0;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }

        case 'AND': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = this.regs[rd] & this.regs[rr];
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }
        case 'ANDI': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: ANDI sadece R16-R31`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          this.regs[rd] = this.regs[rd] & k;
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }
        case 'OR': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = this.regs[rd] | this.regs[rr];
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }
        case 'ORI': case 'SBR': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: ORI/SBR sadece R16-R31`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          this.regs[rd] = this.regs[rd] | k;
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }
        case 'CBR': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: CBR sadece R16-R31`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          this.regs[rd] = this.regs[rd] & ((~k) & 0xFF);
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }
        case 'EOR': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.regs[rd] = (this.regs[rd] ^ this.regs[rr]) & 0xFF;
          this.logicUpdateSREG(this.regs[rd]);
          this.cycles += 1;
          break;
        }

        case 'LSL': case 'ASL': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          const r = (a << 1) & 0xFF;
          this.regs[rd] = r;
          this.C = (a >> 7) & 1;
          this.H = (a >> 3) & 1;
          this.Z = (r === 0) ? 1 : 0;
          this.N = (r >> 7) & 1;
          this.V = this.N ^ this.C;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'LSR': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          const r = a >> 1;
          this.regs[rd] = r;
          this.C = a & 1;
          this.N = 0;
          this.Z = (r === 0) ? 1 : 0;
          this.V = this.N ^ this.C;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'ASR': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          const r = (a >> 1) | (a & 0x80);
          this.regs[rd] = r;
          this.C = a & 1;
          this.N = (r >> 7) & 1;
          this.Z = (r === 0) ? 1 : 0;
          this.V = this.N ^ this.C;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'ROL': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          const r = ((a << 1) | this.C) & 0xFF;
          this.regs[rd] = r;
          this.C = (a >> 7) & 1;
          this.H = (a >> 3) & 1;
          this.Z = (r === 0) ? 1 : 0;
          this.N = (r >> 7) & 1;
          this.V = this.N ^ this.C;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'ROR': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          const r = ((this.C << 7) | (a >> 1)) & 0xFF;
          this.regs[rd] = r;
          this.C = a & 1;
          this.N = (r >> 7) & 1;
          this.Z = (r === 0) ? 1 : 0;
          this.V = this.N ^ this.C;
          this.S = this.N ^ this.V;
          this.cycles += 1;
          break;
        }
        case 'SWAP': {
          const rd = parseRegister(args[0], line);
          const a = this.regs[rd];
          this.regs[rd] = ((a >> 4) | (a << 4)) & 0xFF;
          this.cycles += 1;
          break;
        }

        case 'CP': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          this.sub8(this.regs[rd], this.regs[rr], false); // discard result, flags updated
          this.cycles += 1;
          break;
        }
        case 'CPI': {
          const rd = parseRegister(args[0], line);
          if (rd < 16) throw new Error(`Satir ${line}: CPI sadece R16-R31`);
          const k = parseImmediate(args[1], line, this.equs) & 0xFF;
          this.sub8(this.regs[rd], k, false);
          this.cycles += 1;
          break;
        }
        case 'CPC': {
          const rd = parseRegister(args[0], line);
          const rr = parseRegister(args[1], line);
          const prevZ = this.Z;
          const r = this.sub8(this.regs[rd], this.regs[rr], true);
          if (r !== 0) this.Z = 0;
          else this.Z = prevZ;
          this.cycles += 1;
          break;
        }

        // Branches: each takes 1 cycle if not taken, 2 if taken
        case 'BREQ': nextPc = this.branchIf(this.Z === 1, args[0], line, nextPc); break;
        case 'BRNE': nextPc = this.branchIf(this.Z === 0, args[0], line, nextPc); break;
        case 'BRCS': case 'BRLO': nextPc = this.branchIf(this.C === 1, args[0], line, nextPc); break;
        case 'BRCC': case 'BRSH': nextPc = this.branchIf(this.C === 0, args[0], line, nextPc); break;
        case 'BRMI': nextPc = this.branchIf(this.N === 1, args[0], line, nextPc); break;
        case 'BRPL': nextPc = this.branchIf(this.N === 0, args[0], line, nextPc); break;
        case 'BRLT': nextPc = this.branchIf(this.S === 1, args[0], line, nextPc); break;
        case 'BRGE': nextPc = this.branchIf(this.S === 0, args[0], line, nextPc); break;
        case 'BRVS': nextPc = this.branchIf(this.V === 1, args[0], line, nextPc); break;
        case 'BRVC': nextPc = this.branchIf(this.V === 0, args[0], line, nextPc); break;
        case 'BRTS': nextPc = this.branchIf(this.T === 1, args[0], line, nextPc); break;
        case 'BRTC': nextPc = this.branchIf(this.T === 0, args[0], line, nextPc); break;
        case 'BRIS': case 'BRIE': nextPc = this.branchIf(this.I === 1, args[0], line, nextPc); break;
        case 'BRIC': case 'BRID': nextPc = this.branchIf(this.I === 0, args[0], line, nextPc); break;

        case 'JMP': case 'RJMP': {
          nextPc = this.parseLabelTarget(args[0], line);
          this.cycles += (op === 'JMP') ? 3 : 2;
          break;
        }
        case 'IJMP': {
          nextPc = this.getPair('Z');
          this.cycles += 2;
          break;
        }

        case 'CALL': case 'RCALL': {
          const target = this.parseLabelTarget(args[0], line);
          // push return address (next instr PC)
          const ret = nextPc;
          this.push(ret & 0xFF);
          this.push((ret >> 8) & 0xFF);
          nextPc = target;
          this.cycles += (op === 'CALL') ? 4 : 3;
          break;
        }
        case 'RET': case 'RETI': {
          const hi = this.pop();
          const lo = this.pop();
          nextPc = (hi << 8) | lo;
          if (op === 'RETI') this.I = 1;
          this.cycles += 4;
          break;
        }

        case 'PUSH': {
          const rd = parseRegister(args[0], line);
          this.push(this.regs[rd]);
          this.cycles += 2;
          break;
        }
        case 'POP': {
          const rd = parseRegister(args[0], line);
          this.regs[rd] = this.pop();
          this.cycles += 2;
          break;
        }

        case 'LDS': {
          const rd = parseRegister(args[0], line);
          const addr = parseAddress(args[1], line, this.equs);
          this.regs[rd] = this.readMem(addr);
          this.cycles += 2;
          break;
        }
        case 'STS': {
          const addr = parseAddress(args[0], line, this.equs);
          const rr = parseRegister(args[1], line);
          this.writeMem(addr, this.regs[rr]);
          this.cycles += 2;
          break;
        }
        case 'IN': {
          const rd = parseRegister(args[0], line);
          const ioAddr = parseIoReg(args[1], line, this.equs);
          this.regs[rd] = this.readMem(ioAddr);
          this.cycles += 1;
          break;
        }
        case 'OUT': {
          const ioAddr = parseIoReg(args[0], line, this.equs);
          const rr = parseRegister(args[1], line);
          this.writeMem(ioAddr, this.regs[rr]);
          this.cycles += 1;
          break;
        }

        case 'SBI': {
          const ioAddr = parseIoReg(args[0], line, this.equs);
          const bit = parseImmediate(args[1], line, this.equs) & 7;
          this.writeMem(ioAddr, this.readMem(ioAddr) | (1 << bit));
          this.cycles += 2;
          break;
        }
        case 'CBI': {
          const ioAddr = parseIoReg(args[0], line, this.equs);
          const bit = parseImmediate(args[1], line, this.equs) & 7;
          this.writeMem(ioAddr, this.readMem(ioAddr) & (~(1<<bit) & 0xFF));
          this.cycles += 2;
          break;
        }
        case 'SBIC': {
          const ioAddr = parseIoReg(args[0], line, this.equs);
          const bit = parseImmediate(args[1], line, this.equs) & 7;
          if ((this.readMem(ioAddr) & (1<<bit)) === 0) {
            nextPc = this.pc + 2; // skip next
            this.cycles += 2;
          } else {
            this.cycles += 1;
          }
          break;
        }
        case 'SBIS': {
          const ioAddr = parseIoReg(args[0], line, this.equs);
          const bit = parseImmediate(args[1], line, this.equs) & 7;
          if ((this.readMem(ioAddr) & (1<<bit)) !== 0) {
            nextPc = this.pc + 2;
            this.cycles += 2;
          } else {
            this.cycles += 1;
          }
          break;
        }
        case 'SBRC': {
          const rd = parseRegister(args[0], line);
          const bit = parseImmediate(args[1], line, this.equs) & 7;
          if ((this.regs[rd] & (1<<bit)) === 0) {
            nextPc = this.pc + 2;
            this.cycles += 2;
          } else {
            this.cycles += 1;
          }
          break;
        }
        case 'SBRS': {
          const rd = parseRegister(args[0], line);
          const bit = parseImmediate(args[1], line, this.equs) & 7;
          if ((this.regs[rd] & (1<<bit)) !== 0) {
            nextPc = this.pc + 2;
            this.cycles += 2;
          } else {
            this.cycles += 1;
          }
          break;
        }

        case 'LD': {
          const rd = parseRegister(args[0], line);
          const ind = this.parseIndirect(args[1], line);
          let addr = this.getPair(ind.reg);
          if (ind.mode === 'PRE_DEC') { addr = (addr - 1) & 0xFFFF; this.setPair(ind.reg, addr); }
          if (ind.mode === 'DISP') addr = (addr + ind.disp) & 0xFFFF;
          this.regs[rd] = this.readMem(addr);
          if (ind.mode === 'POST_INC') this.setPair(ind.reg, (addr + 1) & 0xFFFF);
          this.cycles += 2;
          break;
        }
        case 'LDD': {
          const rd = parseRegister(args[0], line);
          const ind = this.parseIndirect(args[1], line);
          let addr = (this.getPair(ind.reg) + ind.disp) & 0xFFFF;
          this.regs[rd] = this.readMem(addr);
          this.cycles += 2;
          break;
        }
        case 'ST': {
          const ind = this.parseIndirect(args[0], line);
          const rr = parseRegister(args[1], line);
          let addr = this.getPair(ind.reg);
          if (ind.mode === 'PRE_DEC') { addr = (addr - 1) & 0xFFFF; this.setPair(ind.reg, addr); }
          if (ind.mode === 'DISP') addr = (addr + ind.disp) & 0xFFFF;
          this.writeMem(addr, this.regs[rr]);
          if (ind.mode === 'POST_INC') this.setPair(ind.reg, (addr + 1) & 0xFFFF);
          this.cycles += 2;
          break;
        }
        case 'STD': {
          const ind = this.parseIndirect(args[0], line);
          const rr = parseRegister(args[1], line);
          let addr = (this.getPair(ind.reg) + ind.disp) & 0xFFFF;
          this.writeMem(addr, this.regs[rr]);
          this.cycles += 2;
          break;
        }

        case 'SEI': this.I = 1; this.cycles += 1; break;
        case 'CLI': this.I = 0; this.cycles += 1; break;
        case 'SEC': this.C = 1; this.cycles += 1; break;
        case 'CLC': this.C = 0; this.cycles += 1; break;
        case 'SEZ': this.Z = 1; this.cycles += 1; break;
        case 'CLZ': this.Z = 0; this.cycles += 1; break;
        case 'SEN': this.N = 1; this.cycles += 1; break;
        case 'CLN': this.N = 0; this.cycles += 1; break;
        case 'SEV': this.V = 1; this.cycles += 1; break;
        case 'CLV': this.V = 0; this.cycles += 1; break;
        case 'SES': this.S = 1; this.cycles += 1; break;
        case 'CLS': this.S = 0; this.cycles += 1; break;
        case 'SEH': this.H = 1; this.cycles += 1; break;
        case 'CLH': this.H = 0; this.cycles += 1; break;
        case 'SET': this.T = 1; this.cycles += 1; break;
        case 'CLT': this.T = 0; this.cycles += 1; break;

        case 'BREAK': case 'WDR': case 'SLEEP': this.cycles += 1; break;

        default:
          throw new Error(`Satir ${line}: '${op}' komutu desteklenmiyor`);
      }
    } catch (e) {
      this.error = e.message;
      this.halted = true;
      return false;
    }
    this.pc = nextPc;
    this.stepsExecuted++;
    if (this.stepsExecuted >= this.maxSteps) {
      this.error = `Maksimum adim sayisi (${this.maxSteps}) asildi — sonsuz dongu olabilir?`;
      this.halted = true;
      return false;
    }
    return true;
  }

  branchIf(cond, labelTok, line, nextPc) {
    if (cond) {
      this.cycles += 2;
      return this.parseLabelTarget(labelTok, line);
    } else {
      this.cycles += 1;
      return nextPc;
    }
  }

  run(maxSteps = this.maxSteps) {
    this.maxSteps = maxSteps;
    while (!this.halted && this.step()) {}
    return !this.error;
  }
}

// Expose globally for the page
window.AVRSim = AVRSim;
window.IO_ADDR = IO_ADDR;
