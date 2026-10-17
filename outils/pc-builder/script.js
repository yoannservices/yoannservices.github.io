/* ───────────────────────────────────────────
   PC BUILDER PRO — SCRIPT
   ─────────────────────────────────────────── */

/* ══════════════ COMPONENTS DATABASE ══════════════ */

const PARTS = {
  cpu: [
    /* ── AMD Ryzen 5000 (AM4) — Budget ── */
    { id: 'r3-4100', name: 'AMD Ryzen 3 4100', socket: 'AM4', cores: 4, threads: 8, power: 65, gamingScore: 38, multiScore: 30, price: 69 },
    { id: 'r5-5500', name: 'AMD Ryzen 5 5500', socket: 'AM4', cores: 6, threads: 12, power: 65, gamingScore: 52, multiScore: 50, price: 89 },
    { id: 'r5-5600', name: 'AMD Ryzen 5 5600', socket: 'AM4', cores: 6, threads: 12, power: 65, gamingScore: 62, multiScore: 58, price: 109 },
    { id: 'r5-5600x', name: 'AMD Ryzen 5 5600X', socket: 'AM4', cores: 6, threads: 12, power: 65, gamingScore: 65, multiScore: 60, price: 129 },
    { id: 'r7-5700x', name: 'AMD Ryzen 7 5700X', socket: 'AM4', cores: 8, threads: 16, power: 65, gamingScore: 68, multiScore: 70, price: 159 },
    { id: 'r7-5800x3d', name: 'AMD Ryzen 7 5800X3D', socket: 'AM4', cores: 8, threads: 16, power: 105, gamingScore: 78, multiScore: 68, price: 249 },
    { id: 'r9-5900x', name: 'AMD Ryzen 9 5900X', socket: 'AM4', cores: 12, threads: 24, power: 105, gamingScore: 70, multiScore: 82, price: 279 },
    { id: 'r9-5950x', name: 'AMD Ryzen 9 5950X', socket: 'AM4', cores: 16, threads: 32, power: 105, gamingScore: 71, multiScore: 88, price: 349 },
    /* ── AMD Ryzen 7000 (AM5) — Mid/High ── */
    { id: 'r5-7500f', name: 'AMD Ryzen 5 7500F', socket: 'AM5', cores: 6, threads: 12, power: 65, gamingScore: 78, multiScore: 65, price: 169 },
    { id: 'r5-7600', name: 'AMD Ryzen 5 7600', socket: 'AM5', cores: 6, threads: 12, power: 65, gamingScore: 82, multiScore: 70, price: 219 },
    { id: 'r5-7600x', name: 'AMD Ryzen 5 7600X', socket: 'AM5', cores: 6, threads: 12, power: 105, gamingScore: 84, multiScore: 72, price: 239 },
    { id: 'r7-7700', name: 'AMD Ryzen 7 7700', socket: 'AM5', cores: 8, threads: 16, power: 65, gamingScore: 85, multiScore: 78, price: 269 },
    { id: 'r7-7700x', name: 'AMD Ryzen 7 7700X', socket: 'AM5', cores: 8, threads: 16, power: 105, gamingScore: 88, multiScore: 82, price: 299 },
    { id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D', socket: 'AM5', cores: 8, threads: 16, power: 120, gamingScore: 100, multiScore: 80, price: 389 },
    { id: 'r9-7900x', name: 'AMD Ryzen 9 7900X', socket: 'AM5', cores: 12, threads: 24, power: 170, gamingScore: 92, multiScore: 95, price: 449 },
    { id: 'r9-7950x', name: 'AMD Ryzen 9 7950X', socket: 'AM5', cores: 16, threads: 32, power: 170, gamingScore: 93, multiScore: 100, price: 569 },
    { id: 'r9-7950x3d', name: 'AMD Ryzen 9 7950X3D', socket: 'AM5', cores: 16, threads: 32, power: 120, gamingScore: 99, multiScore: 98, price: 619 },
    /* ── AMD Ryzen 9000 (AM5) — Dernier gen ── */
    { id: 'r5-9600x', name: 'AMD Ryzen 5 9600X', socket: 'AM5', cores: 6, threads: 12, power: 65, gamingScore: 88, multiScore: 75, price: 279 },
    { id: 'r7-9700x', name: 'AMD Ryzen 7 9700X', socket: 'AM5', cores: 8, threads: 16, power: 65, gamingScore: 93, multiScore: 85, price: 359 },
    { id: 'r9-9900x', name: 'AMD Ryzen 9 9900X', socket: 'AM5', cores: 12, threads: 24, power: 120, gamingScore: 95, multiScore: 97, price: 499 },
    { id: 'r9-9950x', name: 'AMD Ryzen 9 9950X', socket: 'AM5', cores: 16, threads: 32, power: 170, gamingScore: 96, multiScore: 100, price: 649 },
    /* ── Intel 12e gen (LGA1700) — Budget ── */
    { id: 'i3-12100f', name: 'Intel Core i3-12100F', socket: 'LGA1700', cores: 4, threads: 8, power: 89, gamingScore: 55, multiScore: 38, price: 89 },
    { id: 'i5-12400f', name: 'Intel Core i5-12400F', socket: 'LGA1700', cores: 6, threads: 12, power: 117, gamingScore: 68, multiScore: 58, price: 129 },
    { id: 'i5-12600kf', name: 'Intel Core i5-12600KF', socket: 'LGA1700', cores: 10, threads: 16, power: 150, gamingScore: 75, multiScore: 68, price: 179 },
    /* ── Intel 13e gen (LGA1700) — Mid ── */
    { id: 'i5-13400f', name: 'Intel Core i5-13400F', socket: 'LGA1700', cores: 10, threads: 16, power: 148, gamingScore: 72, multiScore: 65, price: 179 },
    { id: 'i5-13600kf', name: 'Intel Core i5-13600KF', socket: 'LGA1700', cores: 14, threads: 20, power: 181, gamingScore: 85, multiScore: 75, price: 259 },
    { id: 'i7-13700kf', name: 'Intel Core i7-13700KF', socket: 'LGA1700', cores: 16, threads: 24, power: 253, gamingScore: 90, multiScore: 88, price: 349 },
    { id: 'i9-13900k', name: 'Intel Core i9-13900K', socket: 'LGA1700', cores: 24, threads: 32, power: 253, gamingScore: 94, multiScore: 95, price: 499 },
    /* ── Intel 14e gen (LGA1700) — High ── */
    { id: 'i5-14400f', name: 'Intel Core i5-14400F', socket: 'LGA1700', cores: 10, threads: 16, power: 148, gamingScore: 74, multiScore: 67, price: 199 },
    { id: 'i5-14600k', name: 'Intel Core i5-14600K', socket: 'LGA1700', cores: 14, threads: 20, power: 181, gamingScore: 90, multiScore: 78, price: 319 },
    { id: 'i7-14700k', name: 'Intel Core i7-14700K', socket: 'LGA1700', cores: 20, threads: 28, power: 253, gamingScore: 96, multiScore: 92, price: 439 },
    { id: 'i9-14900k', name: 'Intel Core i9-14900K', socket: 'LGA1700', cores: 24, threads: 32, power: 253, gamingScore: 97, multiScore: 98, price: 599 },
    /* ── Intel Arrow Lake (LGA1851) — Dernier gen ── */
    { id: 'ultra5-245k', name: 'Intel Core Ultra 5 245K', socket: 'LGA1851', cores: 14, threads: 14, power: 125, gamingScore: 86, multiScore: 74, price: 329 },
    { id: 'ultra7-265k', name: 'Intel Core Ultra 7 265K', socket: 'LGA1851', cores: 20, threads: 20, power: 125, gamingScore: 92, multiScore: 88, price: 449 },
    { id: 'ultra9-285k', name: 'Intel Core Ultra 9 285K', socket: 'LGA1851', cores: 24, threads: 24, power: 125, gamingScore: 95, multiScore: 96, price: 619 }
  ],
  gpu: [
    /* ── NVIDIA Budget — GTX / RTX 30 ── */
    { id: 'gtx-1650', name: 'NVIDIA GTX 1650 4GB', vram: 4, power: 75, score: 18, length: 200, pins: 0, price: 139 },
    { id: 'gtx-1660s', name: 'NVIDIA GTX 1660 SUPER 6GB', vram: 6, power: 125, score: 26, length: 230, pins: 1, price: 179 },
    { id: 'rtx-3050', name: 'NVIDIA RTX 3050 8GB', vram: 8, power: 130, score: 30, length: 235, pins: 1, price: 199 },
    { id: 'rtx-3060', name: 'NVIDIA RTX 3060 12GB', vram: 12, power: 170, score: 40, length: 250, pins: 1, price: 249 },
    { id: 'rtx-3060ti', name: 'NVIDIA RTX 3060 Ti 8GB', vram: 8, power: 200, score: 48, length: 260, pins: 1, price: 289 },
    { id: 'rtx-3070', name: 'NVIDIA RTX 3070 8GB', vram: 8, power: 220, score: 52, length: 270, pins: 2, price: 329 },
    { id: 'rtx-3080', name: 'NVIDIA RTX 3080 10GB', vram: 10, power: 320, score: 62, length: 285, pins: 2, price: 419 },
    /* ── NVIDIA RTX 40 — Mid à Ultra ── */
    { id: 'rtx-4060', name: 'NVIDIA RTX 4060 8GB', vram: 8, power: 115, score: 55, length: 240, pins: 1, price: 309 },
    { id: 'rtx-4060ti8', name: 'NVIDIA RTX 4060 Ti 8GB', vram: 8, power: 160, score: 64, length: 260, pins: 1, price: 419 },
    { id: 'rtx-4060ti16', name: 'NVIDIA RTX 4060 Ti 16GB', vram: 16, power: 165, score: 66, length: 260, pins: 1, price: 469 },
    { id: 'rtx-4070', name: 'NVIDIA RTX 4070 12GB', vram: 12, power: 200, score: 74, length: 280, pins: 1, price: 549 },
    { id: 'rtx-4070s', name: 'NVIDIA RTX 4070 SUPER 12GB', vram: 12, power: 220, score: 82, length: 300, pins: 2, price: 619 },
    { id: 'rtx-4070ti', name: 'NVIDIA RTX 4070 Ti 12GB', vram: 12, power: 285, score: 86, length: 305, pins: 2, price: 719 },
    { id: 'rtx-4070tis', name: 'NVIDIA RTX 4070 Ti SUPER 16GB', vram: 16, power: 285, score: 90, length: 310, pins: 2, price: 819 },
    { id: 'rtx-4080', name: 'NVIDIA RTX 4080 16GB', vram: 16, power: 320, score: 93, length: 320, pins: 3, price: 949 },
    { id: 'rtx-4080s', name: 'NVIDIA RTX 4080 SUPER 16GB', vram: 16, power: 320, score: 95, length: 320, pins: 3, price: 1049 },
    { id: 'rtx-4090', name: 'NVIDIA RTX 4090 24GB', vram: 24, power: 450, score: 100, length: 336, pins: 4, price: 1599 },
    /* ── NVIDIA RTX 50 — Dernier gen ── */
    { id: 'rtx-5060', name: 'NVIDIA RTX 5060 8GB', vram: 8, power: 150, score: 68, length: 250, pins: 1, price: 399 },
    { id: 'rtx-5060ti', name: 'NVIDIA RTX 5060 Ti 16GB', vram: 16, power: 180, score: 78, length: 265, pins: 1, price: 499 },
    { id: 'rtx-5070', name: 'NVIDIA RTX 5070 12GB', vram: 12, power: 250, score: 92, length: 290, pins: 2, price: 599 },
    { id: 'rtx-5070ti', name: 'NVIDIA RTX 5070 Ti 16GB', vram: 16, power: 300, score: 96, length: 305, pins: 2, price: 799 },
    { id: 'rtx-5080', name: 'NVIDIA RTX 5080 16GB', vram: 16, power: 360, score: 98, length: 320, pins: 3, price: 1049 },
    { id: 'rtx-5090', name: 'NVIDIA RTX 5090 32GB', vram: 32, power: 575, score: 100, length: 340, pins: 4, price: 2049 },
    /* ── AMD Radeon Budget — RX 6000 ── */
    { id: 'rx-6500xt', name: 'AMD RX 6500 XT 4GB', vram: 4, power: 107, score: 15, length: 200, pins: 1, price: 109 },
    { id: 'rx-6600', name: 'AMD RX 6600 8GB', vram: 8, power: 132, score: 32, length: 235, pins: 1, price: 179 },
    { id: 'rx-6650xt', name: 'AMD RX 6650 XT 8GB', vram: 8, power: 180, score: 38, length: 250, pins: 1, price: 219 },
    { id: 'rx-6700xt', name: 'AMD RX 6700 XT 12GB', vram: 12, power: 230, score: 44, length: 267, pins: 1, price: 269 },
    { id: 'rx-6750xt', name: 'AMD RX 6750 XT 12GB', vram: 12, power: 250, score: 48, length: 270, pins: 2, price: 299 },
    { id: 'rx-6800xt', name: 'AMD RX 6800 XT 16GB', vram: 16, power: 300, score: 58, length: 290, pins: 2, price: 379 },
    /* ── AMD Radeon RX 7000 — Mid à High ── */
    { id: 'rx-7600', name: 'AMD RX 7600 8GB', vram: 8, power: 165, score: 42, length: 240, pins: 1, price: 259 },
    { id: 'rx-7700xt', name: 'AMD RX 7700 XT 12GB', vram: 12, power: 245, score: 65, length: 280, pins: 2, price: 399 },
    { id: 'rx-7800xt', name: 'AMD RX 7800 XT 16GB', vram: 16, power: 263, score: 76, length: 300, pins: 2, price: 489 },
    { id: 'rx-7900gre', name: 'AMD RX 7900 GRE 16GB', vram: 16, power: 260, score: 84, length: 320, pins: 2, price: 569 },
    { id: 'rx-7900xt', name: 'AMD RX 7900 XT 20GB', vram: 20, power: 315, score: 90, length: 325, pins: 3, price: 749 },
    { id: 'rx-7900xtx', name: 'AMD RX 7900 XTX 24GB', vram: 24, power: 355, score: 96, length: 330, pins: 3, price: 899 },
    /* ── AMD Radeon RX 9000 — Dernier gen ── */
    { id: 'rx-9060xt', name: 'AMD RX 9060 XT 16GB', vram: 16, power: 150, score: 72, length: 250, pins: 1, price: 399 },
    { id: 'rx-9070', name: 'AMD RX 9070 16GB', vram: 16, power: 200, score: 88, length: 280, pins: 2, price: 549 },
    { id: 'rx-9070xt', name: 'AMD RX 9070 XT 16GB', vram: 16, power: 250, score: 94, length: 300, pins: 2, price: 649 },
    /* ── Intel Arc — Budget/Mid ── */
    { id: 'arc-a580', name: 'Intel Arc A580 8GB', vram: 8, power: 185, score: 28, length: 245, pins: 1, price: 169 },
    { id: 'arc-a750', name: 'Intel Arc A750 8GB', vram: 8, power: 225, score: 35, length: 260, pins: 1, price: 199 },
    { id: 'arc-a770', name: 'Intel Arc A770 16GB', vram: 16, power: 225, score: 40, length: 270, pins: 1, price: 249 },
    { id: 'arc-b580', name: 'Intel Arc B580 12GB', vram: 12, power: 190, score: 52, length: 255, pins: 1, price: 259 }
  ],
  motherboard: [
    /* ── AM4 — Budget ── */
    { id: 'a520m-ds3h', name: 'Gigabyte A520M DS3H (mATX)', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 4733, form: 'mATX', nvme: 1, price: 59 },
    { id: 'b450-tomahawk', name: 'MSI B450 TOMAHAWK MAX II', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 4533, form: 'ATX', nvme: 1, price: 79 },
    { id: 'b550m-mortar', name: 'MSI MAG B550M MORTAR (mATX)', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 5100, form: 'mATX', nvme: 2, price: 109 },
    { id: 'b550-tomahawk', name: 'MSI MAG B550 TOMAHAWK', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 5100, form: 'ATX', nvme: 2, price: 139 },
    { id: 'b550-strix', name: 'ASUS ROG STRIX B550-F GAMING WIFI', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 5100, form: 'ATX', nvme: 2, price: 169 },
    { id: 'x570-tuf', name: 'ASUS TUF X570-PLUS WIFI', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 5100, form: 'ATX', nvme: 2, price: 189 },
    { id: 'x570e-strix', name: 'ASUS ROG STRIX X570-E GAMING', socket: 'AM4', ram: 'DDR4', maxRam: 128, maxSpeed: 5100, form: 'ATX', nvme: 3, price: 259 },
    /* ── AM5 — Mid/High ── */
    { id: 'a620m-ds3h', name: 'Gigabyte A620M DS3H (mATX)', socket: 'AM5', ram: 'DDR5', maxRam: 128, maxSpeed: 5600, form: 'mATX', nvme: 1, price: 89 },
    { id: 'b650m-wifi', name: 'MSI B650M PRO WIFI (mATX)', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 6400, form: 'mATX', nvme: 2, price: 149 },
    { id: 'b650m-mortar', name: 'MSI MAG B650M MORTAR WIFI (mATX)', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 6400, form: 'mATX', nvme: 2, price: 179 },
    { id: 'b650-ax', name: 'ASUS TUF B650-PLUS WIFI', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 6400, form: 'ATX', nvme: 3, price: 219 },
    { id: 'b650-aorus', name: 'Gigabyte B650 AORUS ELITE AX', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 6600, form: 'ATX', nvme: 3, price: 239 },
    { id: 'x670e-pg', name: 'ASRock X670E PG Lightning', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 6800, form: 'ATX', nvme: 3, price: 289 },
    { id: 'x670e-taichi', name: 'ASRock X670E Taichi', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 7200, form: 'ATX', nvme: 4, price: 399 },
    { id: 'x670e', name: 'ASUS ROG STRIX X670E-E', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 7200, form: 'ATX', nvme: 4, price: 469 },
    { id: 'x670e-ace', name: 'MSI MEG X670E ACE', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 7200, form: 'ATX', nvme: 5, price: 549 },
    { id: 'x870e-hero', name: 'ASUS ROG CROSSHAIR X870E HERO', socket: 'AM5', ram: 'DDR5', maxRam: 192, maxSpeed: 8000, form: 'ATX', nvme: 5, price: 629 },
    /* ── LGA1700 — Budget à High ── */
    { id: 'h610m-ds2h', name: 'Gigabyte H610M S2H (mATX)', socket: 'LGA1700', ram: 'DDR4', maxRam: 64, maxSpeed: 3200, form: 'mATX', nvme: 1, price: 69 },
    { id: 'b660m-mortar', name: 'MSI MAG B660M MORTAR WIFI (mATX)', socket: 'LGA1700', ram: 'DDR4', maxRam: 128, maxSpeed: 4800, form: 'mATX', nvme: 2, price: 119 },
    { id: 'h670-pg', name: 'ASRock H670 PG Riptide', socket: 'LGA1700', ram: 'DDR4', maxRam: 128, maxSpeed: 4800, form: 'ATX', nvme: 3, price: 139 },
    { id: 'b760m-mortar', name: 'MSI MAG B760M MORTAR WIFI DDR5 (mATX)', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 7000, form: 'mATX', nvme: 2, price: 169 },
    { id: 'b760-elite', name: 'Gigabyte B760 AORUS ELITE AX DDR5', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 7600, form: 'ATX', nvme: 3, price: 199 },
    { id: 'b760-strix', name: 'ASUS ROG STRIX B760-F GAMING WIFI', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 7800, form: 'ATX', nvme: 3, price: 249 },
    { id: 'z790-tom', name: 'MSI MAG Z790 TOMAHAWK', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 7800, form: 'ATX', nvme: 4, price: 349 },
    { id: 'z790-strix', name: 'ASUS ROG STRIX Z790-A GAMING WIFI', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 7800, form: 'ATX', nvme: 4, price: 399 },
    { id: 'z790-hero', name: 'ASUS ROG MAXIMUS Z790 HERO', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 8000, form: 'ATX', nvme: 5, price: 629 },
    { id: 'z790-godlike', name: 'MSI MEG Z790 GODLIKE', socket: 'LGA1700', ram: 'DDR5', maxRam: 192, maxSpeed: 8000, form: 'E-ATX', nvme: 5, price: 849 },
    /* ── LGA1851 (Arrow Lake) ── */
    { id: 'b860m-mortar', name: 'MSI MAG B860M MORTAR WIFI (mATX)', socket: 'LGA1851', ram: 'DDR5', maxRam: 192, maxSpeed: 7200, form: 'mATX', nvme: 2, price: 199 },
    { id: 'b860-tomahawk', name: 'MSI MAG B860 TOMAHAWK WIFI', socket: 'LGA1851', ram: 'DDR5', maxRam: 192, maxSpeed: 7600, form: 'ATX', nvme: 3, price: 249 },
    { id: 'z890-strix', name: 'ASUS ROG STRIX Z890-A GAMING WIFI', socket: 'LGA1851', ram: 'DDR5', maxRam: 192, maxSpeed: 8400, form: 'ATX', nvme: 4, price: 399 },
    { id: 'z890-taichi', name: 'ASRock Z890 Taichi', socket: 'LGA1851', ram: 'DDR5', maxRam: 192, maxSpeed: 8600, form: 'ATX', nvme: 5, price: 529 },
    { id: 'z890-hero', name: 'ASUS ROG MAXIMUS Z890 HERO', socket: 'LGA1851', ram: 'DDR5', maxRam: 192, maxSpeed: 9066, form: 'ATX', nvme: 5, price: 699 }
  ],
  ram: [
    /* ── DDR4 — Budget ── */
    { id: 'ram-8-3200d4', name: 'Corsair Vengeance LPX 8GB DDR4-3200', type: 'DDR4', speed: 3200, capacity: 8, price: 19 },
    { id: 'ram-16-3200d4', name: 'Corsair Vengeance LPX 16GB (2x8) DDR4-3200', type: 'DDR4', speed: 3200, capacity: 16, price: 35 },
    { id: 'ram-16-3600d4', name: 'G.Skill Ripjaws V 16GB (2x8) DDR4-3600', type: 'DDR4', speed: 3600, capacity: 16, price: 45 },
    { id: 'ram-32-3200d4', name: 'Corsair Vengeance LPX 32GB (2x16) DDR4-3200', type: 'DDR4', speed: 3200, capacity: 32, price: 59 },
    { id: 'ram-32-3600d4', name: 'G.Skill Trident Z Neo 32GB (2x16) DDR4-3600', type: 'DDR4', speed: 3600, capacity: 32, price: 79 },
    { id: 'ram-64-3200d4', name: 'Corsair Vengeance LPX 64GB (2x32) DDR4-3200', type: 'DDR4', speed: 3200, capacity: 64, price: 109 },
    { id: 'ram-64-3600d4', name: 'G.Skill Trident Z Neo 64GB (2x32) DDR4-3600', type: 'DDR4', speed: 3600, capacity: 64, price: 139 },
    { id: 'ram-128-3200d4', name: 'Kingston FURY 128GB (4x32) DDR4-3200', type: 'DDR4', speed: 3200, capacity: 128, price: 219 },
    /* ── DDR5 — Mid à High ── */
    { id: 'ram-16-4800', name: 'Kingston FURY Beast 16GB DDR5-4800', type: 'DDR5', speed: 4800, capacity: 16, price: 39 },
    { id: 'ram-16-5600', name: 'Corsair Vengeance 16GB DDR5-5600', type: 'DDR5', speed: 5600, capacity: 16, price: 49 },
    { id: 'ram-32-5200', name: 'Kingston FURY Beast 32GB (2x16) DDR5-5200', type: 'DDR5', speed: 5200, capacity: 32, price: 79 },
    { id: 'ram-32-5600', name: 'Corsair Vengeance 32GB (2x16) DDR5-5600', type: 'DDR5', speed: 5600, capacity: 32, price: 89 },
    { id: 'ram-32-6000', name: 'Corsair Vengeance 32GB (2x16) DDR5-6000', type: 'DDR5', speed: 6000, capacity: 32, price: 109 },
    { id: 'ram-32-6000cl30', name: 'G.Skill Flare X5 32GB (2x16) DDR5-6000 CL30', type: 'DDR5', speed: 6000, capacity: 32, price: 119 },
    { id: 'ram-32-6400', name: 'G.Skill Trident Z5 32GB (2x16) DDR5-6400', type: 'DDR5', speed: 6400, capacity: 32, price: 139 },
    { id: 'ram-32-7200', name: 'G.Skill Trident Z5 Royal 32GB (2x16) DDR5-7200', type: 'DDR5', speed: 7200, capacity: 32, price: 179 },
    { id: 'ram-32-8000', name: 'G.Skill Trident Z5 32GB (2x16) DDR5-8000', type: 'DDR5', speed: 8000, capacity: 32, price: 229 },
    { id: 'ram-48-6000', name: 'Corsair Vengeance 48GB (2x24) DDR5-6000', type: 'DDR5', speed: 6000, capacity: 48, price: 159 },
    { id: 'ram-48-7200', name: 'G.Skill Trident Z5 48GB (2x24) DDR5-7200', type: 'DDR5', speed: 7200, capacity: 48, price: 209 },
    { id: 'ram-64-5600', name: 'Kingston FURY Beast 64GB (2x32) DDR5-5600', type: 'DDR5', speed: 5600, capacity: 64, price: 179 },
    { id: 'ram-64-6000', name: 'Kingston FURY Beast 64GB (2x32) DDR5-6000', type: 'DDR5', speed: 6000, capacity: 64, price: 229 },
    { id: 'ram-64-6400', name: 'G.Skill Trident Z5 64GB (2x32) DDR5-6400', type: 'DDR5', speed: 6400, capacity: 64, price: 279 },
    { id: 'ram-64-7200', name: 'G.Skill Trident Z5 64GB (2x32) DDR5-7200', type: 'DDR5', speed: 7200, capacity: 64, price: 349 },
    { id: 'ram-96-6000', name: 'Corsair Vengeance 96GB (2x48) DDR5-6000', type: 'DDR5', speed: 6000, capacity: 96, price: 329 },
    { id: 'ram-128-5600', name: 'Kingston FURY Beast 128GB (4x32) DDR5-5600', type: 'DDR5', speed: 5600, capacity: 128, price: 449 },
    { id: 'ram-128-6000', name: 'G.Skill Trident Z5 128GB (4x32) DDR5-6000', type: 'DDR5', speed: 6000, capacity: 128, price: 549 },
    { id: 'ram-192-5600', name: 'Kingston FURY 192GB (4x48) DDR5-5600', type: 'DDR5', speed: 5600, capacity: 192, price: 699 }
  ],
  storage: [
    /* ── HDD — Stockage masse ── */
    { id: 'hdd-1t', name: 'Seagate Barracuda 1TB HDD 7200rpm', type: 'SATA', capacity: 1000, speed: 210, power: 8, price: 39 },
    { id: 'hdd-2t', name: 'Seagate Barracuda 2TB HDD 7200rpm', type: 'SATA', capacity: 2000, speed: 210, power: 8, price: 55 },
    { id: 'hdd-4t', name: 'WD Blue 4TB HDD 5400rpm', type: 'SATA', capacity: 4000, speed: 180, power: 6, price: 79 },
    { id: 'hdd-8t', name: 'Seagate Barracuda 8TB HDD', type: 'SATA', capacity: 8000, speed: 210, power: 10, price: 129 },
    /* ── SSD SATA — Budget ── */
    { id: 'bx500-240', name: 'Crucial BX500 240GB SATA', type: 'SATA', capacity: 240, speed: 540, power: 3, price: 25 },
    { id: 'bx500-500', name: 'Crucial BX500 500GB SATA', type: 'SATA', capacity: 500, speed: 540, power: 3, price: 35 },
    { id: '870evo-500', name: 'Samsung 870 EVO 500GB SATA', type: 'SATA', capacity: 500, speed: 560, power: 4, price: 49 },
    { id: '870evo-1t', name: 'Samsung 870 EVO 1TB SATA', type: 'SATA', capacity: 1000, speed: 560, power: 4, price: 79 },
    { id: 'mx500-1t', name: 'Crucial MX500 1TB SATA', type: 'SATA', capacity: 1000, speed: 560, power: 4, price: 69 },
    { id: 'mx500-2t', name: 'Crucial MX500 2TB SATA', type: 'SATA', capacity: 2000, speed: 560, power: 4, price: 119 },
    { id: '870evo-2t', name: 'Samsung 870 EVO 2TB SATA', type: 'SATA', capacity: 2000, speed: 560, power: 4, price: 139 },
    { id: '870evo-4t', name: 'Samsung 870 EVO 4TB SATA', type: 'SATA', capacity: 4000, speed: 560, power: 4, price: 249 },
    /* ── NVMe Gen3 — Budget ── */
    { id: 'sn570-500', name: 'WD Blue SN570 500GB NVMe Gen3', type: 'NVMe', capacity: 500, speed: 3500, power: 4, price: 35 },
    { id: 'sn570-1t', name: 'WD Blue SN570 1TB NVMe Gen3', type: 'NVMe', capacity: 1000, speed: 3500, power: 4, price: 55 },
    { id: '980-1t', name: 'Samsung 980 1TB NVMe Gen3', type: 'NVMe', capacity: 1000, speed: 3500, power: 5, price: 59 },
    { id: 'p3-2t', name: 'Crucial P3 2TB NVMe Gen3', type: 'NVMe', capacity: 2000, speed: 3500, power: 5, price: 89 },
    /* ── NVMe Gen4 — Mid ── */
    { id: 'sn770-500', name: 'WD Black SN770 500GB NVMe Gen4', type: 'NVMe', capacity: 500, speed: 5150, power: 6, price: 45 },
    { id: 'sn770-1t', name: 'WD Black SN770 1TB NVMe Gen4', type: 'NVMe', capacity: 1000, speed: 5150, power: 6, price: 79 },
    { id: 'sn770-2t', name: 'WD Black SN770 2TB NVMe Gen4', type: 'NVMe', capacity: 2000, speed: 5150, power: 6, price: 129 },
    { id: '990evo-1t', name: 'Samsung 990 EVO 1TB NVMe Gen4', type: 'NVMe', capacity: 1000, speed: 5000, power: 7, price: 89 },
    { id: '990evo-2t', name: 'Samsung 990 EVO 2TB NVMe Gen4', type: 'NVMe', capacity: 2000, speed: 5000, power: 7, price: 139 },
    { id: '990pro-1t', name: 'Samsung 990 PRO 1TB NVMe Gen4', type: 'NVMe', capacity: 1000, speed: 7450, power: 8, price: 109 },
    { id: '990pro-2t', name: 'Samsung 990 PRO 2TB NVMe Gen4', type: 'NVMe', capacity: 2000, speed: 7450, power: 8, price: 179 },
    { id: '990pro-4t', name: 'Samsung 990 PRO 4TB NVMe Gen4', type: 'NVMe', capacity: 4000, speed: 7450, power: 8, price: 319 },
    { id: 'p5p-1t', name: 'Crucial T500 1TB NVMe Gen4', type: 'NVMe', capacity: 1000, speed: 7300, power: 8, price: 99 },
    { id: 'p5p-2t', name: 'Crucial T500 2TB NVMe Gen4', type: 'NVMe', capacity: 2000, speed: 7300, power: 8, price: 159 },
    { id: 'firecuda-530-1t', name: 'Seagate Firecuda 530 1TB NVMe Gen4', type: 'NVMe', capacity: 1000, speed: 7300, power: 7, price: 109 },
    { id: 'firecuda-530-2t', name: 'Seagate Firecuda 530 2TB NVMe Gen4', type: 'NVMe', capacity: 2000, speed: 7300, power: 7, price: 169 },
    /* ── NVMe Gen5 — High-end ── */
    { id: 't700-1t', name: 'Crucial T700 1TB NVMe Gen5', type: 'NVMe', capacity: 1000, speed: 12400, power: 12, price: 159 },
    { id: 't700-2t', name: 'Crucial T700 2TB NVMe Gen5', type: 'NVMe', capacity: 2000, speed: 12400, power: 12, price: 249 },
    { id: 't700-4t', name: 'Crucial T700 4TB NVMe Gen5', type: 'NVMe', capacity: 4000, speed: 12400, power: 12, price: 449 },
    { id: '990evop-1t', name: 'Samsung 990 EVO Plus 1TB NVMe Gen5', type: 'NVMe', capacity: 1000, speed: 10000, power: 10, price: 119 },
    { id: '990evop-2t', name: 'Samsung 990 EVO Plus 2TB NVMe Gen5', type: 'NVMe', capacity: 2000, speed: 10000, power: 10, price: 179 },
    { id: 'sn850x-1t', name: 'WD Black SN850X 1TB NVMe Gen4', type: 'NVMe', capacity: 1000, speed: 7300, power: 8, price: 99 },
    { id: 'sn850x-2t', name: 'WD Black SN850X 2TB NVMe Gen4', type: 'NVMe', capacity: 2000, speed: 7300, power: 8, price: 159 },
    { id: 'sn850x-4t', name: 'WD Black SN850X 4TB NVMe Gen4', type: 'NVMe', capacity: 4000, speed: 7300, power: 9, price: 329 }
  ],
  cooler: [
    /* ── Ventilateurs Budget ── */
    { id: 'gammaxx400', name: 'DeepCool GAMMAXX 400 V2', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 180, height: 154, isAio: false, price: 19 },
    { id: 'hyper212', name: 'Cooler Master Hyper 212 EVO V2', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 200, height: 159, isAio: false, price: 29 },
    { id: 'freezer34', name: 'Arctic Freezer 34 eSports DUO', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 210, height: 157, isAio: false, price: 35 },
    { id: 'ak400', name: 'DeepCool AK400', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 220, height: 155, isAio: false, price: 29 },
    /* ── Ventilateurs Mid ── */
    { id: 'ak500', name: 'DeepCool AK500', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 240, height: 164, isAio: false, price: 45 },
    { id: 'pa120', name: 'Thermalright Peerless Assassin 120', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 260, height: 157, isAio: false, price: 39 },
    { id: 'ak620', name: 'DeepCool AK620', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 260, height: 160, isAio: false, price: 55 },
    { id: 'fuma3', name: 'Scythe Fuma 3', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 260, height: 159, isAio: false, price: 49 },
    { id: 'darkrock4', name: 'be quiet! Dark Rock 4', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 250, height: 159, isAio: false, price: 69 },
    /* ── Ventilateurs High ── */
    { id: 'nh-u12s', name: 'Noctua NH-U12S chromax', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 220, height: 158, isAio: false, price: 79 },
    { id: 'darkrockpro5', name: 'be quiet! Dark Rock Pro 5', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 270, height: 168, isAio: false, price: 89 },
    { id: 'nh-d15', name: 'Noctua NH-D15', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 260, height: 165, isAio: false, price: 109 },
    { id: 'nh-d15g2', name: 'Noctua NH-D15 G2', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 280, height: 168, isAio: false, price: 129 },
    /* ── AIO 120mm ── */
    { id: 'aio120-h60', name: 'Corsair H60x RGB 120mm AIO', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 200, height: 55, isAio: true, price: 69 },
    /* ── AIO 240mm ── */
    { id: 'aio-240', name: 'Arctic Liquid Freezer III 240', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 280, height: 55, isAio: true, price: 89 },
    { id: 'aio240-h100', name: 'Corsair H100x RGB 240mm AIO', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 270, height: 55, isAio: true, price: 99 },
    { id: 'aio240-kraken', name: 'NZXT Kraken 240 RGB', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 280, height: 55, isAio: true, price: 129 },
    /* ── AIO 280mm ── */
    { id: 'aio280-arctic', name: 'Arctic Liquid Freezer III 280', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 320, height: 55, isAio: true, price: 99 },
    { id: 'aio280-kraken', name: 'NZXT Kraken 280', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 320, height: 55, isAio: true, price: 149 },
    /* ── AIO 360mm ── */
    { id: 'aio-360', name: 'Arctic Liquid Freezer III 360', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 350, height: 55, isAio: true, price: 119 },
    { id: 'aio360-h150', name: 'Corsair H150i ELITE 360mm', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 350, height: 55, isAio: true, price: 159 },
    { id: 'kraken-360', name: 'NZXT Kraken 360 RGB', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 350, height: 55, isAio: true, price: 199 },
    { id: 'aio360-galahad', name: 'Lian Li Galahad II Trinity 360', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 350, height: 55, isAio: true, price: 179 },
    /* ── AIO 420mm ── */
    { id: 'aio420-arctic', name: 'Arctic Liquid Freezer III 420', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 400, height: 55, isAio: true, price: 139 },
    { id: 'aio420-galahad', name: 'Lian Li Galahad II Trinity 420', sockets: ['AM4','AM5','LGA1700','LGA1851'], maxTdp: 400, height: 55, isAio: true, price: 199 }
  ],
  psu: [
    /* ── 400-500W — Budget ── */
    { id: 'psu-400', name: 'EVGA 400 N1 400W', wattage: 400, pins: 1, rating: 'Blanc', price: 29 },
    { id: 'psu-450b', name: 'EVGA 450 BR 450W Bronze', wattage: 450, pins: 1, rating: 'Bronze', price: 39 },
    { id: 'psu-500b', name: 'Corsair CV500 500W Bronze', wattage: 500, pins: 2, rating: 'Bronze', price: 45 },
    { id: 'psu-550b', name: 'Corsair CX550M 550W Bronze', wattage: 550, pins: 2, rating: 'Bronze', price: 55 },
    /* ── 550-650W — Mid/Budget ── */
    { id: 'psu-550g', name: 'Corsair RM550e 550W Gold', wattage: 550, pins: 2, rating: 'Gold', price: 79 },
    { id: 'psu-600b', name: 'be quiet! System Power 10 600W Bronze', wattage: 600, pins: 2, rating: 'Bronze', price: 59 },
    { id: 'psu-650b', name: 'Cooler Master MWE 650 Bronze V2', wattage: 650, pins: 2, rating: 'Bronze', price: 65 },
    { id: 'psu-650g', name: 'Corsair RM650e 650W Gold', wattage: 650, pins: 2, rating: 'Gold', price: 89 },
    { id: 'psu-650gx', name: 'Seasonic Focus GX-650 Gold', wattage: 650, pins: 2, rating: 'Gold', price: 99 },
    /* ── 700-750W — Mid ── */
    { id: 'psu-700b', name: 'be quiet! System Power 10 700W Bronze', wattage: 700, pins: 3, rating: 'Bronze', price: 69 },
    { id: 'psu-750g', name: 'be quiet! Pure Power 12M 750W Gold', wattage: 750, pins: 3, rating: 'Gold', price: 109 },
    { id: 'psu-750gx', name: 'Seasonic Focus GX-750 Gold', wattage: 750, pins: 3, rating: 'Gold', price: 119 },
    { id: 'psu-750rm', name: 'Corsair RM750x 750W Gold', wattage: 750, pins: 3, rating: 'Gold', price: 129 },
    /* ── 850W — High-mid ── */
    { id: 'psu-850g', name: 'be quiet! Pure Power 12M 850W Gold', wattage: 850, pins: 4, rating: 'Gold', price: 139 },
    { id: 'psu-850gx', name: 'Seasonic Focus GX-850 Gold', wattage: 850, pins: 4, rating: 'Gold', price: 159 },
    { id: 'psu-850rm', name: 'Corsair RM850x 850W Gold', wattage: 850, pins: 4, rating: 'Gold', price: 159 },
    { id: 'psu-850pl', name: 'Seasonic Focus PX-850 Platinum', wattage: 850, pins: 4, rating: 'Platinum', price: 189 },
    /* ── 1000W — High ── */
    { id: 'psu-1000g', name: 'Corsair RM1000x 1000W Gold', wattage: 1000, pins: 5, rating: 'Gold', price: 189 },
    { id: 'psu-1000gx', name: 'Seasonic Focus GX-1000 Gold', wattage: 1000, pins: 5, rating: 'Gold', price: 199 },
    { id: 'psu-1000rm', name: 'be quiet! Straight Power 12 1000W Platinum', wattage: 1000, pins: 5, rating: 'Platinum', price: 219 },
    { id: 'psu-1000t', name: 'Corsair AX1000 1000W Titanium', wattage: 1000, pins: 5, rating: 'Titanium', price: 279 },
    /* ── 1200W+ — Ultra ── */
    { id: 'psu-1200g', name: 'Corsair RM1200x SHIFT 1200W Gold', wattage: 1200, pins: 6, rating: 'Gold', price: 249 },
    { id: 'psu-1200t', name: 'be quiet! Dark Power 13 1200W Titanium', wattage: 1200, pins: 6, rating: 'Titanium', price: 349 },
    { id: 'psu-1300g', name: 'Seasonic VERTEX GX-1300 Gold', wattage: 1300, pins: 6, rating: 'Gold', price: 289 },
    { id: 'psu-1500t', name: 'Corsair AX1500i 1500W Titanium', wattage: 1500, pins: 6, rating: 'Titanium', price: 449 },
    { id: 'psu-1600t', name: 'be quiet! Dark Power 13 1600W Titanium', wattage: 1600, pins: 6, rating: 'Titanium', price: 499 }
  ],
  pcCase: [
    /* ── mATX Budget ── */
    { id: 'nr400', name: 'Cooler Master MasterBox NR400', gpuMax: 350, coolerMax: 166, forms: ['mATX'], price: 49 },
    { id: 'versa-h18', name: 'Thermaltake Versa H18 (mATX)', gpuMax: 350, coolerMax: 155, forms: ['mATX'], price: 39 },
    { id: 'q300l', name: 'Cooler Master Q300L V2 (mATX)', gpuMax: 360, coolerMax: 159, forms: ['mATX'], price: 69 },
    { id: 'meshify-c-mini', name: 'Fractal Design Meshify C Mini (mATX)', gpuMax: 350, coolerMax: 172, forms: ['mATX'], price: 89 },
    /* ── mATX Mid ── */
    { id: 'nr200p', name: 'Cooler Master NR200P MAX (mATX/ITX)', gpuMax: 336, coolerMax: 155, forms: ['mATX'], price: 159 },
    /* ── ATX Budget ── */
    { id: 'spec05', name: 'Corsair SPEC-05 (ATX)', gpuMax: 370, coolerMax: 160, forms: ['ATX','mATX'], price: 49 },
    { id: 'p300a', name: 'Phanteks Eclipse P300A', gpuMax: 355, coolerMax: 165, forms: ['ATX','mATX'], price: 69 },
    { id: '100r', name: 'Corsair Carbide 100R', gpuMax: 414, coolerMax: 150, forms: ['ATX','mATX'], price: 59 },
    /* ── ATX Mid ── */
    { id: 'pop-air', name: 'Fractal Design Pop Air', gpuMax: 405, coolerMax: 170, forms: ['ATX','mATX'], price: 89 },
    { id: '4000d', name: 'Corsair 4000D Airflow', gpuMax: 360, coolerMax: 170, forms: ['ATX','mATX'], price: 99 },
    { id: 'h5-flow', name: 'NZXT H5 Flow', gpuMax: 365, coolerMax: 165, forms: ['ATX','mATX'], price: 109 },
    { id: 'a21', name: 'Antec Performance 1 FT', gpuMax: 380, coolerMax: 175, forms: ['ATX','mATX'], price: 99 },
    { id: 'pure500dx', name: 'be quiet! Pure Base 500DX', gpuMax: 369, coolerMax: 190, forms: ['ATX','mATX'], price: 109 },
    { id: 'north', name: 'Fractal Design North', gpuMax: 355, coolerMax: 170, forms: ['ATX','mATX'], price: 129 },
    { id: 'meshify2c', name: 'Fractal Design Meshify 2 Compact', gpuMax: 360, coolerMax: 169, forms: ['ATX','mATX'], price: 119 },
    /* ── ATX High ── */
    { id: 'h7-flow', name: 'NZXT H7 Flow', gpuMax: 400, coolerMax: 185, forms: ['ATX','mATX'], price: 149 },
    { id: 'lancool216', name: 'Lian Li Lancool 216', gpuMax: 392, coolerMax: 176, forms: ['ATX','mATX'], price: 109 },
    { id: 'lancool3', name: 'Lian Li Lancool III', gpuMax: 435, coolerMax: 187, forms: ['ATX','mATX'], price: 149 },
    { id: 'meshify2', name: 'Fractal Design Meshify 2', gpuMax: 467, coolerMax: 185, forms: ['ATX','mATX'], price: 159 },
    { id: 'torrent', name: 'Fractal Design Torrent', gpuMax: 461, coolerMax: 188, forms: ['ATX','mATX'], price: 179 },
    { id: '5000d', name: 'Corsair 5000D Airflow', gpuMax: 420, coolerMax: 170, forms: ['ATX','mATX'], price: 169 },
    /* ── ATX Premium ── */
    { id: 'h9-flow', name: 'NZXT H9 Flow', gpuMax: 435, coolerMax: 170, forms: ['ATX','mATX'], price: 169 },
    { id: 'o11devo', name: 'Lian Li O11 Dynamic EVO', gpuMax: 422, coolerMax: 167, forms: ['ATX','mATX'], price: 169 },
    { id: '7000d', name: 'Corsair 7000D Airflow', gpuMax: 450, coolerMax: 190, forms: ['ATX','mATX','E-ATX'], price: 219 },
    { id: 'torrentrgb', name: 'Fractal Design Torrent RGB', gpuMax: 461, coolerMax: 188, forms: ['ATX','mATX'], price: 219 },
    { id: 'o11xl', name: 'Lian Li O11D XL', gpuMax: 446, coolerMax: 170, forms: ['ATX','mATX','E-ATX'], price: 199 },
    /* ── Full Tower / E-ATX ── */
    { id: 'h6-flow', name: 'NZXT H6 Flow', gpuMax: 365, coolerMax: 163, forms: ['ATX','mATX'], price: 109 },
    { id: 'define7xl', name: 'Fractal Design Define 7 XL', gpuMax: 491, coolerMax: 185, forms: ['ATX','mATX','E-ATX'], price: 229 },
    { id: 'enthoo719', name: 'Phanteks Enthoo 719', gpuMax: 503, coolerMax: 190, forms: ['ATX','mATX','E-ATX'], price: 189 }
  ],
  monitor: [
    /* ── 1080p IPS / VA — Budget ── */
    { id: 'mon-lg24-1080-144', name: 'LG 24GN65R 24" IPS 144Hz 1080p', size: 24, res: '1080p', hz: 144, panel: 'IPS', price: 129 },
    { id: 'mon-aoc-24-165', name: 'AOC 24G2U 24" IPS 165Hz 1080p', size: 24, res: '1080p', hz: 165, panel: 'IPS', price: 149 },
    { id: 'mon-ben-27-165', name: 'BenQ MOBIUZ EX2710 27" IPS 165Hz 1080p', size: 27, res: '1080p', hz: 165, panel: 'IPS', price: 199 },
    { id: 'mon-ben-24-240', name: 'BenQ XL2411K 24" TN 240Hz 1080p', size: 24, res: '1080p', hz: 240, panel: 'TN', price: 249 },
    /* ── 1440p IPS / VA — Mid ── */
    { id: 'mon-lg27-1440-144', name: 'LG 27QN600 27" IPS 144Hz 1440p', size: 27, res: '1440p', hz: 144, panel: 'IPS', price: 199 },
    { id: 'mon-aoc-27q-165', name: 'AOC Q27G2U 27" IPS 165Hz 1440p', size: 27, res: '1440p', hz: 165, panel: 'IPS', price: 249 },
    { id: 'mon-lg27-1440-180', name: 'LG 27GP850-B 27" Nano IPS 180Hz 1440p', size: 27, res: '1440p', hz: 180, panel: 'Nano IPS', price: 329 },
    { id: 'mon-asus-27q-240', name: 'ASUS ROG Swift PG279QM 27" IPS 240Hz 1440p', size: 27, res: '1440p', hz: 240, panel: 'IPS', price: 449 },
    { id: 'mon-lg32-1440-165', name: 'LG 32GN650 32" VA 165Hz 1440p', size: 32, res: '1440p', hz: 165, panel: 'VA', price: 279 },
    { id: 'mon-dell-27-oled-240', name: 'Dell AW2725DF 27" QD-OLED 240Hz 1440p', size: 27, res: '1440p', hz: 240, panel: 'QD-OLED', price: 699 },
    /* ── 4K — High ── */
    { id: 'mon-lg-4k-27-144', name: 'LG 27UL850 27" IPS 4K 60Hz', size: 27, res: '4K', hz: 60, panel: 'IPS', price: 299 },
    { id: 'mon-lg32-4k-144', name: 'LG 32UP55G 32" IPS 4K 60Hz', size: 32, res: '4K', hz: 60, panel: 'IPS', price: 349 },
    { id: 'mon-asus-4k-144', name: 'ASUS ProArt PA279CV 27" IPS 4K 60Hz', size: 27, res: '4K', hz: 60, panel: 'IPS', price: 429 },
    { id: 'mon-lg-4k-27-160', name: 'LG 27GR95QE 27" OLED 240Hz 4K', size: 27, res: '4K', hz: 240, panel: 'OLED', price: 799 },
    /* ── Ultrawide ── */
    { id: 'mon-lg-ultra-34-160', name: 'LG 34GP63A 34" IPS 160Hz UW-FHD', size: 34, res: 'UW-FHD', hz: 160, panel: 'IPS', price: 279 },
    { id: 'mon-sam-ultra-34-165', name: 'Samsung Odyssey G5 34" VA 165Hz UW-QHD', size: 34, res: 'UW-QHD', hz: 165, panel: 'VA', price: 349 },
    { id: 'mon-asus-ultra-34-180', name: 'ASUS ROG Strix XG349C 34" IPS 180Hz UW-QHD', size: 34, res: 'UW-QHD', hz: 180, panel: 'IPS', price: 549 }
  ],
  caseFan: [
    /* ── 120mm ── */
    { id: 'fan-arctic-120', name: 'Arctic P12 PWM PST 120mm', size: 120, airflow: 56.3, noise: 22.5, price: 8 },
    { id: 'fan-noctua-120', name: 'Noctua NF-A12x25 PWM 120mm', size: 120, airflow: 60.1, noise: 22.6, price: 29 },
    { id: 'fan-be-120', name: 'be quiet! Silent Wings 4 120mm PWM', size: 120, airflow: 50.5, noise: 16.5, price: 19 },
    { id: 'fan-lianli-120', name: 'Lian Li UNI FAN AL120 RGB 120mm', size: 120, airflow: 56.7, noise: 29.4, price: 25 },
    { id: 'fan-cmsickleflow-120', name: 'Cooler Master Sickleflow 120 ARGB', size: 120, airflow: 62, noise: 28, price: 12 },
    { id: 'fan-3x120-arctic', name: 'Arctic P12 PWM PST (Pack 3x 120mm)', size: 120, qty: 3, airflow: 56.3, noise: 22.5, price: 22 },
    /* ── 140mm ── */
    { id: 'fan-arctic-140', name: 'Arctic P14 PWM PST 140mm', size: 140, airflow: 68.1, noise: 24.2, price: 9 },
    { id: 'fan-noctua-140', name: 'Noctua NF-A14 PWM 140mm', size: 140, airflow: 82.5, noise: 24.6, price: 29 },
    { id: 'fan-be-140', name: 'be quiet! Silent Wings 4 140mm PWM', size: 140, airflow: 68.6, noise: 18.9, price: 22 },
    { id: 'fan-3x140-arctic', name: 'Arctic P14 PWM PST (Pack 3x 140mm)', size: 140, qty: 3, airflow: 68.1, noise: 24.2, price: 25 }
  ],
  keyboard: [
    /* ── Budget Membrane ── */
    { id: 'kb-hama-med', name: 'Hama SL720 Slim (membrane)', switch: 'Membrane', layout: 'Full', rgb: false, price: 25 },
    { id: 'kb-logi-k120', name: 'Logitech K120 (membrane, filaire)', switch: 'Membrane', layout: 'Full', rgb: false, price: 19 },
    /* ── Mécanique Budget ── */
    { id: 'kb-redragon-k552', name: 'Redragon K552 TKL (mécanique Red)', switch: 'Outemu Red', layout: 'TKL', rgb: true, price: 39 },
    { id: 'kb-cmaster-ck550', name: 'Cooler Master CK550 V2 (Red Brown Blue)', switch: 'Gateron', layout: 'Full', rgb: true, price: 69 },
    /* ── Mécanique Mid ── */
    { id: 'kb-corsair-k70', name: 'Corsair K70 RGB MK.2 (Cherry MX Red)', switch: 'Cherry MX Red', layout: 'Full', rgb: true, price: 149 },
    { id: 'kb-hm80-tkl', name: 'HyperX Alloy Origins Core TKL (HyperX Red)', switch: 'HyperX Red', layout: 'TKL', rgb: true, price: 89 },
    { id: 'kb-logi-g413', name: 'Logitech G413 SE (tactile)', switch: 'Romer-G Tactile', layout: 'TKL', rgb: false, price: 59 },
    { id: 'kb-steelseries-apex3', name: 'SteelSeries Apex 3 TKL (membrane)', switch: 'Membrane', layout: 'TKL', rgb: true, price: 49 },
    /* ── Mécanique High ── */
    { id: 'kb-corsair-k100', name: 'Corsair K100 RGB (Cherry MX Speed)', switch: 'Cherry MX Speed', layout: 'Full', rgb: true, price: 229 },
    { id: 'kb-logi-g915', name: 'Logitech G915 TKL Sans Fil (GL Tactile)', switch: 'GL Tactile', layout: 'TKL', rgb: true, price: 199 },
    { id: 'kb-asus-scope-tkl', name: 'ASUS ROG Scope II TKL 96 (ROG NX Red)', switch: 'ROG NX Red', layout: 'TKL', rgb: true, price: 129 },
    { id: 'kb-wooting60he', name: 'Wooting 60HE+ (magnétique)', switch: 'Lekker Linear', layout: '60%', rgb: true, price: 179 }
  ],
  mouse: [
    /* ── Budget ── */
    { id: 'ms-logi-g102', name: 'Logitech G102 LIGHTSYNC (8000 DPI)', dpi: 8000, sensor: 'Optique', weight: 85, wireless: false, price: 29 },
    { id: 'ms-redragon-m711', name: 'Redragon M711 Cobra (24000 DPI)', dpi: 24000, sensor: 'Optique', weight: 105, wireless: false, price: 29 },
    { id: 'ms-hyperx-pulsefires', name: 'HyperX Pulsefire Surge (16000 DPI)', dpi: 16000, sensor: 'TrueMove 1', weight: 95, wireless: false, price: 49 },
    /* ── Mid ── */
    { id: 'ms-logi-g502x', name: 'Logitech G502 X Plus (25600 DPI, sans fil)', dpi: 25600, sensor: 'HERO 25K', weight: 106, wireless: true, price: 149 },
    { id: 'ms-ss-rivalcore', name: 'SteelSeries Rival 3 (8500 DPI)', dpi: 8500, sensor: 'TrueMove Core', weight: 77, wireless: false, price: 39 },
    { id: 'ms-razer-death3', name: 'Razer DeathAdder V3 (30000 DPI)', dpi: 30000, sensor: 'Focus Pro 30K', weight: 59, wireless: false, price: 89 },
    { id: 'ms-logi-g305', name: 'Logitech G305 Lightspeed (12000 DPI, sans fil)', dpi: 12000, sensor: 'HERO', weight: 99, wireless: true, price: 49 },
    /* ── High ── */
    { id: 'ms-finalmouse-star', name: 'Finalmouse Starlight-12 (20000 DPI)', dpi: 20000, sensor: 'Finalsensor', weight: 42, wireless: true, price: 259 },
    { id: 'ms-logi-gpx2', name: 'Logitech G Pro X Superlight 2 (32000 DPI)', dpi: 32000, sensor: 'HERO 2', weight: 60, wireless: true, price: 159 },
    { id: 'ms-razer-viper2', name: 'Razer Viper V2 Pro (30000 DPI, sans fil)', dpi: 30000, sensor: 'Focus Pro 30K', weight: 58, wireless: true, price: 159 },
    { id: 'ms-xtrfy-m8', name: 'Xtrfy M8 (26000 DPI, sans fil)', dpi: 26000, sensor: 'Pixart 3370', weight: 55, wireless: true, price: 99 }
  ],
  headset: [
    /* ── Budget ── */
    { id: 'hs-trust-gxt3', name: 'Trust Gaming GXT 322 (filaire, 7.1)', conn: 'USB', type: 'Supra-aural', wireless: false, surround: true, price: 29 },
    { id: 'hs-corsair-hs50', name: 'Corsair HS50 Stereo (filaire)', conn: '3.5mm', type: 'Circum-aural', wireless: false, surround: false, price: 39 },
    { id: 'hs-razer-kraken-x', name: 'Razer Kraken X (filaire, 7.1)', conn: 'USB', type: 'Circum-aural', wireless: false, surround: true, price: 49 },
    /* ── Mid ── */
    { id: 'hs-hx-cloud2', name: 'HyperX Cloud II (filaire, 7.1 USB)', conn: 'USB', type: 'Circum-aural', wireless: false, surround: true, price: 89 },
    { id: 'hs-steelseries-arctis5', name: 'SteelSeries Arctis 5 (filaire, DTS 7.1)', conn: 'USB', type: 'Circum-aural', wireless: false, surround: true, price: 79 },
    { id: 'hs-logi-g432', name: 'Logitech G432 (filaire, DTS 7.1)', conn: 'USB', type: 'Circum-aural', wireless: false, surround: true, price: 59 },
    /* ── High ── */
    { id: 'hs-steelseries-arctis9', name: 'SteelSeries Arctis 9 (sans fil)', conn: 'USB-A 2.4GHz', type: 'Circum-aural', wireless: true, surround: true, price: 189 },
    { id: 'hs-corsair-hs80rf', name: 'Corsair HS80 RGB Wireless (2.4GHz)', conn: 'USB-A 2.4GHz', type: 'Circum-aural', wireless: true, surround: true, price: 129 },
    { id: 'hs-logi-g935', name: 'Logitech G935 Wireless (DTS 7.1)', conn: 'USB-A 2.4GHz', type: 'Circum-aural', wireless: true, surround: true, price: 149 },
    { id: 'hs-astro-a50', name: 'Astro A50 Wireless + Base Station (4th gen)', conn: 'Base USB', type: 'Circum-aural', wireless: true, surround: true, price: 299 }
  ]
};

const GAMES = [
  { name: 'Cyberpunk 2077', base: 95, cpuWeight: 0.38, icon: 'fa-crosshairs' },
  { name: 'Fortnite', base: 185, cpuWeight: 0.52, icon: 'fa-shield' },
  { name: 'Call of Duty MW3', base: 150, cpuWeight: 0.42, icon: 'fa-gun' },
  { name: 'Red Dead Redemption 2', base: 115, cpuWeight: 0.35, icon: 'fa-horse' },
  { name: 'Starfield', base: 88, cpuWeight: 0.41, icon: 'fa-rocket' },
  { name: 'Valorant', base: 320, cpuWeight: 0.65, icon: 'fa-bullseye' },
  { name: 'GTA V', base: 175, cpuWeight: 0.45, icon: 'fa-car' },
  { name: 'Elden Ring', base: 105, cpuWeight: 0.36, icon: 'fa-ring' },
  { name: 'Minecraft (Shaders)', base: 140, cpuWeight: 0.55, icon: 'fa-cube' },
  { name: 'Hogwarts Legacy', base: 92, cpuWeight: 0.37, icon: 'fa-hat-wizard' },
  { name: 'Forza Horizon 5', base: 130, cpuWeight: 0.40, icon: 'fa-flag-checkered' },
  { name: 'Spider-Man Remastered', base: 110, cpuWeight: 0.39, icon: 'fa-spider' }
];

const RES_SCALE = { '1080': 1, '1440': 0.74, '2160': 0.50 };

/* Profile weights for scoring */
const PROFILE_WEIGHTS = {
  gaming:      { cpuGaming: 0.45, gpuScore: 0.45, ram: 0.05, storage: 0.05 },
  streaming:   { cpuMulti: 0.40, gpuScore: 0.30, ram: 0.20, storage: 0.10 },
  creation:    { cpuMulti: 0.35, gpuScore: 0.25, ram: 0.25, storage: 0.15 },
  bureautique: { cpuMulti: 0.30, gpuScore: 0.10, ram: 0.35, storage: 0.25 }
};

/* ══════════════ STATE ══════════════ */

const SEL = { cpu: null, gpu: null, motherboard: null, ram: null, storage: null, cooler: null, psu: null, pcCase: null, monitor: null, caseFan: null, keyboard: null, mouse: null, headset: null };
let currentProfile = 'gaming';
let currentBudget = 1500;
let currentBrand = 'any';

const SELECTS = {
  cpu: document.getElementById('sel-cpu'),
  gpu: document.getElementById('sel-gpu'),
  motherboard: document.getElementById('sel-mb'),
  ram: document.getElementById('sel-ram'),
  storage: document.getElementById('sel-storage'),
  cooler: document.getElementById('sel-cooler'),
  psu: document.getElementById('sel-psu'),
  pcCase: document.getElementById('sel-case'),
  monitor: document.getElementById('sel-monitor'),
  caseFan: document.getElementById('sel-casefan'),
  keyboard: document.getElementById('sel-keyboard'),
  mouse: document.getElementById('sel-mouse'),
  headset: document.getElementById('sel-headset')
};

/* ══════════════ INIT ══════════════ */

document.addEventListener('DOMContentLoaded', () => {
  populateAllSelects();
  initProfileButtons();
  initBrandButtons();
  initBudgetSlider();
  initRecommendButton();
  initResetButton();
  initSaveButton();
  initExportButton();
  initAmazonCartButton();
  initCompare();
  initResolutionChange();
  loadSaves();
  recalcAll();
});

/* ══════════════ POPULATE SELECTS ══════════════ */

function populateAllSelects() {
  populateSelect('cpu', PARTS.cpu, p => `${p.name} — ${p.price} €`);
  populateSelect('gpu', PARTS.gpu, p => `${p.name} — ${p.price} €`);
  populateSelect('motherboard', PARTS.motherboard, p => `${p.name} — ${p.price} €`);
  populateSelect('ram', PARTS.ram, p => `${p.name} — ${p.price} €`);
  populateSelect('storage', PARTS.storage, p => `${p.name} — ${p.price} €`);
  populateSelect('cooler', PARTS.cooler, p => `${p.name} — ${p.price} €`);
  populateSelect('psu', PARTS.psu, p => `${p.name} — ${p.price} €`);
  populateSelect('pcCase', PARTS.pcCase, p => `${p.name} — ${p.price} €`);
  populateSelect('monitor', PARTS.monitor, p => `${p.name} — ${p.price} €`);
  populateSelect('caseFan', PARTS.caseFan, p => `${p.name} — ${p.price} €`);
  populateSelect('keyboard', PARTS.keyboard, p => `${p.name} — ${p.price} €`);
  populateSelect('mouse', PARTS.mouse, p => `${p.name} — ${p.price} €`);
  populateSelect('headset', PARTS.headset, p => `${p.name} — ${p.price} €`);
}

function populateSelect(key, items, labelFn) {
  const el = SELECTS[key];
  el.innerHTML = '<option value="">— choisir —</option>' +
    items.map(i => `<option value="${i.id}">${labelFn(i)}</option>`).join('');
  el.addEventListener('change', () => {
    SEL[key] = items.find(i => i.id === el.value) || null;
    recalcAll();
  });
}

/* ══════════════ PROFILE BUTTONS ══════════════ */

function initProfileButtons() {
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProfile = btn.dataset.profile;
      recalcAll();
    });
  });
}

