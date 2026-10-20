import JSZip from 'jszip';
import heic2any from 'heic2any';
import { GiftConfig, MemoryItem } from '../types/gift';

export const CURATED_PORTRAIT_URLS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=85',
];

export const CURATED_COUPLE_SILHOUETTE_URL =
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85';

const portraitDataUrlCache = new Map<number, string>();

export function createSunlitPortraitDataUrl(index: number): string {
  if (typeof document === 'undefined') return '';
  const key = ((index % 6) + 6) % 6;
  const cached = portraitDataUrlCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.scale(384 / 512, 384 / 512);

  const palettes = [
    {
      bgTop: '#d8f3dc',
      bgBot: '#52b788',
      bokeh: 'rgba(255, 252, 230, 0.65)',
      hair: '#24140e',
      dress: '#ffffff',
      flower: '#ff758f',
    },
    {
      bgTop: '#ffedd8',
      bgBot: '#d4a373',
      bokeh: 'rgba(255, 225, 175, 0.65)',
      hair: '#331c14',
      dress: '#fffdf7',
      flower: '#f4a261',
    },
    {
      bgTop: '#ffe5ec',
      bgBot: '#fb6f92',
      bokeh: 'rgba(255, 240, 246, 0.7)',
      hair: '#1f110f',
      dress: '#ffffff',
      flower: '#ff4d6d',
    },
    {
      bgTop: '#fde2e4',
      bgBot: '#e29578',
      bokeh: 'rgba(255, 235, 210, 0.6)',
      hair: '#2b1812',
      dress: '#fff8f0',
      flower: '#ff758f',
    },
    {
      bgTop: '#f3e8ff',
      bgBot: '#c084fc',
      bokeh: 'rgba(255, 240, 255, 0.65)',
      hair: '#1f1324',
      dress: '#fff5f9',
      flower: '#f472b6',
    },
    {
      bgTop: '#fff0f3',
      bgBot: '#ff8fa3',
      bokeh: 'rgba(255, 255, 255, 0.7)',
      hair: '#2b1810',
      dress: '#fffcf2',
      flower: '#e01e37',
    },
  ];

  const p = palettes[index % palettes.length];

  const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
  bgGrad.addColorStop(0, p.bgTop);
  bgGrad.addColorStop(1, p.bgBot);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 32; i++) {
    const bx = ((i * 157 + index * 83) % 480) + 16;
    const by = ((i * 113 + index * 61) % 480) + 16;
    const br = 20 + (i % 5) * 18;
    const bGrad = ctx.createRadialGradient(bx, by, 2, bx, by, br);
    bGrad.addColorStop(0, p.bokeh);
    bGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  const sunGlow = ctx.createRadialGradient(256, 175, 15, 256, 175, 270);
  sunGlow.addColorStop(0, 'rgba(255, 255, 250, 0.88)');
  sunGlow.addColorStop(0.5, 'rgba(255, 235, 220, 0.35)');
  sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, 512, 512);

  ctx.save();
  ctx.translate(256, 265);

  ctx.fillStyle = p.hair;
  ctx.beginPath();
  ctx.moveTo(-80, -88);
  ctx.bezierCurveTo(-118, 12, -108, 165, -78, 255);
  ctx.lineTo(85, 255);
  ctx.bezierCurveTo(112, 160, 118, 15, 80, -88);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffe5d9';
  ctx.beginPath();
  ctx.roundRect(-24, -15, 48, 55, 16);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-105, 250);
  ctx.quadraticCurveTo(-95, 35, -35, 28);
  ctx.lineTo(35, 28);
  ctx.quadraticCurveTo(95, 35, 105, 250);
  ctx.closePath();
  ctx.fill();

  const dressGrad = ctx.createLinearGradient(0, 35, 0, 250);
  dressGrad.addColorStop(0, p.dress);
  dressGrad.addColorStop(1, '#f8edeb');
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.moveTo(-94, 250);
  ctx.quadraticCurveTo(-78, 65, -42, 42);
  ctx.quadraticCurveTo(0, 62, 42, 42);
  ctx.quadraticCurveTo(78, 65, 94, 250);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fff1e6';
  ctx.beginPath();
  ctx.ellipse(
    0,
    -68,
    62,
    72,
    (index % 2 === 0 ? 1 : -1) * 0.04,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const leftBlush = ctx.createRadialGradient(-32, -52, 2, -32, -52, 18);
  leftBlush.addColorStop(0, 'rgba(255, 130, 160, 0.55)');
  leftBlush.addColorStop(1, 'rgba(255, 130, 160, 0)');
  ctx.fillStyle = leftBlush;
  ctx.beginPath();
  ctx.arc(-32, -52, 18, 0, Math.PI * 2);
  ctx.fill();

  const rightBlush = ctx.createRadialGradient(32, -52, 2, 32, -52, 18);
  rightBlush.addColorStop(0, 'rgba(255, 130, 160, 0.55)');
  rightBlush.addColorStop(1, 'rgba(255, 130, 160, 0)');
  ctx.fillStyle = rightBlush;
  ctx.beginPath();
  ctx.arc(32, -52, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3d231a';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-24, -68, 12, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(24, -68, 12, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  ctx.strokeStyle = '#e56b6f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -42, 11, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.fillStyle = p.hair;
  ctx.beginPath();
  ctx.moveTo(-68, -75);
  ctx.quadraticCurveTo(-55, -148, 0, -148);
  ctx.quadraticCurveTo(55, -148, 68, -75);
  ctx.quadraticCurveTo(35, -108, 8, -82);
  ctx.quadraticCurveTo(-18, -108, -42, -82);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  portraitDataUrlCache.set(key, dataUrl);
  return dataUrl;
}

function drawBotanicalRose(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  radius: number,
  outerHex: string,
  midHex: string,
  deepHex: string,
  seed = 0
) {
  ctx.save();
  ctx.translate(rx, ry);

  ctx.shadowColor = 'rgba(80, 10, 35, 0.32)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;

  const layers = [
    { count: 8, dist: 0.64, pW: 0.56, pH: 0.46, c1: '#fff7fa', c2: outerHex },
    { count: 7, dist: 0.48, pW: 0.48, pH: 0.4, c1: outerHex, c2: midHex },
    { count: 6, dist: 0.34, pW: 0.39, pH: 0.32, c1: outerHex, c2: deepHex },
    { count: 5, dist: 0.2, pW: 0.29, pH: 0.24, c1: midHex, c2: deepHex },
    { count: 4, dist: 0.09, pW: 0.19, pH: 0.16, c1: midHex, c2: deepHex },
  ];

  layers.forEach((layer, lIdx) => {
    for (let i = 0; i < layer.count; i++) {
      const angle =
        (i / layer.count) * Math.PI * 2 + lIdx * 0.72 + seed * 0.45;
      const px = Math.cos(angle) * radius * layer.dist;
      const py = Math.sin(angle) * radius * layer.dist;
      const pw = radius * layer.pW;
      const ph = radius * layer.pH;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);

      const grad = ctx.createRadialGradient(
        0,
        -ph * 0.35,
        pw * 0.08,
        0,
        ph * 0.15,
        pw * 1.05
      );
      grad.addColorStop(0, layer.c1);
      grad.addColorStop(0.65, layer.c2);
      grad.addColorStop(1, deepHex);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-pw, 0);
      ctx.bezierCurveTo(
        -pw * 1.05,
        -ph * 0.95,
        -pw * 0.25,
        -ph * 1.15,
        0,
        -ph * 0.92
      );
      ctx.bezierCurveTo(pw * 0.25, -ph * 1.15, pw * 1.05, -ph * 0.95, pw, 0);
      ctx.bezierCurveTo(pw * 0.75, ph * 0.85, -pw * 0.75, ph * 0.85, -pw, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 245, 250, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }
  });

  const coreGrad = ctx.createRadialGradient(0, -2, 1, 0, 0, radius * 0.16);
  coreGrad.addColorStop(0, deepHex);
  coreGrad.addColorStop(1, midHex);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.15, radius * 0.11, seed, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCamomileDaisy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(60, 10, 30, 0.25)';
  ctx.shadowBlur = 6;

  for (let p = 0; p < 6; p++) {
    const a = (p / 6) * Math.PI * 2;
    const pGrad = ctx.createRadialGradient(
      Math.cos(a) * 10,
      Math.sin(a) * 10,
      1,
      Math.cos(a) * 10,
      Math.sin(a) * 10,
      11
    );
    pGrad.addColorStop(0, '#ffffff');
    pGrad.addColorStop(1, '#fce7f3');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * 11,
      Math.sin(a) * 11,
      10,
      6.8,
      a,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const centerGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 7.5);
  centerGrad.addColorStop(0, '#fef08a');
  centerGrad.addColorStop(0.7, '#facc15');
  centerGrad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

let cachedBouquetDataUrl: string | null = null;
let cachedForegroundOverlayUrl: string | null = null;

export function createRoseBouquetDataUrl(): string {
  if (typeof document === 'undefined') return '';
  if (cachedBouquetDataUrl) return cachedBouquetDataUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, 900, 960);

  const aura = ctx.createRadialGradient(450, 370, 40, 450, 370, 390);
  aura.addColorStop(0, 'rgba(255, 115, 179, 0.38)');
  aura.addColorStop(0.6, 'rgba(236, 72, 153, 0.12)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 900, 960);

  const drawPleatedSheet = (
    pts: [number, number][],
    cTop: string,
    cBot: string
  ) => {
    ctx.save();
    ctx.shadowColor = 'rgba(100, 15, 45, 0.28)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 6;
    const g = ctx.createLinearGradient(200, 110, 700, 620);
    g.addColorStop(0, cTop);
    g.addColorStop(1, cBot);
    ctx.fillStyle = g;
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  drawPleatedSheet(
    [
      [450, 640],
      [105, 325],
      [165, 185],
      [310, 145],
    ],
    '#fce7f3',
    '#f472b6'
  );
  drawPleatedSheet(
    [
      [450, 640],
      [265, 130],
      [450, 105],
      [635, 130],
    ],
    '#fff1f2',
    '#f9a8d4'
  );
  drawPleatedSheet(
    [
      [450, 640],
      [590, 145],
      [735, 185],
      [795, 325],
    ],
    '#fce7f3',
    '#f472b6'
  );

  ctx.save();
  ctx.fillStyle = 'rgba(255, 248, 251, 0.92)';
  ctx.beginPath();
  ctx.ellipse(450, 315, 285, 165, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const drawEucalyptusSprig = (
    x: number,
    y: number,
    angle: number,
    scale = 1
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.quadraticCurveTo(5, -45, 0, -110);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const ly = -i * 20;
      const lw = 17 - i * 1.4;
      const lh = 9.5 - i * 0.6;
      const lGrad = ctx.createLinearGradient(-lw, ly - 8, lw, ly + 8);
      lGrad.addColorStop(0, '#95d5b2');
      lGrad.addColorStop(0.6, '#52b788');
      lGrad.addColorStop(1, '#1b4332');
      ctx.fillStyle = lGrad;

      ctx.beginPath();
      ctx.ellipse(-14, ly, lw, lh, -0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(14, ly - 6, lw, lh, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const foliageCoords = [
    [215, 250, -0.78, 1.12],
    [290, 185, -0.42, 1.18],
    [385, 152, -0.14, 1.18],
    [515, 152, 0.14, 1.18],
    [610, 185, 0.42, 1.18],
    [685, 250, 0.78, 1.12],
    [175, 340, -1.08, 1.0],
    [725, 340, 1.08, 1.0],
  ] as const;
  foliageCoords.forEach(([x, y, a, s]) => drawEucalyptusSprig(x, y, a, s));

  const upperRoses = [
    { x: 325, y: 198, r: 48, c1: '#fce7f3', c2: '#f472b6', c3: '#be185d' },
    { x: 408, y: 182, r: 52, c1: '#ffe4e6', c2: '#fb7185', c3: '#be123c' },
    { x: 492, y: 182, r: 52, c1: '#fbcfe8', c2: '#ec4899', c3: '#9d174d' },
    { x: 575, y: 198, r: 48, c1: '#fce7f3', c2: '#f472b6', c3: '#be185d' },

    { x: 255, y: 258, r: 52, c1: '#fecdd3', c2: '#f43f5e', c3: '#9f1239' },
    { x: 345, y: 252, r: 56, c1: '#fce7f3', c2: '#f472b6', c3: '#be185d' },
    { x: 450, y: 245, r: 60, c1: '#ffe4e6', c2: '#fb7185', c3: '#be123c' },
    { x: 555, y: 252, r: 56, c1: '#fbcfe8', c2: '#ec4899', c3: '#9d174d' },
    { x: 645, y: 258, r: 52, c1: '#fce7f3', c2: '#f472b6', c3: '#db2777' },

    { x: 215, y: 335, r: 50, c1: '#fbcfe8', c2: '#f472b6', c3: '#db2777' },
    { x: 300, y: 328, r: 58, c1: '#fbcfe8', c2: '#ec4899', c3: '#9d174d' },
    { x: 398, y: 322, r: 62, c1: '#fecdd3', c2: '#f43f5e', c3: '#9f1239' },
    { x: 502, y: 322, r: 62, c1: '#fce7f3', c2: '#ec4899', c3: '#be185d' },
    { x: 600, y: 328, r: 58, c1: '#fecdd3', c2: '#fb7185', c3: '#be123c' },
    { x: 685, y: 335, r: 50, c1: '#fbcfe8', c2: '#f472b6', c3: '#db2777' },
  ];

  upperRoses.forEach((r, idx) =>
    drawBotanicalRose(ctx, r.x, r.y, r.r, r.c1, r.c2, r.c3, idx)
  );

  [
    [372, 218, 1.05],
    [528, 218, 1.0],
    [298, 288, 1.1],
    [405, 282, 1.15],
    [495, 285, 1.05],
    [602, 288, 1.05],
  ].forEach(([dx, dy, ds]) => drawCamomileDaisy(ctx, dx, dy, ds));

  drawBouquetForegroundElements(ctx);

  cachedBouquetDataUrl = canvas.toDataURL('image/png');
  return cachedBouquetDataUrl;
}

function drawBouquetForegroundElements(ctx: CanvasRenderingContext2D) {
  const frontRoses = [
    { x: 268, y: 405, r: 54, c1: '#fce7f3', c2: '#f472b6', c3: '#db2777' },
    { x: 358, y: 408, r: 58, c1: '#fbcfe8', c2: '#ec4899', c3: '#9d174d' },
    { x: 450, y: 412, r: 62, c1: '#ffe4e6', c2: '#f43f5e', c3: '#9f1239' },
    { x: 542, y: 408, r: 58, c1: '#fce7f3', c2: '#ec4899', c3: '#be185d' },
    { x: 632, y: 405, r: 54, c1: '#fecdd3', c2: '#fb7185', c3: '#be123c' },
  ];
  frontRoses.forEach((r, idx) =>
    drawBotanicalRose(ctx, r.x, r.y, r.r, r.c1, r.c2, r.c3, idx + 20)
  );

  [
    [342, 372, 1.1],
    [450, 368, 1.2],
    [558, 372, 1.1],
  ].forEach(([dx, dy, ds]) => drawCamomileDaisy(ctx, dx, dy, ds));

  const forgetMeNots = [
    [248, 305],
    [378, 205],
    [535, 212],
    [652, 305],
    [400, 432],
    [502, 432],
  ];
  forgetMeNots.forEach(([bx, by]) => {
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = k % 2 === 0 ? '#93c5fd' : '#c4b5fd';
      ctx.beginPath();
      ctx.arc(
        bx + (k - 2) * 9,
        by + Math.sin(k * 2) * 6,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });

  for (let b = 0; b < 36; b++) {
    const angle = (b / 36) * Math.PI * 1.15 - Math.PI * 1.07;
    const rad = 215 + (b % 3) * 32;
    const gx = 450 + Math.cos(angle) * rad;
    const gy = 335 + Math.sin(angle) * (rad * 0.72);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(gx, gy, 3.5 + (b % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.shadowColor = 'rgba(115, 18, 58, 0.3)';
  ctx.shadowBlur = 26;

  const leftWingGrad = ctx.createLinearGradient(155, 395, 470, 810);
  leftWingGrad.addColorStop(0, '#fdf2f8');
  leftWingGrad.addColorStop(0.5, '#f9a8d4');
  leftWingGrad.addColorStop(1, '#f472b6');
  ctx.fillStyle = leftWingGrad;
  ctx.beginPath();
  ctx.moveTo(160, 405);
  ctx.quadraticCurveTo(310, 495, 480, 462);
  ctx.lineTo(500, 820);
  ctx.quadraticCurveTo(435, 845, 360, 810);
  ctx.closePath();
  ctx.fill();

  const rightWingGrad = ctx.createLinearGradient(745, 395, 430, 810);
  rightWingGrad.addColorStop(0, '#fce7f3');
  rightWingGrad.addColorStop(0.5, '#f472b6');
  rightWingGrad.addColorStop(1, '#ec4899');
  ctx.fillStyle = rightWingGrad;
  ctx.beginPath();
  ctx.moveTo(740, 405);
  ctx.quadraticCurveTo(590, 495, 412, 468);
  ctx.lineTo(390, 815);
  ctx.quadraticCurveTo(460, 850, 540, 810);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(450, 640);
  ctx.shadowColor = 'rgba(115, 18, 58, 0.32)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  const ribbonGrad = ctx.createLinearGradient(-100, -45, 100, 180);
  ribbonGrad.addColorStop(0, '#ffffff');
  ribbonGrad.addColorStop(0.55, '#fff5f8');
  ribbonGrad.addColorStop(1, '#fce7f3');
  ctx.fillStyle = ribbonGrad;

  ctx.beginPath();
  ctx.roundRect(-74, -15, 148, 30, 9);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.bezierCurveTo(-125, -76, -140, 54, -10, 16);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.bezierCurveTo(125, -76, 140, 54, 10, 16);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-16, 14);
  ctx.quadraticCurveTo(-76, 125, -104, 245);
  ctx.lineTo(-56, 252);
  ctx.quadraticCurveTo(-36, 130, 6, 16);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(16, 14);
  ctx.quadraticCurveTo(76, 125, 104, 245);
  ctx.lineTo(56, 252);
  ctx.quadraticCurveTo(36, 130, -6, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-20, -18, 40, 36, 11);
  ctx.fill();
  ctx.restore();
}

export function createRoseBouquetForegroundOverlayDataUrl(): string {
  if (typeof document === 'undefined') return '';
  if (cachedForegroundOverlayUrl) return cachedForegroundOverlayUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, 900, 960);

  // Only draw a gentle lower rim of roses + pink wrapping paper cone + white ribbon bow
  // so the 5 portrait photos in the upper bouquet are NEVER covered by blue/white dots or high roses!
  const lowerRimRoses = [
    { x: 265, y: 448, r: 45, c1: '#fce7f3', c2: '#f472b6', c3: '#db2777' },
    { x: 356, y: 452, r: 48, c1: '#fbcfe8', c2: '#ec4899', c3: '#9d174d' },
    { x: 450, y: 455, r: 50, c1: '#ffe4e6', c2: '#f43f5e', c3: '#9f1239' },
    { x: 544, y: 452, r: 48, c1: '#fce7f3', c2: '#ec4899', c3: '#be185d' },
    { x: 635, y: 448, r: 45, c1: '#fecdd3', c2: '#fb7185', c3: '#be123c' },
  ];
  lowerRimRoses.forEach((r, idx) =>
    drawBotanicalRose(ctx, r.x, r.y, r.r, r.c1, r.c2, r.c3, idx + 30)
  );

  [
    [342, 428, 0.95],
    [450, 425, 1.05],
    [558, 428, 0.95],
  ].forEach(([dx, dy, ds]) => drawCamomileDaisy(ctx, dx, dy, ds));

  ctx.save();
  ctx.shadowColor = 'rgba(115, 18, 58, 0.3)';
  ctx.shadowBlur = 26;

  const leftWingGrad = ctx.createLinearGradient(155, 420, 470, 810);
  leftWingGrad.addColorStop(0, '#fdf2f8');
  leftWingGrad.addColorStop(0.5, '#f9a8d4');
  leftWingGrad.addColorStop(1, '#f472b6');
  ctx.fillStyle = leftWingGrad;
  ctx.beginPath();
  ctx.moveTo(165, 425);
  ctx.quadraticCurveTo(310, 505, 480, 472);
  ctx.lineTo(500, 820);
  ctx.quadraticCurveTo(435, 845, 360, 810);
  ctx.closePath();
  ctx.fill();

  const rightWingGrad = ctx.createLinearGradient(745, 420, 430, 810);
  rightWingGrad.addColorStop(0, '#fce7f3');
  rightWingGrad.addColorStop(0.5, '#f472b6');
  rightWingGrad.addColorStop(1, '#ec4899');
  ctx.fillStyle = rightWingGrad;
  ctx.beginPath();
  ctx.moveTo(735, 425);
  ctx.quadraticCurveTo(590, 505, 412, 476);
  ctx.lineTo(390, 815);
  ctx.quadraticCurveTo(460, 850, 540, 810);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(450, 640);
  ctx.shadowColor = 'rgba(115, 18, 58, 0.32)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  const ribbonGrad = ctx.createLinearGradient(-100, -45, 100, 180);
  ribbonGrad.addColorStop(0, '#ffffff');
  ribbonGrad.addColorStop(0.55, '#fff5f8');
  ribbonGrad.addColorStop(1, '#fce7f3');
  ctx.fillStyle = ribbonGrad;

  ctx.beginPath();
  ctx.roundRect(-74, -15, 148, 30, 9);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.bezierCurveTo(-125, -76, -140, 54, -10, 16);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.bezierCurveTo(125, -76, 140, 54, 10, 16);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-16, 14);
  ctx.quadraticCurveTo(-76, 125, -104, 245);
  ctx.lineTo(-56, 252);
  ctx.quadraticCurveTo(-36, 130, 6, 16);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(16, 14);
  ctx.quadraticCurveTo(76, 125, 104, 245);
  ctx.lineTo(56, 252);
  ctx.quadraticCurveTo(36, 130, -6, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-20, -18, 40, 36, 11);
  ctx.fill();
  ctx.restore();

  cachedForegroundOverlayUrl = canvas.toDataURL('image/png');
  return cachedForegroundOverlayUrl;
}

const EXCLUDED_BOUQUET_ASSET_FILES = new Set([
  'media_1792494797671_iwh4j3.jpg',
  'media_1792496860242_cg5jpy.jpg',
  '/uploads/media_1792494797671_iwh4j3.jpg',
  '/uploads/media_1792496860242_cg5jpy.jpg',
]);

// Curated with the 8 sharpest, well-centered portraits of Minh Huyen & the couple first so the 5 Bouquet photos and Love Letter portrait look stunning!
const UPLOADED_MINH_HUYEN_FILES: string[] = [
  'media_1792494809466_tnnswj.jpg', // 1. Minh Huyen in white Ao dai holding feather fan & pink blossoms
  'media_1792494819141_8t0f7j.jpg', // 2. Close-up couple portrait on campus
  'media_1792494810945_relqcd.jpg', // 3. Couple holding hands at graduation with flower bouquet
  'media_1792494816507_8ak29j.jpg', // 4. Minh Huyen night portrait on balcony
  'media_1792494809752_xi5nnv.jpg', // 5. Couple smiling together at night
  'media_1792494810595_1txitr.jpg', // 6. Minh Huyen graduation portrait
  'media_1792494807824_zp91aa.jpg', // 7. Minh Huyen peace-sign selfie in yellow sweater
  'media_1792494810438_1evxeb.jpg', // 8. Oil painting couple portrait
  'media_1792494809755_3p2pvh.jpg', // 9. Couple holding flower bouquets at VNU
  'media_1792494810034_3lj5nf.jpg', // 10. Couple night street selfie
  'media_1792494810025_k61vdx.jpg', // 11. Couple selfie under colorful lanterns
  'media_1792494807033_2579ff.jpg', // 12. Minh Huyen smiling at VNU
  'media_1792494802251_1n3kwf.jpg', // 13. Couple heart hands selfie
  'media_1792494795456_prga1u.mp4',
  'media_1792494795684_tflgmk.mp4',
  'media_1792494806727_39lj7u.jpg',
  'media_1792494807018_zu1gny.jpg',
  'media_1792494807268_wqizwn.jpg',
  'media_1792494807315_dbmh84.mp4',
  'media_1792494807697_d81otz.mp4',
  'media_1792494808737_7ewso3.jpg',
  'media_1792494809247_qeupkt.jpg',
  'media_1792494809468_6lb0qe.jpg',
  'media_1792494809736_6wtuhb.jpg',
  'media_1792494810048_pxs566.jpg',
  'media_1792494810239_cppjn6.jpg',
  'media_1792494810245_9febu0.jpg',
  'media_1792494810756_7bhil2.jpg',
  'media_1792494811523_vbtl78.mp4',
  'media_1792494812343_f6daxq.jpg',
  'media_1792494812546_dq143s.jpg',
  'media_1792494813237_j0b16i.mp4',
  'media_1792494816233_zaedef.mp4',
  'media_1792494817013_z1ulbr.mp4',
  'media_1792494817679_res5lw.mp4',
  'media_1792494818571_mqhkxe.jpg',
  'media_1792494818997_i30p6w.jpg',
  'media_1792494821032_6jk51b.jpg',
  'media_1792494821170_koqkb1.jpg',
  'media_1792494795229_0psv2d.jpg',
  'media_1792494795227_qpklun.jpg',
  'media_1792494795585_5a780i.jpg',
  'media_1792494795596_3gsa3z.jpg',
  'media_1792494795873_e0pevj.jpg',
  'media_1792494796063_u5wwe0.jpg',
  'media_1792494796224_3z7z30.jpg',
  'media_1792494795242_e643ti.jpg',
];

export function getDefaultMemories(): MemoryItem[] {
  return UPLOADED_MINH_HUYEN_FILES.map((fileName, idx) => {
    const isVideo = /\.(mp4|mov|webm)$/i.test(fileName);
    const url = `/uploads/${fileName}`;
    return {
      id: `mh-upload-${idx}`,
      imageUrl: isVideo ? '' : url,
      videoUrl: isVideo ? url : undefined,
      mediaType: isVideo ? 'video' : 'image',
      caption: isVideo ? `Video kỷ niệm #${idx + 1}` : `Kỷ niệm #${idx + 1}`,
      date: '20/10',
      note: isVideo
        ? 'Khoảnh khắc sống động của hai đứa mình ❤'
        : 'Chúc Minh Huyền lúc nào cũng xinh đẹp, rạng rỡ và hạnh phúc.',
    };
  });
}

export function getDefaultGiftConfig(): GiftConfig {
  const memories = getDefaultMemories();
  return {
    id: 'love-2010',
    particlePhrases: [
      'Chúc Minh Huyền',
      'Ngày Phụ\nNữ Việt Nam',
      '20/10',
      'vui vẻ !',
    ],
    floatingWishes: [
      'Chúc em luôn yêu đời',
      'Chúc mừng ngày phụ nữ Việt Nam',
      'yêu em',
      'mãi yêu em',
      '20/10',
      'Mong mọi điều dịu dàng sẽ đến với em',
      'luôn vui vẻ và hạnh phúc',
      'Chúc em luôn xinh đẹp',
      'cầu mọi may mắn',
    ],
    memories,
    loveLetter: {
      recipient: 'Gửi Minh Huyền bé bỏng',
      title: 'Dành tặng em 20/10',
      body: 'Anh chúc em ngày 20/10 lúc nào cũng xinh đẹp, may mắn, nhiều sức khỏe và lúc nào cũng vui vẻ. Anh mong rằng em sẽ luôn luôn hạnh phúc sau này dù chuyện gì có xảy ra đi chăng nữa, hãy thật yêu thương bản thân nhé\n\nCảm ơn em vì tất cả. ❤',
      signature: 'Thương yêu Minh Huyền',
      date: '20/10',
      footerPhotoUrl: '/uploads/media_1792494809466_tnnswj.jpg',
      footerVideoUrl: '/uploads/media_1792494795456_prga1u.mp4',
    },
    musicTrackIndex: 0,
  };
}

export function sanitizeLegacyGiftConfig(raw: GiftConfig): GiftConfig {
  const defaults = getDefaultGiftConfig();
  if (!raw || typeof raw !== 'object') return defaults;

  const legacyCaptions = new Set([
    'First Glance',
    'Starlight Dates',
    'Eternal Orbit',
    'Your Sweet Smile',
    'Warm Embrace',
    'Blooming Rose',
  ]);

  const rawList = (Array.isArray(raw.memories) ? raw.memories : []).filter(
    (m) =>
      !EXCLUDED_BOUQUET_ASSET_FILES.has(m.imageUrl || '') &&
      !EXCLUDED_BOUQUET_ASSET_FILES.has(m.videoUrl || '')
  );
  const hasLegacyMemories =
    rawList.length === 0 ||
    rawList.some(
      (m) =>
        (!m.imageUrl && !m.videoUrl) ||
        legacyCaptions.has(m.caption) ||
        m.id === 'mem-1' ||
        m.id === 'mem-2'
    );

  // If rawList starts with the old blurry/ceiling photo 'media_1792494795227_qpklun.jpg',
  // re-order using the curated default order while keeping any newly uploaded user files at the top!
  const startsWithOldUncuratedFirst =
    rawList[0]?.imageUrl === '/uploads/media_1792494795227_qpklun.jpg';

  let cleanMemories =
    hasLegacyMemories || startsWithOldUncuratedFirst
      ? defaults.memories
      : rawList;

  if (cleanMemories.length < defaults.memories.length) {
    const existingKeys = new Set(
      cleanMemories.map((m) => m.videoUrl || m.imageUrl).filter(Boolean)
    );
    const missingDefaults = defaults.memories.filter(
      (d) => !existingKeys.has(d.videoUrl || d.imageUrl)
    );
    cleanMemories = [...cleanMemories, ...missingDefaults];
  }

  const cleanFooterPhoto =
    !raw.loveLetter?.footerPhotoUrl ||
    hasLegacyMemories ||
    raw.loveLetter.footerPhotoUrl === '/uploads/media_1792494795229_0psv2d.jpg'
      ? defaults.loveLetter.footerPhotoUrl
      : raw.loveLetter.footerPhotoUrl;

  return {
    ...defaults,
    ...raw,
    particlePhrases:
      Array.isArray(raw.particlePhrases) && raw.particlePhrases.length > 0
        ? raw.particlePhrases
        : defaults.particlePhrases,
    floatingWishes:
      Array.isArray(raw.floatingWishes) && raw.floatingWishes.length > 0
        ? raw.floatingWishes
        : defaults.floatingWishes,
    memories: cleanMemories,
    loveLetter: {
      ...defaults.loveLetter,
      ...(raw.loveLetter || {}),
      footerPhotoUrl: cleanFooterPhoto,
    },
  };
}

/**
 * Uploads a raw binary Blob/File to /api/upload-raw so the server stores it in /public/uploads/
 * and returns a short, fast HTTP URL (/uploads/media_xxx.jpg or .mp4) that works across PC and iPhone QR.
 */
async function uploadBlobToServer(
  blob: Blob,
  ext: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/upload-raw?ext=${encodeURIComponent(ext)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: blob,
      }
    );
    const data = await res.json();
    if (data?.ok && typeof data.url === 'string') {
      return data.url;
    }
  } catch {
    // Fallback to local object/data URL
  }
  return null;
}

export function compressUploadedImage(
  fileOrBlob: Blob,
  maxDimension = 840,
  quality = 0.86
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Định dạng ảnh không hợp lệ'));
    };
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      canvas.toBlob(
        (b) => {
          resolve({
            dataUrl,
            blob: b || fileOrBlob,
          });
        },
        'image/jpeg',
        quality
      );
    };
    img.src = objUrl;
  });
}

/**
 * Extracts a thumbnail poster frame from a Video file (.mov, .mp4, .webm) preserving its true aspect ratio!
 */
function extractVideoPosterFrame(
  videoBlob: Blob,
  fallbackIndex: number
): Promise<string> {
  return new Promise((resolve) => {
    const fallbackUrl = createSunlitPortraitDataUrl(fallbackIndex);
    const url = URL.createObjectURL(videoBlob);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    let settled = false;
    const finish = (poster: string) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
      resolve(poster);
    };

    const timeout = window.setTimeout(() => {
      finish(fallbackUrl);
    }, 1500);

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.25, (video.duration || 1) * 0.1);
      } catch {
        window.clearTimeout(timeout);
        finish(fallbackUrl);
      }
    };

    video.onseeked = () => {
      try {
        let w = video.videoWidth || 480;
        let h = video.videoHeight || 640;
        const maxDim = 640;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          window.clearTimeout(timeout);
          finish(canvas.toDataURL('image/jpeg', 0.84));
          return;
        }
      } catch {
        // Ignore
      }
      window.clearTimeout(timeout);
      finish(fallbackUrl);
    };

    video.onerror = () => {
      window.clearTimeout(timeout);
      finish(fallbackUrl);
    };

    video.src = url;
  });
}

