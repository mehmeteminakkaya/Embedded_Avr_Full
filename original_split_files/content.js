/* Ders icerigi ve pratik problemler.
   Her LESSON: kisa anlatim + ornek kod (calistirilabilir).
   Her PROBLEM: aciklama + baslangic kodu + (opsiyonel) cozum + check fonksiyonu.
   check(sim) sim calistiktan sonra true/false doner; basarisizsa neden mesaji icin returns {ok, msg}.
*/

const LESSONS = [
  {
    id: 'basics',
    title: '1. Temel komutlar — LDI, ADD, SUB',
    icon: '📝',
    intro: `LDI ile bir register'a sabit yukle. ADD/SUB ile iki register arasi islem yap.
LDI sadece R16-R31 destekler. Cogu komut sonuca gore SREG'i guncelder.`,
    examples: [
      {
        title: 'En basit: 19 + 95 hesapla',
        code: `; R16 ve R20'ye degerleri yukle, sonra topla\nLDI R16, 19      ; R16 = 19\nLDI R20, 95      ; R20 = 95\nADD R16, R20     ; R16 = 114\n`
      },
      {
        title: 'INC ve DEC',
        code: `LDI R20, 10\nINC R20          ; R20 = 11\nDEC R20          ; R20 = 10\nDEC R20\nDEC R20          ; R20 = 8\n`
      }
    ]
  },
  {
    id: 'flags',
    title: '2. SREG bayraklari ve dallanma',
    icon: '🚦',
    intro: `Aritmetik komut SREG'deki Z, C, N, V bayraklarini guncedir.
Sonra BREQ, BRNE, BRCS, BRCC gibi dallanma komutlari bu bayraklara bakar.`,
    examples: [
      {
        title: 'Esitlik kontrolu',
        code: `; R20 == R21 mi?\nLDI R20, 5\nLDI R21, 5\nCP  R20, R21\nBREQ EQUAL\n; degildi\nLDI R22, 0\nRJMP DONE\nEQUAL:\nLDI R22, 0xFF   ; esit ise R22=0xFF\nDONE:\n`
      },
      {
        title: '20 + 19 + 18 + ... + 1 toplami',
        code: `LDI R16, 20\nLDI R17, 0\nL1: ADD R17, R16\n    DEC R16\n    BRNE L1\n; R17 = 210 olmali\n`
      }
    ]
  },
  {
    id: 'stack',
    title: '3. Stack ve fonksiyon (CALL/RET)',
    icon: '📚',
    intro: `Stack pointer'i (SP) baslangicta RAMEND'e ayarla.
PUSH/POP register'lari yedek alir. CALL fonksiyona zipla, RET geri don.`,
    examples: [
      {
        title: 'Stack init + PUSH/POP',
        code: `LDI R16, HIGH(RAMEND)\nOUT SPH, R16\nLDI R16, LOW(RAMEND)\nOUT SPL, R16\n\nLDI R20, 0x10\nLDI R21, 0x20\nPUSH R20\nPUSH R21\nPOP  R22         ; R22 = 0x20\nPOP  R23         ; R23 = 0x10\n`
      },
      {
        title: 'Fonksiyon cagrisi',
        code: `LDI R16, HIGH(RAMEND)\nOUT SPH, R16\nLDI R16, LOW(RAMEND)\nOUT SPL, R16\n\nLDI R20, 15\nLDI R21, 5\nCALL TOPLAMA\n; donunce R20 = 20\nRJMP END\n\nTOPLAMA:\n  ADD R20, R21\n  RET\nEND:\n`
      }
    ]
  },
  {
    id: 'io',
    title: '4. I/O portlari — DDR, PORT, PIN',
    icon: '💡',
    intro: `DDRx pinin yonunu belirler (1=cikis, 0=giris).
PORTx cikis modunda yazilan deger, giris modunda pull-up enable.
PINx pinin gercek seviyesini okur.`,
    examples: [
      {
        title: 'PORTB tum pinleri HIGH',
        code: `LDI R20, 0xFF\nOUT DDRB, R20    ; tum pinleri cikis\nOUT PORTB, R20   ; tum pinler HIGH\n`
      },
      {
        title: 'SBI/CBI ile tek bit kontrolu',
        code: `SBI DDRB, 5      ; PB5 cikis\nSBI PORTB, 5     ; PB5 = 1\nCBI PORTB, 5     ; PB5 = 0\nSBI PORTB, 5     ; PB5 = 1\n`
      }
    ]
  },
  {
    id: 'arith',
    title: '5. Aritmetik & Mantik — AND, OR, EOR, shift',
    icon: '🔢',
    intro: `AND bit silmek (mask), OR bit set etmek, EOR bit toggle icin idealdir.
LSL = sola kay (x2). LSR = saga kay (/2). ROR/ROL carry ile dondurur.`,
    examples: [
      {
        title: 'Maskeleme: 0x35 AND 0x0F',
        code: `LDI R20, 0x35\nANDI R20, 0x0F    ; R20 = 0x05 (ust nibble silindi)\n`
      },
      {
        title: 'Bit toggle ile LED yakip sondurme',
        code: `LDI R20, 0x55\nLDI R21, 0xFF\nEOR R20, R21      ; R20 = 0xAA (bit'leri tersine)\nEOR R20, R21      ; R20 = 0x55 (tekrar)\n`
      },
      {
        title: 'LSL ile x2 carpma',
        code: `LDI R20, 6\nLSL R20           ; R20 = 12\nLSL R20           ; R20 = 24\nLSL R20           ; R20 = 48\n`
      }
    ]
  },
  {
    id: 'addressing',
    title: '6. Adresleme modlari — X, Y, Z',
    icon: '🗂️',
    intro: `Dolayli adresleme: X (R27:R26), Y (R29:R28), Z (R31:R30).
LD/ST komutlari ile auto-increment (X+) ya da pre-decrement (-X) yapilabilir.`,
    examples: [
      {
        title: 'Y register ile 5 bellege yazma',
        code: `LDI R16, 0x55\nLDI YL, 0x40\nLDI YH, 0x01     ; Y = 0x140\nST  Y, R16       ; [0x140] = 0x55\nINC YL\nST  Y, R16       ; [0x141] = 0x55\n`
      },
      {
        title: 'Auto-increment ile bellek doldurma',
        code: `LDI R19, 5       ; sayac\nLDI R16, 0xAA\nLDI YL, 0x40\nLDI YH, 0x01\nL1: ST Y+, R16    ; [Y] = 0xAA, sonra Y++\n    DEC R19\n    BRNE L1\n`
      }
    ]
  },
  {
    id: 'timer',
    title: '7. Timer/Counter (kavramsal)',
    icon: '⏱️',
    intro: `Timer0 8-bit, Timer1 16-bit, Timer2 8-bit. Normal mode 0'dan 255'e sayar, sonra overflow (TOV0). CTC mode TCNT == OCR olunca clear olur.
Bu simulator timer'i otomatik calistirmaz; sen TCNT/TIFR register'larini manuel set/oku ederek ogrenebilirsin.`,
    examples: [
      {
        title: 'Timer config kaydetme',
        code: `LDI R20, 0xF2     ; 256-14 = 242 → 14 cevrim sayacak\nOUT TCNT0, R20\nLDI R20, 0x00\nOUT TCCR0A, R20\nLDI R20, 0x01     ; Normal mode, prescaler yok\nOUT TCCR0B, R20\n; (gercek donanimda burada timer baslar)\n`
      }
    ]
  },
  {
    id: 'interrupt',
    title: '8. Kesme (Interrupt) kavrami',
    icon: '⚡',
    intro: `SEI tum kesmeleri acar, CLI kapatir. Donanim olayinda CPU ISR'a atlar.
Bu simulator gercek kesme tetikleyemez ama SEI/CLI ve I bayragi ile pratik yapabilirsin.`,
    examples: [
      {
        title: 'Global enable',
        code: `CLI              ; kesmeler kapali\nSEI              ; kesmeler acik (I bayragi 1)\nCLI\n`
      }
    ]
  }
];