/* ══════════════ BRAND BUTTONS ══════════════ */

function initBrandButtons() {
  document.querySelectorAll('.brand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBrand = btn.dataset.brand;
    });
  });
}

/* Brand filtering helper */
function getBrandFilters() {
  const filters = { cpu: null, gpu: null };
  switch (currentBrand) {
    case 'amd-full':
      filters.cpu = name => name.startsWith('AMD');
      filters.gpu = name => name.startsWith('AMD');
      break;
    case 'intel-full':
      filters.cpu = name => name.startsWith('Intel');
      filters.gpu = name => name.startsWith('Intel');
      break;
    case 'amd-nvidia':
      filters.cpu = name => name.startsWith('AMD');
      filters.gpu = name => name.startsWith('NVIDIA');
      break;
    case 'intel-nvidia':
      filters.cpu = name => name.startsWith('Intel');
      filters.gpu = name => name.startsWith('NVIDIA');
      break;
  }
  return filters;
}

/* ══════════════ BUDGET SLIDER ══════════════ */

function initBudgetSlider() {
  const slider = document.getElementById('budget-slider');
  const display = document.getElementById('budget-display');
  slider.addEventListener('input', () => {
    currentBudget = parseInt(slider.value);
    display.textContent = currentBudget + ' €';
  });
}