/**
 * Fast parallel bulk processor supporting:
 * - Standard images (.jpg, .jpeg, .png, .webp, .avif)
 * - iPhone HEIC photos (.heic, .heif) via heic2any
 * - Videos (.mov, .mp4, .webm, .m4v) -> played in parallel in 3D Sphere & 3D Galaxy!
 * - Archive files (.zip) -> automatically unpacked via JSZip!
 */
export async function processBulkUploadedFiles(
  rawFiles: FileList | File[],
  onProgress?: (done: number, total: number, statusText: string) => void
): Promise<MemoryItem[]> {
  const inputList = Array.from(rawFiles);
  const directMediaFiles: File[] = [];
  const zipFiles: File[] = [];

  const isImageExt = (name: string) =>
    /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(name);
  const isVideoExt = (name: string) => /\.(mov|mp4|webm|m4v)$/i.test(name);
  const isZipExt = (name: string) => /\.zip$/i.test(name);

  for (const f of inputList) {
    if (isZipExt(f.name)) {
      zipFiles.push(f);
    } else if (
      isImageExt(f.name) ||
      isVideoExt(f.name) ||
      f.type.startsWith('image/') ||
      f.type.startsWith('video/')
    ) {
      directMediaFiles.push(f);
    }
  }

  // If the user selected a .zip file (or a folder that only has .zip files), unpack the .zip files!
  if (zipFiles.length > 0 && directMediaFiles.length < 5) {
    onProgress?.(0, zipFiles.length, 'Đang giải nén file .ZIP...');
    for (const zf of zipFiles) {
      try {
        const zip = await JSZip.loadAsync(zf);
        const entries = Object.values(zip.files).filter(
          (entry) =>
            !entry.dir &&
            !entry.name.includes('__MACOSX') &&
            (isImageExt(entry.name) || isVideoExt(entry.name))
        );
        for (const entry of entries) {
          const blob = await entry.async('blob');
          const baseName = entry.name.split('/').pop() || entry.name;
          directMediaFiles.push(new File([blob], baseName));
        }
      } catch (err) {
        console.warn('Could not unpack zip:', err);
      }
    }
  }

  // Cap at 110 items so even huge folders load smoothly at 60fps in WebGL
  const filesToProcess = directMediaFiles.slice(0, 110);
  const total = filesToProcess.length;
  if (total === 0) return [];

  let completed = 0;
  const results: (MemoryItem | null)[] = new Array(total).fill(null);

  const processSingleFile = async (file: File, index: number) => {
    const lowerName = file.name.toLowerCase();
    const cleanCaption = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/\.heic$/i, '')
      .slice(0, 26);

    try {
      // CASE 1: VIDEO FILE (.mov, .mp4, .webm)
      if (isVideoExt(lowerName) || file.type.startsWith('video/')) {
        const ext = lowerName.endsWith('.webm') ? 'webm' : 'mp4';
        const [serverUrl, posterDataUrl] = await Promise.all([
          uploadBlobToServer(file, ext),
          extractVideoPosterFrame(file, index),
        ]);
        const finalVideoUrl = serverUrl || URL.createObjectURL(file);

        results[index] = {
          id: `vid-${Date.now()}-${index}`,
          imageUrl: posterDataUrl,
          videoUrl: finalVideoUrl,
          mediaType: 'video',
          caption: cleanCaption || `Video kỷ niệm #${index + 1}`,
          date: '20/10',
          note: 'Khoảnh khắc sống động của hai đứa mình ❤',
        };
      }
      // CASE 2: iPhone HEIC / HEIF PHOTO
      else if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
        let targetBlob: Blob = file;
        try {
          const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.84,
          });
          targetBlob = Array.isArray(converted) ? converted[0] : converted;
        } catch {
          // Browser may support HEIC natively
        }
        const { dataUrl, blob } = await compressUploadedImage(
          targetBlob,
          760,
          0.84
        );
        const serverUrl = await uploadBlobToServer(blob, 'jpg');

        results[index] = {
          id: `mem-${Date.now()}-${index}`,
          imageUrl: serverUrl || dataUrl,
          mediaType: 'image',
          caption: cleanCaption || `Kỷ niệm #${index + 1}`,
          date: '20/10',
          note: 'Chúc em lúc nào cũng xinh đẹp, rạng rỡ và hạnh phúc bên anh.',
        };
      }
      // CASE 3: STANDARD IMAGE (.jpg, .png, .webp)
      else {
        const { dataUrl, blob } = await compressUploadedImage(file, 760, 0.84);
        const serverUrl = await uploadBlobToServer(blob, 'jpg');

        results[index] = {
          id: `mem-${Date.now()}-${index}`,
          imageUrl: serverUrl || dataUrl,
          mediaType: 'image',
          caption: cleanCaption || `Kỷ niệm #${index + 1}`,
          date: '20/10',
          note: 'Chúc em lúc nào cũng xinh đẹp, rạng rỡ và hạnh phúc bên anh.',
        };
      }
    } catch (err) {
      console.warn(`Skipped unsupported file ${file.name}:`, err);
    } finally {
      completed++;
      onProgress?.(
        completed,
        total,
        `Đang tải song song (${completed}/${total}): ${file.name}`
      );
    }
  };

  // Run with high-speed concurrency = 6
  const concurrency = 6;
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, total) },
    async () => {
      while (cursor < total) {
        const currentIdx = cursor++;
        await processSingleFile(filesToProcess[currentIdx], currentIdx);
      }
    }
  );

  await Promise.all(workers);

  return results.filter((item): item is MemoryItem => item !== null);
}