const PROBLEMS = [
  // ====================== Kolay (1-15) ======================
  {
    id: 'p1',
    level: 'Kolay',
    topic: 'basics',
    title: 'P1 — R20 ve R21 toplamini R22\'ye yaz',
    desc: 'R20 = 30, R21 = 12 olsun. R22 = R20 + R21 hesapla (R20 ve R21 bozulmasin).',
    starter: `; Senin kodun:\n\n`,
    solution: `LDI R20, 30\nLDI R21, 12\nMOV R22, R20\nADD R22, R21\n`,
    check: (sim) => ({
      ok: sim.regs[20] === 30 && sim.regs[21] === 12 && sim.regs[22] === 42,
      msg: `Beklenen: R20=30, R21=12, R22=42 — Bulunan: R20=${sim.regs[20]}, R21=${sim.regs[21]}, R22=${sim.regs[22]}`
    })
  },
  {
    id: 'p2',
    level: 'Kolay',
    topic: 'basics',
    title: 'P2 — Iki sayinin farkini hesapla',
    desc: 'R16 = 100, R17 = 35. R18 = R16 - R17 (yani 65) olsun.',
    starter: ``,
    solution: `LDI R16, 100\nLDI R17, 35\nMOV R18, R16\nSUB R18, R17\n`,
    check: (sim) => ({
      ok: sim.regs[18] === 65,
      msg: `R18 = 65 olmali, bulundu R18 = ${sim.regs[18]}`
    })
  },
  {
    id: 'p3',
    level: 'Kolay',
    topic: 'basics',
    title: 'P3 — R20\'yi 7 yap',
    desc: 'R20\'ye 7 degeri yukle (LDI ile).',
    starter: ``,
    solution: `LDI R20, 7\n`,
    check: (sim) => ({ ok: sim.regs[20] === 7, msg: `R20 = 7 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p4',
    level: 'Kolay',
    topic: 'basics',
    title: 'P4 — R20 = 0x55, sonra bit\'leri tersle (R20 = 0xAA olmali)',
    desc: 'Once 0x55 yukle, sonra COM ile tum bitleri terslerse 0xAA olur. (COM = 0xFF - R20)',
    starter: ``,
    solution: `LDI R20, 0x55\nCOM R20\n`,
    check: (sim) => ({ ok: sim.regs[20] === 0xAA, msg: `R20 = 0xAA bekleniyordu, bulundu 0x${sim.regs[20].toString(16)}` })
  },
  {
    id: 'p5',
    level: 'Kolay',
    topic: 'basics',
    title: 'P5 — R16 = 12, R17 = 20. R16 += R17, sonra R16 += 5',
    desc: 'Sonuc R16 = 37 olmali.',
    starter: ``,
    solution: `LDI R16, 12\nLDI R17, 20\nADD R16, R17\nLDI R18, 5\nADD R16, R18\n`,
    check: (sim) => ({ ok: sim.regs[16] === 37, msg: `R16 = 37 bekleniyordu, bulundu ${sim.regs[16]}` })
  },
  {
    id: 'p6',
    level: 'Kolay',
    topic: 'flags',
    title: 'P6 — R20 == 10 ise R22 = 0xFF, degilse R22 = 0',
    desc: 'R20\'ye 10 yukle. Kontrol et: esit ise R22 = 255, degilse 0 olsun.',
    starter: ``,
    solution: `LDI R20, 10\nCPI R20, 10\nBREQ EQ\nLDI R22, 0\nRJMP DONE\nEQ:\nLDI R22, 0xFF\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[22] === 0xFF, msg: `R22 = 0xFF bekleniyordu, bulundu 0x${sim.regs[22].toString(16)}` })
  },
  {
    id: 'p7',
    level: 'Kolay',
    topic: 'flags',
    title: 'P7 — R16 < R17 ise R22 = 1, degilse R22 = 2',
    desc: 'R16 = 5, R17 = 10. R16 R17\'den kucuk oldugu icin R22 = 1 olmali.',
    starter: ``,
    solution: `LDI R16, 5\nLDI R17, 10\nCP  R16, R17\nBRLO LT\nLDI R22, 2\nRJMP DONE\nLT:\nLDI R22, 1\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[22] === 1, msg: `R22 = 1 bekleniyordu, bulundu ${sim.regs[22]}` })
  },
  {
    id: 'p8',
    level: 'Kolay',
    topic: 'basics',
    title: 'P8 — R20 = 5, R21 = 5. Esit ise R30 = 0xAA',
    desc: 'CP ile karsilastir, BREQ ile R30\'a 0xAA yaz.',
    starter: ``,
    solution: `LDI R20, 5\nLDI R21, 5\nCP R20, R21\nBREQ Y\nRJMP DONE\nY: LDI R30, 0xAA\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[30] === 0xAA, msg: `R30 = 0xAA bekleniyordu` })
  },
  {
    id: 'p9',
    level: 'Kolay',
    topic: 'arith',
    title: 'P9 — Maskeleme: R20\'nin alt nibble\'ini koru, ust nibble sifirla',
    desc: 'R20 = 0xAB. Sonra alt nibble\'i koru → R20 = 0x0B.',
    starter: ``,
    solution: `LDI R20, 0xAB\nANDI R20, 0x0F\n`,
    check: (sim) => ({ ok: sim.regs[20] === 0x0B, msg: `R20 = 0x0B bekleniyordu, bulundu 0x${sim.regs[20].toString(16)}` })
  },
  {
    id: 'p10',
    level: 'Kolay',
    topic: 'arith',
    title: 'P10 — R20\'nin sadece bit 3 ve bit 5\'ini 1 yap',
    desc: 'R20 = 0x00. ORI ile bit 3 ve bit 5 set et → R20 = 0x28.',
    starter: ``,
    solution: `LDI R20, 0\nORI R20, (1<<5)|(1<<3)\n`,
    check: (sim) => ({ ok: sim.regs[20] === 0x28, msg: `R20 = 0x28 bekleniyordu, bulundu 0x${sim.regs[20].toString(16)}` })
  },
  {
    id: 'p11',
    level: 'Kolay',
    topic: 'arith',
    title: 'P11 — R20\'yi 4 ile carp (LSL kullan)',
    desc: 'R20 = 7. Iki LSL ile R20 = 28 olmali.',
    starter: ``,
    solution: `LDI R20, 7\nLSL R20\nLSL R20\n`,
    check: (sim) => ({ ok: sim.regs[20] === 28, msg: `R20 = 28 bekleniyordu` })
  },
  {
    id: 'p12',
    level: 'Kolay',
    topic: 'arith',
    title: 'P12 — R20\'yi 2\'ye bol (LSR)',
    desc: 'R20 = 100. LSR ile R20 = 50 olmali.',
    starter: ``,
    solution: `LDI R20, 100\nLSR R20\n`,
    check: (sim) => ({ ok: sim.regs[20] === 50, msg: `R20 = 50 bekleniyordu` })
  },
  {
    id: 'p13',
    level: 'Kolay',
    topic: 'io',
    title: 'P13 — PORTB\'nin tum pinleri HIGH yap',
    desc: 'Once DDRB = 0xFF (tum pinler cikis), sonra PORTB = 0xFF.',
    starter: ``,
    solution: `LDI R20, 0xFF\nOUT DDRB, R20\nOUT PORTB, R20\n`,
    check: (sim) => ({
      ok: sim.io[IO_ADDR.DDRB] === 0xFF && sim.io[IO_ADDR.PORTB] === 0xFF,
      msg: `DDRB=0xFF ve PORTB=0xFF bekleniyordu, DDRB=0x${sim.io[IO_ADDR.DDRB].toString(16)}, PORTB=0x${sim.io[IO_ADDR.PORTB].toString(16)}`
    })
  },
  {
    id: 'p14',
    level: 'Kolay',
    topic: 'io',
    title: 'P14 — SBI ile sadece PB5\'i 1 yap (PB5 LED toggle)',
    desc: 'DDRB.5 cikis yap, PORTB.5 = 1 set et.',
    starter: ``,
    solution: `SBI DDRB, 5\nSBI PORTB, 5\n`,
    check: (sim) => ({
      ok: (sim.io[IO_ADDR.PORTB] & 0x20) === 0x20 && (sim.io[IO_ADDR.DDRB] & 0x20) === 0x20,
      msg: `PORTB.5 ve DDRB.5 1 olmali`
    })
  },
  {
    id: 'p15',
    level: 'Kolay',
    topic: 'io',
    title: 'P15 — PORTC = 0x0F yap (alt nibble HIGH)',
    desc: 'DDRC = 0xFF, PORTC = 0x0F.',
    starter: ``,
    solution: `LDI R20, 0xFF\nOUT DDRC, R20\nLDI R20, 0x0F\nOUT PORTC, R20\n`,
    check: (sim) => ({
      ok: sim.io[IO_ADDR.PORTC] === 0x0F,
      msg: `PORTC = 0x0F bekleniyordu, bulundu 0x${sim.io[IO_ADDR.PORTC].toString(16)}`
    })
  },

  // ====================== Orta (16-30) ======================
  {
    id: 'p16',
    level: 'Orta',
    topic: 'flags',
    title: 'P16 — 1+2+3+...+10 toplamini R17\'de bulun (55 olmali)',
    desc: 'Dongu ile topla.',
    starter: ``,
    solution: `LDI R16, 10\nLDI R17, 0\nL1: ADD R17, R16\n    DEC R16\n    BRNE L1\n`,
    check: (sim) => ({ ok: sim.regs[17] === 55, msg: `R17 = 55 bekleniyordu, bulundu ${sim.regs[17]}` })
  },
  {
    id: 'p17',
    level: 'Orta',
    topic: 'flags',
    title: 'P17 — Cift sayilarin toplami: 2+4+6+...+20 (110 olmali)',
    desc: 'R17 = 110 olmali. Sayma adimi 2.',
    starter: ``,
    solution: `LDI R16, 20\nLDI R17, 0\nLDI R18, 2\nL1: ADD R17, R16\n    SUB R16, R18\n    BRNE L1\n`,
    check: (sim) => ({ ok: sim.regs[17] === 110, msg: `R17 = 110 bekleniyordu, bulundu ${sim.regs[17]}` })
  },
  {
    id: 'p18',
    level: 'Orta',
    topic: 'flags',
    title: 'P18 — R20\'nin icindeki 1 bit\'lerini say (popcount)',
    desc: 'R20 = 0xB7 (= 0b10110111, yani 6 adet 1 var). R21 sayim olsun → R21 = 6.',
    starter: ``,
    solution: `LDI R20, 0xB7\nLDI R21, 0\nLDI R22, 8\nL1: LSR R20\n    BRCC SKIP\n    INC R21\nSKIP:\n    DEC R22\n    BRNE L1\n`,
    check: (sim) => ({ ok: sim.regs[21] === 6, msg: `R21 = 6 bekleniyordu, bulundu ${sim.regs[21]}` })
  },
  {
    id: 'p19',
    level: 'Orta',
    topic: 'stack',
    title: 'P19 — PUSH/POP ile R20 ve R21\'i takasla (swap)',
    desc: 'R20 = 0xAA, R21 = 0x55. Sonunda R20 = 0x55, R21 = 0xAA olsun.',
    starter: ``,
    solution: `LDI R16, HIGH(RAMEND)\nOUT SPH, R16\nLDI R16, LOW(RAMEND)\nOUT SPL, R16\n\nLDI R20, 0xAA\nLDI R21, 0x55\nPUSH R20\nPUSH R21\nPOP R20\nPOP R21\n`,
    check: (sim) => ({ ok: sim.regs[20] === 0x55 && sim.regs[21] === 0xAA, msg: `R20=0x55 ve R21=0xAA bekleniyordu` })
  },
  {
    id: 'p20',
    level: 'Orta',
    topic: 'stack',
    title: 'P20 — Fonksiyon: KARE → R20 = R20 * R20 (kucuk degerler)',
    desc: 'R20 = 5 olarak baslat. KARE fonksiyonu dongu ile R20 * R20 hesaplasin (R20 = 25). MUL kullanma.',
    starter: ``,
    solution: `LDI R16, HIGH(RAMEND)\nOUT SPH, R16\nLDI R16, LOW(RAMEND)\nOUT SPL, R16\n\nLDI R20, 5\nCALL KARE\nRJMP END\n\nKARE:\n  MOV R23, R20    ; sayac\n  MOV R24, R20\n  CLR R20\nKL: ADD R20, R24\n  DEC R23\n  BRNE KL\n  RET\nEND:\n`,
    check: (sim) => ({ ok: sim.regs[20] === 25, msg: `R20 = 25 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p21',
    level: 'Orta',
    topic: 'addressing',
    title: 'P21 — 0x140..0x144 hucrelerinin hepsine 0xAA yaz',
    desc: 'Y register\'i ve auto-increment ile 5 hucreyi 0xAA yap.',
    starter: ``,
    solution: `LDI R19, 5\nLDI R16, 0xAA\nLDI YL, 0x40\nLDI YH, 0x01\nL1: ST Y+, R16\n    DEC R19\n    BRNE L1\n`,
    check: (sim) => {
      for (let a = 0x140; a <= 0x144; a++) {
        if (sim.readMem(a) !== 0xAA) return { ok: false, msg: `[0x${a.toString(16)}] = 0xAA olmali, bulundu 0x${sim.readMem(a).toString(16)}` };
      }
      return { ok: true };
    }
  },
  {
    id: 'p22',
    level: 'Orta',
    topic: 'addressing',
    title: 'P22 — Bellekteki 5 sayinin toplami',
    desc: '0x100..0x104 adreslerinde 10, 20, 30, 40, 50 var. Toplamlarini R20\'de bul (150).',
    starter: `; Onbilgi: bellek dolu\nLDI R16, 10\nSTS 0x100, R16\nLDI R16, 20\nSTS 0x101, R16\nLDI R16, 30\nSTS 0x102, R16\nLDI R16, 40\nSTS 0x103, R16\nLDI R16, 50\nSTS 0x104, R16\n\n; Sen burdan basla:\n`,
    solution: `LDI R16, 10\nSTS 0x100, R16\nLDI R16, 20\nSTS 0x101, R16\nLDI R16, 30\nSTS 0x102, R16\nLDI R16, 40\nSTS 0x103, R16\nLDI R16, 50\nSTS 0x104, R16\n\nLDI XL, 0x00\nLDI XH, 0x01    ; X = 0x100\nLDI R19, 5\nCLR R20\nL1: LD R21, X+\n    ADD R20, R21\n    DEC R19\n    BRNE L1\n`,
    check: (sim) => ({ ok: sim.regs[20] === 150, msg: `R20 = 150 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p23',
    level: 'Orta',
    topic: 'io',
    title: 'P23 — PORTB\'de sadece PB2 ve PB4\'u 1 yap, gerisi 0',
    desc: 'PORTB = 0b00010100 = 0x14 olmali. DDRB tamamen cikis.',
    starter: ``,
    solution: `LDI R20, 0xFF\nOUT DDRB, R20\nLDI R20, (1<<4)|(1<<2)\nOUT PORTB, R20\n`,
    check: (sim) => ({
      ok: sim.io[IO_ADDR.PORTB] === 0x14,
      msg: `PORTB = 0x14 bekleniyordu, bulundu 0x${sim.io[IO_ADDR.PORTB].toString(16)}`
    })
  },
  {
    id: 'p24',
    level: 'Orta',
    topic: 'io',
    title: 'P24 — PORTD = 0x55, sonra PB5\'i toggle (XOR)',
    desc: 'PORTD = 0x55 yaz. Ardindan PORTB\'yi 0x20 ile XOR\'la (bit 5 toggle). Baslangicta PORTB = 0.',
    starter: ``,
    solution: `LDI R20, 0xFF\nOUT DDRD, R20\nOUT DDRB, R20\nLDI R20, 0x55\nOUT PORTD, R20\nLDI R20, 0x20\nIN R21, PORTB\nEOR R21, R20\nOUT PORTB, R21\n`,
    check: (sim) => ({
      ok: sim.io[IO_ADDR.PORTD] === 0x55 && (sim.io[IO_ADDR.PORTB] & 0x20) === 0x20,
      msg: `PORTD = 0x55 ve PORTB.5 = 1 bekleniyordu`
    })
  },
  {
    id: 'p25',
    level: 'Orta',
    topic: 'arith',
    title: 'P25 — 95 / 10 = ? (bolme dongusu)',
    desc: 'AVR\'de bolme komutu yok. R20 = 95, R21 = 10. Sonuc R22 = 9 (quotient), R20 = 5 (kalan) olmali.',
    starter: ``,
    solution: `LDI R20, 95\nLDI R21, 10\nCLR R22\nL1: INC R22\n    SUB R20, R21\n    BRCC L1\n    DEC R22\n    ADD R20, R21\n`,
    check: (sim) => ({
      ok: sim.regs[22] === 9 && sim.regs[20] === 5,
      msg: `R22 (bolum) = 9 ve R20 (kalan) = 5 bekleniyordu, bulundu R22=${sim.regs[22]}, R20=${sim.regs[20]}`
    })
  },
  {
    id: 'p26',
    level: 'Orta',
    topic: 'arith',
    title: 'P26 — 16-bit toplama: 0x3CE7 + 0x3B8D',
    desc: 'R4:R3 = 0x3CE7, R2:R1 = 0x3B8D. Sonuc R4:R3 = 0x7874 olmali.',
    starter: ``,
    solution: `LDI R20, 0x8D\nMOV R1, R20\nLDI R20, 0x3B\nMOV R2, R20\nLDI R20, 0xE7\nMOV R3, R20\nLDI R20, 0x3C\nMOV R4, R20\n\nADD R3, R1\nADC R4, R2\n`,
    check: (sim) => ({
      ok: sim.regs[3] === 0x74 && sim.regs[4] === 0x78,
      msg: `R3 = 0x74 ve R4 = 0x78 bekleniyordu, bulundu R3=0x${sim.regs[3].toString(16)}, R4=0x${sim.regs[4].toString(16)}`
    })
  },
  {
    id: 'p27',
    level: 'Orta',
    topic: 'flags',
    title: 'P27 — R20\'nin 8 ile bolunup bolunmedigini kontrol et',
    desc: 'R20 = 24 olsun. Eger 8 ile bolunuyorsa R25 = 0xFF, degilse R25 = 0. (Ipucu: ANDI R20, 7 == 0 mi?)',
    starter: ``,
    solution: `LDI R20, 24\nMOV R21, R20\nANDI R21, 7\nBREQ DIV8\nLDI R25, 0\nRJMP DONE\nDIV8:\nLDI R25, 0xFF\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[25] === 0xFF, msg: `R25 = 0xFF bekleniyordu (24 % 8 = 0)` })
  },
  {
    id: 'p28',
    level: 'Orta',
    topic: 'stack',
    title: 'P28 — Iki sayinin maksimumunu bulan fonksiyon',
    desc: 'R20 = 17, R21 = 42. MAX fonksiyonu cagrildiktan sonra R20 = 42 olsun.',
    starter: ``,
    solution: `LDI R16, HIGH(RAMEND)\nOUT SPH, R16\nLDI R16, LOW(RAMEND)\nOUT SPL, R16\n\nLDI R20, 17\nLDI R21, 42\nCALL MAX\nRJMP END\n\nMAX:\n  CP R20, R21\n  BRSH OK       ; R20 >= R21 ise tamam\n  MOV R20, R21\nOK:\n  RET\nEND:\n`,
    check: (sim) => ({ ok: sim.regs[20] === 42, msg: `R20 = 42 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p29',
    level: 'Orta',
    topic: 'addressing',
    title: 'P29 — Bellegi 0x200..0x20F arasi 0xFF ile doldur',
    desc: 'X register\'i ile 16 hucreyi 0xFF yap.',
    starter: ``,
    solution: `LDI XL, 0x00\nLDI XH, 0x02\nLDI R19, 16\nLDI R16, 0xFF\nL1: ST X+, R16\n    DEC R19\n    BRNE L1\n`,
    check: (sim) => {
      for (let a = 0x200; a <= 0x20F; a++) {
        if (sim.readMem(a) !== 0xFF) return { ok: false, msg: `[0x${a.toString(16)}] = 0xFF olmali, bulundu 0x${sim.readMem(a).toString(16)}` };
      }
      return { ok: true };
    }
  },
  {
    id: 'p30',
    level: 'Orta',
    topic: 'arith',
    title: 'P30 — R20\'deki en yuksek (en soldaki) 1\'in pozisyonunu R21\'e yaz',
    desc: 'R20 = 0x20 (= 0b00100000), en yuksek 1 bit-5\'te. R21 = 5 olmali. (R20=0 ise R21=0xFF gibi ozel olsun, ama burada R20!=0 sayalim.)',
    starter: ``,
    solution: `LDI R20, 0x20\nLDI R21, 0xFF\nLDI R22, 8\nL1: INC R21\n    LSR R20\n    BRCC NEXT\n    MOV R23, R21\nNEXT:\n    DEC R22\n    BRNE L1\n; R23 son set bit pozisyonu — buraya R21'e koy\nMOV R21, R23\n`,
    check: (sim) => ({ ok: sim.regs[21] === 5, msg: `R21 = 5 bekleniyordu, bulundu ${sim.regs[21]}` })
  },

  // ====================== Zor (31-42) ======================
  {
    id: 'p31',
    level: 'Zor',
    topic: 'addressing',
    title: 'P31 — Bellek dizisindeki en buyuk sayiyi bul',
    desc: '0x100..0x107\'de degerler 15, 80, 23, 200, 7, 99, 156, 45. R20\'de maksimum olmali (200).',
    starter: `; bellegi onceden dolduralim\nLDI R16, 15\nSTS 0x100, R16\nLDI R16, 80\nSTS 0x101, R16\nLDI R16, 23\nSTS 0x102, R16\nLDI R16, 200\nSTS 0x103, R16\nLDI R16, 7\nSTS 0x104, R16\nLDI R16, 99\nSTS 0x105, R16\nLDI R16, 156\nSTS 0x106, R16\nLDI R16, 45\nSTS 0x107, R16\n\n; Sen burdan basla:\n`,
    solution: `LDI R16, 15\nSTS 0x100, R16\nLDI R16, 80\nSTS 0x101, R16\nLDI R16, 23\nSTS 0x102, R16\nLDI R16, 200\nSTS 0x103, R16\nLDI R16, 7\nSTS 0x104, R16\nLDI R16, 99\nSTS 0x105, R16\nLDI R16, 156\nSTS 0x106, R16\nLDI R16, 45\nSTS 0x107, R16\n\nLDI XL, 0x00\nLDI XH, 0x01\nLDI R19, 8\nCLR R20         ; maksimum, baslangic 0\nL1: LD R21, X+\n    CP R21, R20\n    BRLO SKIP\n    MOV R20, R21\nSKIP:\n    DEC R19\n    BRNE L1\n`,
    check: (sim) => ({ ok: sim.regs[20] === 200, msg: `R20 = 200 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p32',
    level: 'Zor',
    topic: 'arith',
    title: 'P32 — Checksum hesabi: 0x25, 0x62, 0x3F, 0x52 icin checksum byte\'i bul',
    desc: 'Topla, sonra 2\'nin tumleyenini al. Beklenen R20 = 0xE8.',
    starter: ``,
    solution: `LDI R20, 0x25\nLDI R16, 0x62\nADD R20, R16\nLDI R16, 0x3F\nADD R20, R16\nLDI R16, 0x52\nADD R20, R16\nNEG R20\n`,
    check: (sim) => ({ ok: sim.regs[20] === 0xE8, msg: `R20 = 0xE8 bekleniyordu, bulundu 0x${sim.regs[20].toString(16)}` })
  },
  {
    id: 'p33',
    level: 'Zor',
    topic: 'addressing',
    title: 'P33 — String uzunlugu (null-terminated)',
    desc: '0x300..\'den itibaren string: \'A\',\'B\',\'C\',\'D\',\'E\',0. R20\'de uzunluk 5 olmali.',
    starter: `; string dosyali\nLDI R16, 'A'\nSTS 0x300, R16\nLDI R16, 'B'\nSTS 0x301, R16\nLDI R16, 'C'\nSTS 0x302, R16\nLDI R16, 'D'\nSTS 0x303, R16\nLDI R16, 'E'\nSTS 0x304, R16\nLDI R16, 0\nSTS 0x305, R16\n\n; Senin kodun:\n`,
    solution: `LDI R16, 'A'\nSTS 0x300, R16\nLDI R16, 'B'\nSTS 0x301, R16\nLDI R16, 'C'\nSTS 0x302, R16\nLDI R16, 'D'\nSTS 0x303, R16\nLDI R16, 'E'\nSTS 0x304, R16\nLDI R16, 0\nSTS 0x305, R16\n\nLDI XL, 0x00\nLDI XH, 0x03\nCLR R20\nL1: LD R21, X+\n    CPI R21, 0\n    BREQ DONE\n    INC R20\n    RJMP L1\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[20] === 5, msg: `R20 = 5 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p34',
    level: 'Zor',
    topic: 'arith',
    title: 'P34 — Fibonacci 10. terim (F0=0, F1=1, ..., F10=55)',
    desc: 'R20 = F10 = 55 olmali.',
    starter: ``,
    solution: `LDI R20, 0      ; a\nLDI R21, 1      ; b\nLDI R22, 10     ; n\nL1: MOV R23, R20\n    ADD R23, R21  ; a+b\n    MOV R20, R21\n    MOV R21, R23\n    DEC R22\n    BRNE L1\n; R20 = F10\n`,
    check: (sim) => ({ ok: sim.regs[20] === 55, msg: `R20 = 55 bekleniyordu, bulundu ${sim.regs[20]}` })
  },
  {
    id: 'p35',
    level: 'Zor',
    topic: 'addressing',
    title: 'P35 — Dizi ters cevirme (in-place reverse)',
    desc: '0x100..0x104\'de 1, 2, 3, 4, 5 var. Ters cevir: 5, 4, 3, 2, 1.',
    starter: `LDI R16, 1\nSTS 0x100, R16\nLDI R16, 2\nSTS 0x101, R16\nLDI R16, 3\nSTS 0x102, R16\nLDI R16, 4\nSTS 0x103, R16\nLDI R16, 5\nSTS 0x104, R16\n\n; Senin kodun:\n`,
    solution: `LDI R16, 1\nSTS 0x100, R16\nLDI R16, 2\nSTS 0x101, R16\nLDI R16, 3\nSTS 0x102, R16\nLDI R16, 4\nSTS 0x103, R16\nLDI R16, 5\nSTS 0x104, R16\n\n; X = baslangic, Y = son\nLDI XL, 0x00\nLDI XH, 0x01\nLDI YL, 0x04\nLDI YH, 0x01\nLDI R19, 2       ; 5 eleman icin 2 takas yeter\nL1: LD R20, X\n    LD R21, Y\n    ST X, R21\n    ST Y, R20\n    INC XL\n    DEC YL\n    DEC R19\n    BRNE L1\n`,
    check: (sim) => {
      const want = [5,4,3,2,1];
      for (let i = 0; i < 5; i++) {
        if (sim.readMem(0x100+i) !== want[i]) return { ok: false, msg: `[0x10${i}] = ${want[i]} olmali, bulundu ${sim.readMem(0x100+i)}` };
      }
      return { ok: true };
    }
  },
  {
    id: 'p36',
    level: 'Zor',
    topic: 'arith',
    title: 'P36 — Faktoriyel: R20 = 5!, sonuc R21 = 120',
    desc: '5! = 5*4*3*2*1 = 120. AVR\'de carpma icin MUL yok kabul edelim — sirayla topla.',
    starter: ``,
    solution: `LDI R20, 5\nLDI R21, 1\nL1: MOV R22, R20    ; sayac (R20 kere R21 topla)\n    MOV R23, R21    ; carpilacak deger\n    CLR R21         ; sonuc\nIL: ADD R21, R23\n    DEC R22\n    BRNE IL\n    DEC R20\n    BRNE L1\n`,
    check: (sim) => ({ ok: sim.regs[21] === 120, msg: `R21 = 120 bekleniyordu, bulundu ${sim.regs[21]}` })
  },
  {
    id: 'p37',
    level: 'Zor',
    topic: 'io',
    title: 'P37 — PORTB\'yi 0\'dan 7\'ye kadar yansilat (0,1,2,...,7,0,1,...)',
    desc: 'Bu simulator timer kosturmadigi icin sadece son 5 turun simulasyonu — PORTB en son R20 ile 5 kez set edilsin. Beklenen: PORTB son degeri = 4 (5 kez basladiktan sonra).',
    starter: ``,
    solution: `LDI R20, 0xFF\nOUT DDRB, R20\nLDI R20, 0\nLDI R19, 5\nL1: OUT PORTB, R20\n    INC R20\n    DEC R19\n    BRNE L1\n; son OUT'tan sonra R20=5; ama OUT'tan sonra inc oldu, son yazilan 4\n`,
    check: (sim) => ({
      ok: sim.io[IO_ADDR.PORTB] === 4,
      msg: `PORTB son = 4 bekleniyordu, bulundu ${sim.io[IO_ADDR.PORTB]}`
    })
  },
  {
    id: 'p38',
    level: 'Zor',
    topic: 'stack',
    title: 'P38 — Recursive olmadan (loop) topla(n) = 1+2+...+n. R20=n, R21=sonuc',
    desc: 'R20 = 7 ile cagri sonrasi R21 = 28 olmali.',
    starter: ``,
    solution: `LDI R16, HIGH(RAMEND)\nOUT SPH, R16\nLDI R16, LOW(RAMEND)\nOUT SPL, R16\n\nLDI R20, 7\nCALL TOPLA_N\nRJMP END\n\nTOPLA_N:\n  CLR R21\n  MOV R22, R20\nL1: ADD R21, R22\n  DEC R22\n  BRNE L1\n  RET\nEND:\n`,
    check: (sim) => ({ ok: sim.regs[21] === 28, msg: `R21 = 28 bekleniyordu, bulundu ${sim.regs[21]}` })
  },
  {
    id: 'p39',
    level: 'Zor',
    topic: 'addressing',
    title: 'P39 — Iki dizinin element-element toplami',
    desc: '0x100..0x103 = 10,20,30,40 ve 0x110..0x113 = 5,15,25,35. Toplam 0x120..0x123 = 15,35,55,75 olsun.',
    starter: `LDI R16, 10\nSTS 0x100, R16\nLDI R16, 20\nSTS 0x101, R16\nLDI R16, 30\nSTS 0x102, R16\nLDI R16, 40\nSTS 0x103, R16\nLDI R16, 5\nSTS 0x110, R16\nLDI R16, 15\nSTS 0x111, R16\nLDI R16, 25\nSTS 0x112, R16\nLDI R16, 35\nSTS 0x113, R16\n\n; Senin kodun:\n`,
    solution: `LDI R16, 10\nSTS 0x100, R16\nLDI R16, 20\nSTS 0x101, R16\nLDI R16, 30\nSTS 0x102, R16\nLDI R16, 40\nSTS 0x103, R16\nLDI R16, 5\nSTS 0x110, R16\nLDI R16, 15\nSTS 0x111, R16\nLDI R16, 25\nSTS 0x112, R16\nLDI R16, 35\nSTS 0x113, R16\n\nLDI XL, 0x00\nLDI XH, 0x01    ; X = 0x100\nLDI YL, 0x10\nLDI YH, 0x01    ; Y = 0x110\nLDI ZL, 0x20\nLDI ZH, 0x01    ; Z = 0x120\nLDI R19, 4\nL1: LD R20, X+\n    LD R21, Y+\n    ADD R20, R21\n    ST Z+, R20\n    DEC R19\n    BRNE L1\n`,
    check: (sim) => {
      const want = [15,35,55,75];
      for (let i = 0; i < 4; i++) {
        if (sim.readMem(0x120+i) !== want[i]) return { ok: false, msg: `[0x12${i}] = ${want[i]} olmali, bulundu ${sim.readMem(0x120+i)}` };
      }
      return { ok: true };
    }
  },
  {
    id: 'p40',
    level: 'Zor',
    topic: 'arith',
    title: 'P40 — Bir byte\'ta belirli aralik kontrolu (10 ≤ R20 ≤ 20?)',
    desc: 'R20 = 15. Eger 10 ile 20 (dahil) arasinda ise R25 = 0xFF, degilse R25 = 0.',
    starter: ``,
    solution: `LDI R20, 15\nCPI R20, 10\nBRLO NO\nCPI R20, 21\nBRSH NO\nLDI R25, 0xFF\nRJMP DONE\nNO:\nLDI R25, 0\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[25] === 0xFF, msg: `R25 = 0xFF bekleniyordu (15 ∈ [10,20])` })
  },
  {
    id: 'p41',
    level: 'Zor',
    topic: 'io',
    title: 'P41 — PINC\'i oku, PORTB\'ye yaz (dugmeyi LED\'e yansit)',
    desc: 'Onceden simulatorde PINC = 0xA5 kuralim. PORTB sonunda 0xA5 olmali.',
    starter: `; PINC degerini elle ayarliyoruz (gercek donanimda dugmelerden gelir)\n; STS ile yazalim:\nLDI R16, 0xA5\nSTS 0x26, R16    ; 0x26 = PINC\n\n; Senin kodun:\n`,
    solution: `LDI R16, 0xA5\nSTS 0x26, R16\n\nLDI R20, 0xFF\nOUT DDRB, R20\nLDI R20, 0\nOUT DDRC, R20\nIN R20, PINC\nOUT PORTB, R20\n`,
    check: (sim) => ({
      ok: sim.io[IO_ADDR.PORTB] === 0xA5,
      msg: `PORTB = 0xA5 bekleniyordu, bulundu 0x${sim.io[IO_ADDR.PORTB].toString(16)}`
    })
  },
  {
    id: 'p42',
    level: 'Zor',
    topic: 'addressing',
    title: 'P42 — Asal mi? R20 = 17 ise R25 = 0xFF, degilse R25 = 0',
    desc: '2..(R20-1) arasi bolen olup olmadigini kontrol et. 17 asaldir → R25 = 0xFF.',
    starter: ``,
    solution: `LDI R20, 17\nLDI R25, 0xFF      ; asal varsay\nLDI R22, 2          ; bolen\nL1: CP R22, R20\n    BRSH DONE       ; R22 >= R20 ise bittik\n    MOV R23, R20    ; bolunen\nIL: SUB R23, R22\n    BREQ NOT_PRIME  ; tam boldu\n    BRCS PRIME_OK   ; negatife dustu, tam bolmedi\n    RJMP IL\nPRIME_OK:\n    INC R22\n    RJMP L1\nNOT_PRIME:\n    LDI R25, 0\nDONE:\n`,
    check: (sim) => ({ ok: sim.regs[25] === 0xFF, msg: `R25 = 0xFF bekleniyordu (17 asal)` })
  }
];

// ============================================================
// LAB CODES (Arduino C) — senaryo bazli, simulator yok
// ============================================================
const LAB_CODES = [
  {
    id: 'lab1',
    title: 'Lab 1 — Blink LED',
    desc: 'En klasik: pin 13\'teki LED\'i 1 saniye yak, 1 saniye sondur.',
    code: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
    explanation: `pinMode pini cikis yapar. digitalWrite HIGH = 5V, LOW = 0V. delay() blocklayici bekleme.`,
    challenge: `Cesitle: LED'i 250 ms acik, 750 ms kapali tut. Ayrica pin 13 yerine pin 9 kullan.`
  },
  {
    id: 'lab2',
    title: 'Lab 2 — Dugme okuma + LED kontrolu',
    desc: 'Dugmeye basinca LED yansin.',
    code: `const int LED = 13;\nconst int BTN = 2;\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  pinMode(BTN, INPUT_PULLUP);  // dahili pull-up\n}\nvoid loop() {\n  if (digitalRead(BTN) == LOW) {  // pull-up: basili = LOW\n    digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(LED, LOW);\n  }\n}`,
    explanation: `INPUT_PULLUP modunda pin normalde HIGH okur; dugmeye basilinca GND'ye cekilir → LOW okur. Yani 'LOW' demek 'basildi' demek.`,
    challenge: `2 dugme + 2 LED yap. Dugme A pin 2, dugme B pin 3; LED A pin 12, LED B pin 13. Her dugme kendi LED'ini kontrol etsin.`
  },
  {
    id: 'lab3',
    title: 'Lab 3 — Potansiyometre ile LED parlakligi (PWM)',
    desc: 'A0\'a baglanmis pot, pin 9 (PWM) uzerinden LED parlakligi.',
    code: `void setup() {\n  pinMode(9, OUTPUT);\n}\nvoid loop() {\n  int v = analogRead(A0);              // 0..1023\n  int brightness = map(v, 0, 1023, 0, 255);\n  analogWrite(9, brightness);          // PWM 0..255\n}`,
    explanation: `analogRead 10-bit (0-1023). PWM 8-bit (0-255). map() araliklari donusturur. analogWrite sadece PWM pinlerinde calisir (3,5,6,9,10,11).`,
    challenge: `LED yerine bir DC motor hizini ayarla (transistor + diot uzerinden). Ayrica Serial.println(brightness) ile degeri ekrana bas.`
  },
  {
    id: 'lab4',
    title: 'Lab 4 — Sicaklik sensoru LM35',
    desc: 'A0 pinine bagli LM35\'in olcumunu Celsius olarak yazdir.',
    code: `void setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  int raw = analogRead(A0);\n  float voltage = raw * (5.0 / 1024.0);\n  float celsius = voltage * 100.0;     // LM35: 10 mV/°C\n  Serial.print("Sicaklik: ");\n  Serial.print(celsius);\n  Serial.println(" C");\n  delay(500);\n}`,
    explanation: `LM35 cikisi 10 mV/°C. 25°C = 250 mV. ADC 10-bit, V_ref = 5V. Voltaj = raw * 5/1024. Celsius = voltaj * 100.`,
    challenge: `30°C ustunde bir buzzer'i (pin 8) ses cikar (tone(8, 1000)). Altinda sus (noTone(8)).`
  },
  {
    id: 'lab5',
    title: 'Lab 5 — LCD + Keypad',
    desc: 'Keypad\'den basilan tusu LCD\'ye yaz.',
    code: `#include <LiquidCrystal.h>\n#include <Keypad.h>\n\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n\nconst byte ROWS = 4, COLS = 3;\nchar keys[ROWS][COLS] = {\n  {'1','2','3'},\n  {'4','5','6'},\n  {'7','8','9'},\n  {'*','0','#'}\n};\nbyte rowPins[ROWS] = {9, 8, 7, 6};\nbyte colPins[COLS] = {A2, A1, A0};\nKeypad kp = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);\n\nvoid setup() {\n  lcd.begin(16, 2);\n  lcd.print("Bir tusa bas:");\n}\nvoid loop() {\n  char k = kp.getKey();\n  if (k) {\n    lcd.setCursor(0, 1);\n    lcd.print(k);\n  }\n}`,
    explanation: `LiquidCrystal pinleri: RS, E, D4-D7. lcd.begin(sutun, satir). Keypad kutuphanesi sutun/satir tarama yapar; getKey() basili tusu doner (yoksa NO_KEY).`,
    challenge: `Tuslari biriktirip "#" ile gonderilince LCD\'ye toplami yaz (basit hesap makinesi). 'C' tusu temizlesin.`
  },
  {
    id: 'lab6',
    title: 'Lab 6 — HC-SR04 ultrasonik mesafe',
    desc: 'Mesafeyi cm cinsinden seri porta yazdir.',
    code: `const int trig = 11, echo = 12;\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(trig, OUTPUT);\n  pinMode(echo, INPUT);\n}\nvoid loop() {\n  digitalWrite(trig, LOW); delayMicroseconds(5);\n  digitalWrite(trig, HIGH); delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  long duration = pulseIn(echo, HIGH);\n  long cm = duration / 58;\n  Serial.println(cm);\n  delay(200);\n}`,
    explanation: `trig'e 10 µs HIGH puls → modul 40 kHz ses yayar; echo'ya gelen pulsun suresi yolculuk suresi. cm = sure / 58 (cunku ses 343 m/s, gidip donus).`,
    challenge: `Mesafe 10 cm altina dustugunde bir LED yansin. 30 cm ustunde sonsin.`
  },
  {
    id: 'lab7',
    title: 'Lab 7 — Servo motoru salla',
    desc: 'Pin 9\'a bagli servo 0\'dan 180\'e ve geri salinsin.',
    code: `#include <Servo.h>\nServo s;\nvoid setup() { s.attach(9); }\nvoid loop() {\n  for (int a = 0; a <= 180; a++) { s.write(a); delay(15); }\n  for (int a = 180; a >= 0; a--) { s.write(a); delay(15); }\n}`,
    explanation: `Servo PWM ile aci kontrol eder; 1-2 ms genislikteki pulslara duyarli. Servo kutuphanesi bu detayi sakliyor; sen sadece write(aci) diyorsun.`,
    challenge: `Pot (A0) ile servonun acisini gercek zamanli kontrol et. pot 0-1023 → aci 0-180.`
  },
  {
    id: 'lab8',
    title: 'Lab 8 — ESP32 ile basit WiFi sunucu (taslak)',
    desc: 'ESP32 acilisinda WiFi\'a baglanip basit bir HTTP yaniti versin.',
    code: `#include <WiFi.h>\nconst char* ssid = "AGINIZIN_ADI";\nconst char* pass = "SIFRENIZ";\nWiFiServer server(80);\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, pass);\n  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }\n  Serial.println(WiFi.localIP());\n  server.begin();\n  pinMode(2, OUTPUT);\n}\nvoid loop() {\n  WiFiClient c = server.available();\n  if (c) {\n    String req = c.readStringUntil('\\r');\n    if (req.indexOf("/on") > 0)  digitalWrite(2, HIGH);\n    if (req.indexOf("/off") > 0) digitalWrite(2, LOW);\n    c.println("HTTP/1.1 200 OK\\nContent-Type: text/plain\\n\\nOK");\n    c.stop();\n  }\n}`,
    explanation: `ESP32 hem WiFi hem Bluetooth desteklenir. WiFiServer ile basit bir TCP sunucu acariz. Tarayicidan http://IP/on ve /off ile LED'i kontrol et.`,
    challenge: `Web sayfasinda iki tusla (ON / OFF) HTML uretsin. Hem GET URL'iyle hem dugmeyle calissin.`
  },
  {
    id: 'lab9',
    title: 'Lab 9 — Timer1 ile 1 saniye blink (interrupt)',
    desc: 'Polling olmadan, Timer1 kesmesi ile LED\'i toggle et.',
    code: `#include <avr/io.h>\n#include <avr/interrupt.h>\nvoid setup() {\n  pinMode(13, OUTPUT);\n  cli();\n  TCCR1A = 0;\n  TCCR1B = 0;\n  TCNT1 = 0;\n  OCR1A = 15624;                // 1 Hz @ 16MHz, prescaler 1024\n  TCCR1B |= (1 << WGM12);       // CTC mode\n  TCCR1B |= (1 << CS12) | (1 << CS10); // prescaler 1024\n  TIMSK1 |= (1 << OCIE1A);      // compare A interrupt\n  sei();\n}\nvoid loop() { /* serbest */ }\nISR(TIMER1_COMPA_vect) {\n  digitalWrite(13, !digitalRead(13));\n}`,
    explanation: `OCR1A = 15624 → (15624+1)/(16M/1024) = 1 saniye. CTC mod TCNT'yi otomatik sifirlar. ISR'da LED toggle. loop() bos kalabilir — kesme sayesinde polling gerekmez.`,
    challenge: `Iki LED ekle. Birini Timer1 ile 1 sn, digerini Timer0 overflow ile (cok daha hizli) toggle et. Pin 13 + pin 12.`
  },
  {
    id: 'lab10',
    title: 'Lab 10 — Seri porta echo (UART)',
    desc: 'Bilgisayardan gelen her karakteri geri gonder.',
    code: `void setup() {\n  Serial.begin(9600);\n  Serial.println("Hazirim!");\n}\nvoid loop() {\n  if (Serial.available()) {\n    char c = Serial.read();\n    Serial.print("Aldim: ");\n    Serial.println(c);\n  }\n}`,
    explanation: `Serial.begin baud rate ayarlar. Serial.available() bekleyen byte var mi? Serial.read() bir byte oku.`,
    challenge: `'+' alinca pin 13 LED'i yak, '-' alinca sondur, '?' alinca su anki LED durumunu yazdir.`
  }
];

window.LESSONS = LESSONS;
window.PROBLEMS = PROBLEMS;
window.LAB_CODES = LAB_CODES;