/* ══════════════ RECOMMEND AUTO ══════════════ */

function initRecommendButton() {
  document.getElementById('btn-recommend').addEventListener('click', autoRecommend);
}

function autoRecommend() {
  const budget = currentBudget;
  const profile = currentProfile;

  /* Budget allocation per profile */
  const alloc = {
    gaming:      { cpu: 0.20, gpu: 0.38, mb: 0.10, ram: 0.08, storage: 0.07, cooler: 0.06, psu: 0.06, case: 0.05 },
    streaming:   { cpu: 0.25, gpu: 0.30, mb: 0.10, ram: 0.12, storage: 0.08, cooler: 0.05, psu: 0.05, case: 0.05 },
    creation:    { cpu: 0.28, gpu: 0.25, mb: 0.10, ram: 0.14, storage: 0.10, cooler: 0.05, psu: 0.04, case: 0.04 },
    bureautique: { cpu: 0.22, gpu: 0.15, mb: 0.12, ram: 0.18, storage: 0.15, cooler: 0.06, psu: 0.06, case: 0.06 }
  }[profile];

  function bestInBudget(items, maxBudget, scoreFn) {
    const affordable = items.filter(i => i.price <= maxBudget);
    if (!affordable.length) return items.reduce((a, b) => a.price < b.price ? a : b);
    return affordable.reduce((best, cur) => (scoreFn || (x => x.price))(cur) > (scoreFn || (x => x.price))(best) ? cur : best);
  }

  /* Pick best CPU for profile */
  const cpuBudget = budget * alloc.cpu;
  const cpuScore = profile === 'gaming' ? (c => c.gamingScore) : (c => c.multiScore);
  const brandFilters = getBrandFilters();
  const cpuPool = brandFilters.cpu ? PARTS.cpu.filter(c => brandFilters.cpu(c.name)) : PARTS.cpu;
  const chosenCPU = bestInBudget(cpuPool, cpuBudget, cpuScore);

  /* Pick motherboard compatible with CPU */
  const mbBudget = budget * alloc.mb;
  const compatMBs = PARTS.motherboard.filter(m => m.socket === chosenCPU.socket);
  const chosenMB = bestInBudget(compatMBs.length ? compatMBs : PARTS.motherboard, mbBudget);

  /* GPU */
  const gpuBudget = budget * alloc.gpu;
  const gpuPool = brandFilters.gpu ? PARTS.gpu.filter(g => brandFilters.gpu(g.name)) : PARTS.gpu;
  const chosenGPU = bestInBudget(gpuPool, gpuBudget, g => g.score);

  /* RAM */
  const ramBudget = budget * alloc.ram;
  const ramScoreFn = profile === 'creation' || profile === 'streaming' ? (r => r.capacity) : (r => r.speed);
  const chosenRAM = bestInBudget(PARTS.ram, ramBudget, ramScoreFn);

  /* Storage */
  const stoBudget = budget * alloc.storage;
  const chosenSTO = bestInBudget(PARTS.storage, stoBudget, s => s.capacity);

  /* Cooler compatible with CPU */
  const coolBudget = budget * alloc.cooler;
  const compatCoolers = PARTS.cooler.filter(c => c.sockets.includes(chosenCPU.socket) && c.maxTdp >= chosenCPU.power);
  const chosenCooler = bestInBudget(compatCoolers.length ? compatCoolers : PARTS.cooler, coolBudget);

  /* PSU with enough headroom */
  const estimatedPower = chosenCPU.power + chosenGPU.power + 80;
  const psuBudget = budget * alloc.psu;
  const compatPSUs = PARTS.psu.filter(p => p.wattage >= estimatedPower * 1.15 && p.pins >= chosenGPU.pins);
  const chosenPSU = bestInBudget(compatPSUs.length ? compatPSUs : PARTS.psu, psuBudget);

  /* Case compatible with MB form */
  const caseBudget = budget * alloc.case;
  const compatCases = PARTS.pcCase.filter(c =>
    c.forms.includes(chosenMB.form) &&
    c.gpuMax >= chosenGPU.length &&
    (chosenCooler.isAio || c.coolerMax >= chosenCooler.height)
  );
  const chosenCase = bestInBudget(compatCases.length ? compatCases : PARTS.pcCase, caseBudget);

  /* Apply selections */
  applySelection('cpu', chosenCPU);
  applySelection('gpu', chosenGPU);
  applySelection('motherboard', chosenMB);
  applySelection('ram', chosenRAM);
  applySelection('storage', chosenSTO);
  applySelection('cooler', chosenCooler);
  applySelection('psu', chosenPSU);
  applySelection('pcCase', chosenCase);

  recalcAll();
}

function applySelection(key, item) {
  SEL[key] = item;
  if (item) {
    SELECTS[key].value = item.id;
  }
}

/* ══════════════ RECALCULATE ALL ══════════════ */

function recalcAll() {
  updateSummary();
  updateScores();
  updateCompatibility();
  updateBenchmarks();
  updateAmazonLinks();
}

/* ── SUMMARY ── */
function updateSummary() {
  const totalPrice = Object.values(SEL).reduce((s, p) => s + (p?.price || 0), 0);
  const totalPower = getPowerEstimate();
  const checks = getCompatibilityChecks();
  const fails = checks.filter(c => c.level === 'fail').length;
  const warns = checks.filter(c => c.level === 'warn').length;

  document.getElementById('total-price').textContent = totalPrice + ' €';
  document.getElementById('total-power').textContent = totalPower + ' W';

  const budgetLeft = currentBudget - totalPrice;
  const budgetLeftEl = document.getElementById('budget-left');
  if (budgetLeftEl) {
    budgetLeftEl.textContent = (budgetLeft >= 0 ? '+' : '') + budgetLeft + ' €';
    budgetLeftEl.style.color = budgetLeft >= 0 ? 'var(--ok)' : 'var(--fail)';
  }

  const cs = document.getElementById('compat-status');
  if (!checks.length) {
    cs.textContent = '—';
    cs.style.color = '';
  } else if (fails > 0) {
    cs.textContent = fails + ' erreur(s)';
    cs.style.color = 'var(--fail)';
  } else if (warns > 0) {
    cs.textContent = 'Attention';
    cs.style.color = 'var(--warn)';
  } else {
    cs.textContent = '100%';
    cs.style.color = 'var(--ok)';
  }

  const gs = document.getElementById('global-score');
  const score = getGlobalScore();
  if (score > 0) {
    gs.textContent = score + '/100';
    gs.style.color = score >= 80 ? 'var(--cyan)' : score >= 50 ? 'var(--warn)' : 'var(--fail)';
  } else {
    gs.textContent = '—';
    gs.style.color = '';
  }

  // Value score: performance per euro (normalized 0-100)
  const vs = document.getElementById('value-score');
  const totalPriceNum = Object.values(SEL).reduce((s, p) => s + (p?.price || 0), 0);
  if (score > 0 && totalPriceNum > 0) {
    // Normalize: 100 perf / 1000€ = perfect value; scale accordingly
    const raw = (score / totalPriceNum) * 1000;
    const normalized = Math.min(Math.round(raw * 10) / 10, 100);
    const stars = '★'.repeat(Math.round(normalized / 20)) + '☆'.repeat(5 - Math.round(normalized / 20));
    vs.textContent = `${stars} (${normalized})`;
    vs.style.color = normalized >= 60 ? 'var(--cyan)' : normalized >= 30 ? 'var(--warn)' : 'var(--fail)';
  } else {
    vs.textContent = '—';
    vs.style.color = '';
  }
}

function getPowerEstimate() {
  const cpu = SEL.cpu?.power || 0;
  const gpu = SEL.gpu?.power || 0;
  const rest = (SEL.ram ? 10 : 0) + (SEL.storage?.power || 0) + (SEL.motherboard ? 50 : 0) + (SEL.cooler ? (SEL.cooler.isAio ? 15 : 6) : 0) + (SEL.pcCase ? 8 : 0);
  return cpu + gpu + rest;
}

/* ── SCORES ── */
function getGlobalScore() {
  if (!SEL.cpu && !SEL.gpu) return 0;
  const w = PROFILE_WEIGHTS[currentProfile];
  let score = 0;
  if (SEL.cpu) {
    score += (SEL.cpu.gamingScore / 100) * (w.cpuGaming || 0) * 100;
    score += (SEL.cpu.multiScore / 100) * (w.cpuMulti || 0) * 100;
  }
  if (SEL.gpu) score += (SEL.gpu.score / 100) * w.gpuScore * 100;
  if (SEL.ram) score += Math.min(SEL.ram.capacity / 64, 1) * w.ram * 100;
  if (SEL.storage) score += Math.min(SEL.storage.capacity / 4000, 1) * w.storage * 100;
  return Math.round(score);
}

function updateScores() {
  const cpuG = SEL.cpu ? SEL.cpu.gamingScore : 0;
  const cpuM = SEL.cpu ? SEL.cpu.multiScore : 0;
  const gpuS = SEL.gpu ? SEL.gpu.score : 0;
  const ramS = SEL.ram ? Math.min(SEL.ram.capacity / 64, 1) * 100 : 0;

  const gaming = Math.round(cpuG * 0.4 + gpuS * 0.55 + ramS * 0.05);
  const productivity = Math.round(cpuM * 0.45 + ramS * 0.35 + gpuS * 0.20);
  const creation = Math.round(cpuM * 0.35 + gpuS * 0.35 + ramS * 0.30);
  const streaming = Math.round(cpuM * 0.40 + gpuS * 0.30 + ramS * 0.30);

  setBar('gaming', gaming);
  setBar('productivity', productivity);
  setBar('creation', creation);
  setBar('streaming', streaming);
}

function setBar(name, value) {
  const bar = document.getElementById('bar-' + name);
  const val = document.getElementById('val-' + name);
  if (bar) bar.style.width = value + '%';
  if (val) val.textContent = value;
}

/* ── COMPATIBILITY ── */
function getCompatibilityChecks() {
  const checks = [];
  const totalPrice = Object.values(SEL).reduce((s, p) => s + (p?.price || 0), 0);

  if (totalPrice > 0) {
    checks.push({
      level: totalPrice <= currentBudget ? 'ok' : 'warn',
      title: 'Respect du budget',
      detail: totalPrice <= currentBudget
        ? `${totalPrice}€ dans la limite (${currentBudget}€)`
        : `${totalPrice}€ dépasse le budget (${currentBudget}€)`
    });
  }

  if (SEL.cpu && SEL.motherboard) {
    const ok = SEL.cpu.socket === SEL.motherboard.socket;
    checks.push({ level: ok ? 'ok' : 'fail', title: 'Socket CPU / Carte mère', detail: ok ? `${SEL.cpu.socket} compatible` : `CPU ${SEL.cpu.socket} ≠ CM ${SEL.motherboard.socket}` });
  }

  if (SEL.ram && SEL.motherboard) {
    const tOk = SEL.ram.type === SEL.motherboard.ram;
    checks.push({ level: tOk ? 'ok' : 'fail', title: 'Type RAM', detail: tOk ? `${SEL.ram.type} supporté` : `${SEL.ram.type} ≠ ${SEL.motherboard.ram}` });

    const cOk = SEL.ram.capacity <= SEL.motherboard.maxRam;
    checks.push({ level: cOk ? 'ok' : 'fail', title: 'Capacité RAM', detail: cOk ? `${SEL.ram.capacity}GB ≤ ${SEL.motherboard.maxRam}GB` : `${SEL.ram.capacity}GB > max ${SEL.motherboard.maxRam}GB` });

    const sOk = SEL.ram.speed <= SEL.motherboard.maxSpeed;
    checks.push({ level: sOk ? 'ok' : 'warn', title: 'Fréquence RAM', detail: sOk ? `${SEL.ram.speed}MHz dans la plage` : `${SEL.ram.speed}MHz > ${SEL.motherboard.maxSpeed}MHz (downclock)` });
  }

  if (SEL.cpu && SEL.cooler) {
    const socketOk = SEL.cooler.sockets.includes(SEL.cpu.socket);
    checks.push({ level: socketOk ? 'ok' : 'fail', title: 'Socket refroidissement', detail: socketOk ? 'Socket supporté' : `Socket ${SEL.cpu.socket} non supporté` });

    const tdpOk = SEL.cooler.maxTdp >= SEL.cpu.power;
    checks.push({ level: tdpOk ? 'ok' : 'warn', title: 'Capacité thermique', detail: tdpOk ? `${SEL.cooler.maxTdp}W ≥ ${SEL.cpu.power}W` : `${SEL.cooler.maxTdp}W < ${SEL.cpu.power}W (limité)` });
  }

  if (SEL.motherboard && SEL.pcCase) {
    const ffOk = SEL.pcCase.forms.includes(SEL.motherboard.form);
    checks.push({ level: ffOk ? 'ok' : 'fail', title: 'Format CM / Boîtier', detail: ffOk ? `${SEL.motherboard.form} accepté` : `${SEL.motherboard.form} non supporté` });
  }

  if (SEL.gpu && SEL.pcCase) {
    const ok = SEL.gpu.length <= SEL.pcCase.gpuMax;
    checks.push({ level: ok ? 'ok' : 'fail', title: 'Longueur GPU', detail: ok ? `${SEL.gpu.length}mm ≤ ${SEL.pcCase.gpuMax}mm` : `${SEL.gpu.length}mm > ${SEL.pcCase.gpuMax}mm` });
  }

  if (SEL.cooler && SEL.pcCase && !SEL.cooler.isAio) {
    const ok = SEL.cooler.height <= SEL.pcCase.coolerMax;
    checks.push({ level: ok ? 'ok' : 'fail', title: 'Hauteur ventirad', detail: ok ? `${SEL.cooler.height}mm ≤ ${SEL.pcCase.coolerMax}mm` : `${SEL.cooler.height}mm > ${SEL.pcCase.coolerMax}mm` });
  }

  if (SEL.gpu && SEL.psu) {
    const pinOk = SEL.psu.pins >= SEL.gpu.pins;
    checks.push({ level: pinOk ? 'ok' : 'fail', title: 'Connecteurs PCIe PSU', detail: pinOk ? `${SEL.psu.pins} câble(s) ≥ ${SEL.gpu.pins} requis` : `${SEL.psu.pins} câble(s) < ${SEL.gpu.pins} requis` });
  }

  const totalPower = getPowerEstimate();
  if (SEL.psu && totalPower > 0) {
    const headroom = SEL.psu.wattage / totalPower;
    const ok = headroom >= 1.15;
    const warn = headroom >= 1.0;
    checks.push({
      level: ok ? 'ok' : warn ? 'warn' : 'fail',
      title: 'Marge alimentation',
      detail: ok ? `${SEL.psu.wattage}W — marge de ${Math.round((headroom - 1) * 100)}%` : `${SEL.psu.wattage}W insuffisant pour ${totalPower}W estimés`
    });
  }

  return checks;
}

function updateCompatibility() {
  const list = document.getElementById('compat-list');
  const checks = getCompatibilityChecks();

  if (!checks.length) {
    list.innerHTML = '<li class="compat-empty">Sélectionnez des composants pour lancer l\'analyse.</li>';
    return;
  }

  list.innerHTML = checks.map(c => `
    <li class="compat-item compat-${c.level}">
      <strong>${c.level === 'ok' ? '✓' : c.level === 'warn' ? '⚠' : '✗'} ${c.title}</strong>
      <small>${c.detail}</small>
    </li>
  `).join('');
}

/* ── BENCHMARKS ── */
function updateBenchmarks() {
  const grid = document.getElementById('bench-grid');
  const res = document.getElementById('sel-resolution').value;
  const scale = RES_SCALE[res] || 1;

  if (!SEL.cpu || !SEL.gpu) {
    grid.innerHTML = '<p class="compat-empty">Sélectionnez un CPU et un GPU pour voir les estimations.</p>';
    return;
  }

  grid.innerHTML = GAMES.map(g => {
    const cpuFactor = SEL.cpu.gamingScore / 100;
    const gpuFactor = SEL.gpu.score / 100;
    const fps = Math.round(g.base * (cpuFactor * g.cpuWeight + gpuFactor * (1 - g.cpuWeight)) * scale);
    const cls = fps >= 144 ? 'fps-ultra' : fps >= 90 ? 'fps-high' : fps >= 50 ? 'fps-mid' : 'fps-low';

    return `
      <article class="game-card">
        <h3><i class="fas ${g.icon}"></i> ${g.name}</h3>
        <div class="${cls} fps-value">${fps} FPS</div>
        <p class="fps-label">${res}p Ultra</p>
      </article>
    `;
  }).join('');
}

function initResolutionChange() {
  document.getElementById('sel-resolution').addEventListener('change', updateBenchmarks);
}

/* ══════════════ RESET ══════════════ */

function initResetButton() {
  document.getElementById('btn-reset').addEventListener('click', () => {
    Object.keys(SEL).forEach(k => { SEL[k] = null; });
    Object.values(SELECTS).forEach(s => { s.value = ''; });
    recalcAll();
  });
}

/* ══════════════ SAVE / LOAD ══════════════ */

function initSaveButton() {
  document.getElementById('btn-save').addEventListener('click', saveBuild);
}

function saveBuild() {
  const hasAny = Object.values(SEL).some(v => v);
  if (!hasAny) return;

  const saves = getSaves();
  const build = {
    id: Date.now(),
    date: new Date().toLocaleDateString('fr-FR'),
    profile: currentProfile,
    parts: {},
    totalPrice: Object.values(SEL).reduce((s, p) => s + (p?.price || 0), 0)
  };

  Object.keys(SEL).forEach(k => {
    if (SEL[k]) build.parts[k] = SEL[k].id;
  });

  saves.push(build);
  localStorage.setItem('pcbuilder-saves', JSON.stringify(saves));
  loadSaves();
}

function getSaves() {
  try {
    return JSON.parse(localStorage.getItem('pcbuilder-saves')) || [];
  } catch { return []; }
}

function loadSaves() {
  const container = document.getElementById('saves-list');
  const saves = getSaves();

  if (typeof updateCompareSelects === 'function') updateCompareSelects();

  if (!saves.length) {
    container.innerHTML = '<p class="compat-empty">Aucune build sauvegardée.</p>';
    return;
  }

  container.innerHTML = saves.map(s => {
    const cpuName = s.parts.cpu ? (PARTS.cpu.find(p => p.id === s.parts.cpu)?.name || '?') : '—';
    const gpuName = s.parts.gpu ? (PARTS.gpu.find(p => p.id === s.parts.gpu)?.name || '?') : '—';

    return `
      <div class="save-item" data-id="${s.id}">
        <div class="save-info">
          <strong>${cpuName} + ${gpuName}</strong>
          <small>${s.profile} — ${s.totalPrice} € — ${s.date}</small>
        </div>
        <div class="save-actions">
          <button class="save-btn load-btn" title="Charger"><i class="fas fa-upload"></i></button>
          <button class="save-btn delete" title="Supprimer"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');

  /* Attach events */
  container.querySelectorAll('.load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.closest('.save-item').dataset.id);
      const save = saves.find(s => s.id === id);
      if (!save) return;
      loadBuild(save);
    });
  });

  container.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.closest('.save-item').dataset.id);
      const filtered = saves.filter(s => s.id !== id);
      localStorage.setItem('pcbuilder-saves', JSON.stringify(filtered));
      loadSaves();
    });
  });
}

function loadBuild(save) {
  /* Set profile */
  currentProfile = save.profile || 'gaming';
  document.querySelectorAll('.profile-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.profile === currentProfile);
  });

  /* Set parts */
  Object.keys(save.parts).forEach(key => {
    const partId = save.parts[key];
    const partList = PARTS[key];
    if (!partList) return;
    const item = partList.find(p => p.id === partId);
    if (item) applySelection(key, item);
  });

  recalcAll();
}

/* ══════════════ EXPORT ══════════════ */

function initExportButton() {
  document.getElementById('btn-export').addEventListener('click', exportBuild);
}

function exportBuild() {
  const lines = ['=== PC Builder Pro — Export ===', ''];
  lines.push('Profil : ' + currentProfile);
  lines.push('Date : ' + new Date().toLocaleDateString('fr-FR'));
  lines.push('');

  const labels = { cpu: 'CPU', gpu: 'GPU', motherboard: 'Carte mère', ram: 'RAM', storage: 'Stockage', cooler: 'Refroidissement', psu: 'Alimentation', pcCase: 'Boîtier' };
  let total = 0;

  Object.keys(labels).forEach(k => {
    const p = SEL[k];
    if (p) {
      lines.push(`${labels[k]}: ${p.name} — ${p.price} €`);
      total += p.price;
    }
  });

  lines.push('');
  lines.push('Total : ' + total + ' €');
  lines.push('Conso estimée : ' + getPowerEstimate() + ' W');
  lines.push('Score global : ' + getGlobalScore() + '/100');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pc-build-export.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ══════════════ COMPARE BUILDS ══════════════ */

function initCompare() {
  document.getElementById('btn-compare').addEventListener('click', compareBuilds);
  updateCompareSelects();
}

function updateCompareSelects() {
  const saves = getSaves();
  ['compare-a', 'compare-b'].forEach(id => {
    const sel = document.getElementById(id);
    const cur = sel.value;
    sel.innerHTML = `<option value="">— Choisir —</option>` +
      saves.map(s => {
        const cpu = PARTS.cpu.find(p => p.id === s.parts.cpu)?.name || '?';
        const gpu = PARTS.gpu.find(p => p.id === s.parts.gpu)?.name || '?';
        return `<option value="${s.id}">${cpu} + ${gpu} (${s.totalPrice}€)</option>`;
      }).join('');
    sel.value = cur;
  });
}

function compareBuilds() {
  const saves = getSaves();
  const idA = parseInt(document.getElementById('compare-a').value);
  const idB = parseInt(document.getElementById('compare-b').value);
  const a = saves.find(s => s.id === idA);
  const b = saves.find(s => s.id === idB);
  const container = document.getElementById('compare-result');

  if (!a || !b) { container.innerHTML = '<p style="opacity:.5">Sélectionnez deux builds sauvegardées.</p>'; return; }
  if (idA === idB) { container.innerHTML = '<p style="opacity:.5">Choisissez deux builds différentes.</p>'; return; }

  const getPartInfo = (save, category) => {
    const partId = save.parts[category];
    if (!partId) return null;
    return PARTS[category]?.find(p => p.id === partId) || null;
  };

  const cats = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'cooler', 'psu', 'pcCase'];
  const labels = { cpu: 'CPU', gpu: 'GPU', motherboard: 'Carte mère', ram: 'RAM', storage: 'Stockage', cooler: 'Refroidissement', psu: 'Alimentation', pcCase: 'Boîtier' };

  let html = '<table class="compare-table"><thead><tr><th>Composant</th><th>Build A</th><th>Build B</th></tr></thead><tbody>';

  let priceA = 0, priceB = 0;
  cats.forEach(cat => {
    const pA = getPartInfo(a, cat);
    const pB = getPartInfo(b, cat);
    if (pA) priceA += pA.price;
    if (pB) priceB += pB.price;
    html += `<tr><td>${labels[cat]}</td><td>${pA ? pA.name + ' <small>(' + pA.price + '€)</small>' : '—'}</td><td>${pB ? pB.name + ' <small>(' + pB.price + '€)</small>' : '—'}</td></tr>`;
  });

  // Scores
  const cpuA = getPartInfo(a, 'cpu'), gpuA = getPartInfo(a, 'gpu');
  const cpuB = getPartInfo(b, 'cpu'), gpuB = getPartInfo(b, 'gpu');
  const scoreA = Math.round(((cpuA?.gamingScore || 0) + (gpuA?.score || 0)) / 2);
  const scoreB = Math.round(((cpuB?.gamingScore || 0) + (gpuB?.score || 0)) / 2);

  html += `<tr style="font-weight:700"><td>Prix total</td><td class="${priceA <= priceB ? 'win' : ''}">${priceA} €</td><td class="${priceB <= priceA ? 'win' : ''}">${priceB} €</td></tr>`;
  html += `<tr style="font-weight:700"><td>Score gaming</td><td class="${scoreA >= scoreB ? 'win' : ''}">${scoreA}/100</td><td class="${scoreB >= scoreA ? 'win' : ''}">${scoreB}/100</td></tr>`;
  html += '</tbody></table>';

  container.innerHTML = html;
}

/* ══════════════ AMAZON LINKS ══════════════ */

function getAmazonSearchUrl(productName) {
  const query = encodeURIComponent(productName);
  return `https://www.amazon.fr/s?k=${query}`;
}

function updateAmazonLinks() {
  const keys = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'cooler', 'psu', 'pcCase'];
  keys.forEach(key => {
    const link = document.getElementById('amz-' + key);
    if (!link) return;
    const part = SEL[key];
    if (part) {
      link.href = getAmazonSearchUrl(part.name);
      link.classList.remove('hidden');
    } else {
      link.classList.add('hidden');
      link.removeAttribute('href');
    }
  });

  /* Update Amazon cart button state */
  const btn = document.getElementById('btn-amazon-cart');
  const hasAny = Object.values(SEL).some(v => v);
  if (btn) btn.disabled = !hasAny;
}

/* ══════════════ AMAZON CART ══════════════ */

function initAmazonCartButton() {
  document.getElementById('btn-amazon-cart').addEventListener('click', openAmazonCart);
}

function openAmazonCart() {
  const labels = { cpu: 'Processeur', gpu: 'Carte graphique', motherboard: 'Carte mère', ram: 'RAM', storage: 'Stockage', cooler: 'Refroidissement', psu: 'Alimentation', pcCase: 'Boîtier' };
  const parts = [];

  Object.keys(labels).forEach(k => {
    if (SEL[k]) {
      parts.push({ label: labels[k], name: SEL[k].name, price: SEL[k].price, url: getAmazonSearchUrl(SEL[k].name) });
    }
  });

  if (!parts.length) return;

  const total = parts.reduce((s, p) => s + p.price, 0);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Panier Amazon — PC Builder Pro</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0e1219;color:#e4eaf2;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px}
h1{font-size:1.8rem;margin-bottom:8px}
h1 .accent{color:#60a5fa}
.subtitle{color:#7b8a9d;margin-bottom:30px;font-size:0.95rem}
.cart{width:100%;max-width:700px;display:flex;flex-direction:column;gap:12px}
.cart-item{background:#1a2230;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;transition:border-color .2s}
.cart-item:hover{border-color:rgba(255,255,255,0.15)}
.item-info{display:flex;flex-direction:column;gap:4px}
.item-label{color:#7b8a9d;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;font-weight:700}
.item-name{font-weight:600;font-size:0.95rem}
.item-right{display:flex;align-items:center;gap:14px}
.item-price{font-weight:700;color:#60a5fa;font-size:1rem;white-space:nowrap}
.item-link{display:inline-flex;align-items:center;gap:6px;background:#ff9900;color:#0e1219;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.85rem;transition:background .2s}
.item-link:hover{background:#ffad33}
.total-bar{margin-top:20px;background:#1a1a24;border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:18px 24px;display:flex;justify-content:space-between;align-items:center}
.total-label{font-size:1.1rem;font-weight:600}
.total-price{font-size:1.4rem;font-weight:800;color:#00cec9}
.open-all{margin-top:16px;width:100%;max-width:700px;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#ff9900,#ff6600);color:#fff;font-size:1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s}
.open-all:hover{opacity:.9}
.note{margin-top:14px;color:#7b8a9d;font-size:0.8rem;text-align:center;max-width:700px}
</style>
</head>
<body>
<h1><i class="fab fa-amazon"></i> Panier <span class="accent">Amazon</span></h1>
<p class="subtitle">Tous les composants de votre configuration PC</p>
<div class="cart">
${parts.map(p => `
  <div class="cart-item">
    <div class="item-info">
      <span class="item-label">${p.label}</span>
      <span class="item-name">${p.name}</span>
    </div>
    <div class="item-right">
      <span class="item-price">${p.price} €</span>
      <a href="${p.url}" target="_blank" rel="noreferrer" class="item-link"><i class="fab fa-amazon"></i> Acheter</a>
    </div>
  </div>
`).join('')}
</div>
<div class="total-bar" style="max-width:700px;width:100%">
  <span class="total-label">Total estimé</span>
  <span class="total-price">${total} €</span>
</div>
<button class="open-all" id="btn-open-all">
  <i class="fas fa-cart-shopping"></i> Ouvrir tous les produits sur Amazon
</button>
<p class="note" id="popup-note" style="display:none;color:#ff6b6b;font-weight:600;font-size:0.85rem;margin-top:10px;text-align:center;max-width:700px">
  ⚠ Votre navigateur a bloqué les pop-ups. Autorisez les pop-ups pour ce site ou cliquez sur chaque bouton "Acheter" individuellement.
</p>
<p class="note">Les liens redirigent vers une recherche Amazon.fr pour chaque composant. Les prix affichés sont estimatifs.</p>
<script>
document.getElementById('btn-open-all').addEventListener('click', function() {
  var links = document.querySelectorAll('.item-link');
  var blocked = false;
  var i = 0;
  function openNext() {
    if (i >= links.length) {
      if (blocked) document.getElementById('popup-note').style.display = 'block';
      return;
    }
    var w = window.open(links[i].href, '_blank');
    if (!w || w.closed) blocked = true;
    i++;
    setTimeout(openNext, 300);
  }
  openNext();
});
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
