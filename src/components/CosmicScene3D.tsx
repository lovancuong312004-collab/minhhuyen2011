import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MemoryItem } from '../types/gift';
import { createSunlitPortraitDataUrl } from '../utils/defaultMemories';

export type ExperienceStage =
  | 'idle'
  | 'vortex'
  | 'text'
  | 'bouquet'
  | 'dissolve'
  | 'sphere'
  | 'galaxy';

interface CosmicScene3DProps {
  stage: ExperienceStage;
  showRealBouquet: boolean;
  activePhraseIndex: number;
  particlePhrases: string[];
  floatingWishes: string[];
  memories: MemoryItem[];
  externalZoomDelta?: number;
  onSphereTap: () => void;
  onSelectMemory: (memory: MemoryItem) => void;
}

const PARTICLE_COUNT = 6400;
const BG_STAR_COUNT = 900;
const MAX_CONCURRENT_VIDEOS = 6;
const SPHERE_RADIUS = 12.0;

let sharedScratchCanvas: HTMLCanvasElement | null = null;
function getScratchCanvas(w: number, h: number): HTMLCanvasElement {
  if (!sharedScratchCanvas) {
    sharedScratchCanvas = document.createElement('canvas');
  }
  if (sharedScratchCanvas.width !== w || sharedScratchCanvas.height !== h) {
    sharedScratchCanvas.width = w;
    sharedScratchCanvas.height = h;
  }
  return sharedScratchCanvas;
}

/**
 * Uniformly samples multi-line Vietnamese calligraphy ("Lobster" / "Dancing Script")
 * across the ENTIRE height and width of the text so bottom lines and descenders are NEVER cut off!
 */
function sampleTextParticles(
  phrase: string,
  count: number
): {
  positions: Float32Array;
  colors: string[];
  sizes: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Array<string>(count);
  const sizes = new Float32Array(count);

  const cw = 1120;
  const ch = 640;
  const canvas = getScratchCanvas(cw, ch);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, cw, ch);

  const lines = phrase.split('\n');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxLineChars = Math.max(...lines.map((l) => l.trim().length), 1);
  let fontSize = lines.length === 1 ? 136 : 108;
  if (maxLineChars <= 7 && lines.length === 1) {
    fontSize = 164;
  } else if (maxLineChars > 14) {
    fontSize = Math.max(82, Math.round(1320 / maxLineChars));
  }

  ctx.font = `400 ${fontSize}px "Lobster", "Dancing Script", "Quicksand", sans-serif`;

  const lineHeight = fontSize * 1.32;
  const totalHeight = lines.length * lineHeight;
  const startY = (ch - totalHeight) / 2 + lineHeight / 2;

  ctx.fillStyle = '#ffffff';
  lines.forEach((line, idx) => {
    ctx.fillText(line.trim(), cw / 2, startY + idx * lineHeight);
  });

  const imgData = ctx.getImageData(0, 0, cw, ch).data;
  const validPixels: { x: number; y: number; edge: boolean }[] = [];

  for (let y = 4; y < ch - 4; y += 2) {
    for (let x = 4; x < cw - 4; x += 2) {
      const idx = (y * cw + x) * 4;
      const alpha = imgData[idx];
      if (alpha > 125) {
        const rightAlpha = imgData[idx + 8];
        const downAlpha = imgData[((y + 2) * cw + x) * 4];
        const edge = rightAlpha <= 125 || downAlpha <= 125;
        validPixels.push({ x, y, edge });
      }
    }
  }

  const numValid = validPixels.length;
  const textParticleBudget = Math.floor(count * 0.9);
  const palette = [
    '#ff1a75',
    '#ff3385',
    '#ff4da6',
    '#ff66b3',
    '#ff85c0',
    '#ffd6eb',
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    if (numValid > 0 && i < textParticleBudget) {
      const sampleIndex = Math.floor((i / textParticleBudget) * numValid);
      const pick = validPixels[sampleIndex];

      positions[i3] =
        (pick.x - cw / 2) * 0.041 + (Math.random() - 0.5) * 0.03;
      positions[i3 + 1] =
        (ch / 2 - pick.y) * 0.041 + (Math.random() - 0.5) * 0.03;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.22;

      colors[i] = pick.edge
        ? '#ffd6eb'
        : palette[i % (palette.length - 1)];
      sizes[i] = pick.edge ? 1.65 : 1.3 + (i % 3) * 0.2;
    } else {
      positions[i3] = (Math.random() - 0.5) * 66;
      positions[i3 + 1] = (Math.random() - 0.5) * 54;
      positions[i3 + 2] = (Math.random() - 0.5) * 34 - 8;
      colors[i] = palette[i % palette.length];
      sizes[i] = 0.9 + Math.random() * 0.75;
    }
  }

  return { positions, colors, sizes };
}

function sampleBouquetParticles(count: number): {
  positions: Float32Array;
  colors: string[];
  sizes: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Array<string>(count);
  const sizes = new Float32Array(count);

  const cw = 360;
  const ch = 390;
  const canvas = getScratchCanvas(cw, ch);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, cw, ch);

  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.moveTo(180, 330);
  ctx.lineTo(48, 130);
  ctx.quadraticCurveTo(180, 48, 312, 130);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#52b788';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(
      72 + i * 30,
      106 - Math.sin((i / 7) * Math.PI) * 28,
      18,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const roses = [
    [128, 116, '#ec4899'],
    [180, 106, '#f43f5e'],
    [232, 116, '#ec4899'],
    [102, 154, '#f472b6'],
    [154, 150, '#e11d48'],
    [206, 150, '#db2777'],
    [258, 154, '#f472b6'],
    [128, 188, '#f43f5e'],
    [180, 188, '#ec4899'],
    [232, 188, '#f43f5e'],
  ] as const;

  roses.forEach(([rx, ry, col]) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(rx, ry, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.arc(rx, ry, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(82, 190);
  ctx.quadraticCurveTo(180, 222, 278, 190);
  ctx.lineTo(210, 350);
  ctx.lineTo(150, 350);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(142, 265, 76, 18);

  const imgData = ctx.getImageData(0, 0, cw, ch).data;
  const validPixels: { x: number; y: number; hex: string }[] = [];

  for (let y = 0; y < ch; y += 3) {
    for (let x = 0; x < cw; x += 2) {
      const idx = (y * cw + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      if (r + g + b > 60) {
        validPixels.push({
          x,
          y,
          hex: `rgb(${r},${g},${b})`,
        });
      }
    }
  }

  const numValid = validPixels.length;
  const bouquetBudget = Math.floor(count * 0.9);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    if (numValid > 0 && i < bouquetBudget) {
      const p = validPixels[Math.floor((i / bouquetBudget) * numValid)];
      positions[i3] =
        (p.x - cw / 2) * 0.078 + (Math.random() - 0.5) * 0.14;
      positions[i3 + 1] = (ch / 2 - p.y) * 0.078 + 0.6;
      positions[i3 + 2] =
        Math.cos((p.x - cw / 2) * 0.03) * 2.0 +
        (Math.random() - 0.5) * 0.3;
      colors[i] = p.hex;
      sizes[i] = 1.35 + Math.random() * 0.45;
    } else {
      positions[i3] = (Math.random() - 0.5) * 65;
      positions[i3 + 1] = (Math.random() - 0.5) * 55;
      positions[i3 + 2] = (Math.random() - 0.5) * 35 - 8;
      colors[i] = '#ff4da6';
      sizes[i] = 0.9 + Math.random() * 0.6;
    }
  }

  return { positions, colors, sizes };
}

/**
 * Samples a luxury 3D Crystal Sphere with:
 * - Inner 3D Glowing Heart Core right inside the center of the globe
 * - Geodesic Fibonacci Crystal Sphere Shell
 * - Dual intersecting tilted Saturn/Angelic Halo Rings orbiting the sphere
 */
function sampleSphereParticles(count: number): {
  positions: Float32Array;
  colors: string[];
  sizes: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Array<string>(count);
  const sizes = new Float32Array(count);

  const heartCoreCount = Math.floor(count * 0.18);
  const sphereShellCount = Math.floor(count * 0.52);
  const ringCount = Math.floor(count * 0.22);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const palette = [
    '#ff1a75',
    '#ff3385',
    '#ff5ca8',
    '#ff85c0',
    '#ffb3d9',
    '#fff0f6',
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    if (i < heartCoreCount) {
      // 1. Inner 3D Glowing Heart Core inside the center of the 3D Crystal Sphere
      const t = Math.random() * Math.PI * 2;
      const u = (Math.random() - 0.5) * Math.PI;
      const r = 0.27 * (0.72 + 0.28 * Math.cbrt(Math.random()));
      positions[i3] = r * 16 * Math.pow(Math.sin(t), 3) * Math.cos(u);
      positions[i3 + 1] =
        r *
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)) +
        0.35;
      positions[i3 + 2] = r * 9 * Math.sin(u);
      colors[i] = i % 3 === 0 ? '#fff0f6' : i % 3 === 1 ? '#ff85c0' : '#ff1a75';
      sizes[i] = 1.45 + Math.random() * 0.65;
    } else if (i < heartCoreCount + sphereShellCount) {
      // 2. Fibonacci 3D Crystal Sphere Surface
      const idx = i - heartCoreCount;
      const t = (idx + 0.5) / sphereShellCount;
      const phi = Math.acos(1 - 2 * t);
      const theta = (2 * Math.PI * idx) / goldenRatio;
      const r = SPHERE_RADIUS * (0.98 + (Math.random() - 0.5) * 0.04);

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi);
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      colors[i] = palette[idx % palette.length];
      sizes[i] = idx % 5 === 0 ? 1.95 : 1.25 + (idx % 3) * 0.22;
    } else if (i < heartCoreCount + sphereShellCount + ringCount) {
      // 3. Dual Intersecting Tilted Cosmic Halo Rings orbiting the 3D Sphere
      const rIdx = i - (heartCoreCount + sphereShellCount);
      const isSecondRing = rIdx % 2 === 1;
      const u = rIdx / ringCount;
      const angle = u * Math.PI * 2 * 4;
      const ringR =
        SPHERE_RADIUS * (isSecondRing ? 1.42 : 1.26) +
        (Math.random() - 0.5) * 1.4;
      const rx = Math.cos(angle) * ringR;
      const rz = Math.sin(angle) * ringR;
      const tiltX = isSecondRing ? -0.34 : 0.38;
      const tiltZ = isSecondRing ? 0.22 : -0.16;

      const y1 = -rz * Math.sin(tiltX) + (Math.random() - 0.5) * 0.3;
      const z1 = rz * Math.cos(tiltX);
      const x2 = rx * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
      const y2 = rx * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);

      positions[i3] = x2;
      positions[i3 + 1] = y2;
      positions[i3 + 2] = z1;
      colors[i] = rIdx % 3 === 0 ? '#ffffff' : rIdx % 3 === 1 ? '#ffd6eb' : '#ff5ca8';
      sizes[i] = 1.35 + Math.random() * 0.55;
    } else {
      // 4. Outer deep-space starfield
      positions[i3] = (Math.random() - 0.5) * 76;
      positions[i3 + 1] = (Math.random() - 0.5) * 66;
      positions[i3 + 2] = (Math.random() - 0.5) * 45 - 8;
      colors[i] = palette[i % palette.length];
      sizes[i] = 0.95 + Math.random() * 0.7;
    }
  }

  return { positions, colors, sizes };
}

/**
 * Pre-renders a 3D glossy heart sprite ONCE onto a 96x96 offscreen canvas
 */
let cachedHeartSprite: HTMLCanvasElement | null = null;
function getHeartSpriteCanvas(): HTMLCanvasElement {
  if (cachedHeartSprite) return cachedHeartSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(48, 50);
  ctx.shadowColor = 'rgba(255, 23, 68, 0.75)';
  ctx.shadowBlur = 10;

  const hGrad = ctx.createRadialGradient(-9, -12, 3, 0, 4, 38);
  hGrad.addColorStop(0, '#ffccd5');
  hGrad.addColorStop(0.3, '#ff1e56');
  hGrad.addColorStop(0.75, '#d90429');
  hGrad.addColorStop(1, '#640d14');

  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.bezierCurveTo(-36, 3, -38, -28, -18, -28);
  ctx.bezierCurveTo(-7, -28, -1, -18, 0, -13);
  ctx.bezierCurveTo(1, -18, 7, -28, 18, -28);
  ctx.bezierCurveTo(38, -28, 36, 3, 0, 26);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 240, 245, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-14, -16, 6, 3.2, -0.45, 0, Math.PI * 2);
  ctx.fill();

  cachedHeartSprite = canvas;
  return canvas;
}

/**
 * Pre-renders each glowing neon pink wish phrase ONCE into a cached offscreen canvas
 */
const wishSpriteCache = new Map<string, HTMLCanvasElement>();
function getNeonWishSprite(text: string): HTMLCanvasElement {
  const existing = wishSpriteCache.get(text);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  const w = Math.max(260, Math.min(680, text.length * 22 + 64));
  const h = 76;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.font = '700 28px "Quicksand", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff006a';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ff2a85';
  ctx.fillText(text, w / 2, h / 2);

  ctx.shadowColor = '#ff4da6';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#fff0f7';
  ctx.fillText(text, w / 2, h / 2);

  wishSpriteCache.set(text, canvas);
  return canvas;
}

/**
 * Pre-renders a loaded photo into a luxury crystal rounded-corner card sprite
 * preserving its TRUE ORIGINAL ASPECT RATIO with zero per-frame clip overhead!
 */
interface CachedMediaEntry {
  spriteCanvas: HTMLCanvasElement | null;
  videoEl?: HTMLVideoElement;
  aspect: number; // width / height in original proportions
  ready: boolean;
  isVideo: boolean;
}

function buildRoundedPhotoSprite(
  source: HTMLImageElement | HTMLVideoElement,
  srcW: number,
  srcH: number
): { sprite: HTMLCanvasElement; aspect: number } {
  const rawAspect = srcW / Math.max(srcH, 1);
  const aspect = THREE.MathUtils.clamp(rawAspect, 0.46, 2.05);

  const maxSide = 276;
  const drawW = aspect >= 1 ? maxSide : Math.round(maxSide * aspect);
  const drawH = aspect >= 1 ? Math.round(maxSide / aspect) : maxSide;

  const pad = 8;
  const cw = drawW + pad * 2;
  const ch = drawH + pad * 2;
  const radius = Math.max(12, Math.round(Math.min(drawW, drawH) * 0.1));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;

  // Soft pink outer glow baked once into the sprite
  ctx.save();
  ctx.shadowColor = 'rgba(255, 64, 150, 0.65)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#1f081e';
  ctx.beginPath();
  ctx.roundRect(pad, pad, drawW, drawH, radius);
  ctx.fill();
  ctx.restore();

  // Clipped original-aspect-ratio photo
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, drawW, drawH, radius);
  ctx.clip();
  ctx.drawImage(source, 0, 0, srcW, srcH, pad, pad, drawW, drawH);

  // Subtle top glass reflection sheen
  const sheen = ctx.createLinearGradient(pad, pad, pad + drawW * 0.6, pad + drawH * 0.45);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(pad, pad, drawW, drawH);
  ctx.restore();

  // Outer rose-pink rim + crisp inner white crystal border
  ctx.strokeStyle = 'rgba(255, 133, 192, 0.92)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.roundRect(pad, pad, drawW, drawH, radius);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 245, 250, 0.9)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(pad + 1.5, pad + 1.5, drawW - 3, drawH - 3, Math.max(8, radius - 1.5));
  ctx.stroke();

  return { sprite: canvas, aspect };
}

export const CosmicScene3D: React.FC<CosmicScene3DProps> = ({
  stage,
  showRealBouquet,
  activePhraseIndex,
  particlePhrases,
  floatingWishes,
  memories,
  externalZoomDelta = 0,
  onSphereTap,
  onSelectMemory,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<ExperienceStage>(stage);
  const showRealBouquetRef = useRef<boolean>(showRealBouquet);
  const phraseIdxRef = useRef<number>(activePhraseIndex);
  const phrasesRef = useRef<string[]>(particlePhrases);
  const wishesRef = useRef<string[]>(floatingWishes);
  const memoriesRef = useRef<MemoryItem[]>(memories);
  const onSphereTapRef = useRef(onSphereTap);
  const onSelectMemoryRef = useRef(onSelectMemory);

  const triggerTargetUpdateRef = useRef<(() => void) | null>(null);
  const applyExternalZoomRef = useRef<((delta: number) => void) | null>(null);

  useEffect(() => {
    onSphereTapRef.current = onSphereTap;
  }, [onSphereTap]);

  useEffect(() => {
    onSelectMemoryRef.current = onSelectMemory;
  }, [onSelectMemory]);

  useEffect(() => {
    if (externalZoomDelta !== 0) {
      applyExternalZoomRef.current?.(externalZoomDelta);
    }
  }, [externalZoomDelta]);

  useEffect(() => {
    stageRef.current = stage;
    showRealBouquetRef.current = showRealBouquet;
    phraseIdxRef.current = activePhraseIndex;
    phrasesRef.current = particlePhrases;
    wishesRef.current = floatingWishes;
    triggerTargetUpdateRef.current?.();
  }, [
    stage,
    activePhraseIndex,
    showRealBouquet,
    particlePhrases,
    floatingWishes,
  ]);

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const updateSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    updateSize();

    // 1. Deep-space background twinkling stars
    const bgX = new Float32Array(BG_STAR_COUNT);
    const bgY = new Float32Array(BG_STAR_COUNT);
    const bgZ = new Float32Array(BG_STAR_COUNT);
    const bgPhase = new Float32Array(BG_STAR_COUNT);
    const bgCol = new Array<string>(BG_STAR_COUNT);

    for (let i = 0; i < BG_STAR_COUNT; i++) {
      bgX[i] = (Math.random() - 0.5) * 140;
      bgY[i] = (Math.random() - 0.5) * 120;
      bgZ[i] = -12 - Math.random() * 65;
      bgPhase[i] = Math.random() * Math.PI * 2;
      bgCol[i] =
        i % 3 === 0 ? '#ffd6eb' : i % 3 === 1 ? '#ff85c0' : '#ff2a85';
    }

    // 2. Foreground 3D Morphing Particle System (6,400 particles)
    const curX = new Float32Array(PARTICLE_COUNT);
    const curY = new Float32Array(PARTICLE_COUNT);
    const curZ = new Float32Array(PARTICLE_COUNT);
    const tarX = new Float32Array(PARTICLE_COUNT);
    const tarY = new Float32Array(PARTICLE_COUNT);
    const tarZ = new Float32Array(PARTICLE_COUNT);
    const pSize = new Float32Array(PARTICLE_COUNT);
    const tarSize = new Float32Array(PARTICLE_COUNT);
    const pCol = new Array<string>(PARTICLE_COUNT);

    let scatterBurstTime = 0;
    let bouquetStageElapsed = 0;
    let dissolveStageElapsed = 0;
    let sphereStageElapsed = 0;
    let galaxyStageElapsed = 0;

    let lastStage: ExperienceStage | null = null;
    let lastPhraseIdx = -1;
    let lastRealBouquet = false;

    const paletteIdle = [
      '#ff1a75',
      '#ff2a85',
      '#ff4da6',
      '#ff66b3',
      '#ff85c0',
      '#ffb3d9',
    ];

    const assignParticleTargets = () => {
      const st = stageRef.current;
      const pIdx = phraseIdxRef.current;
      const rb = showRealBouquetRef.current;

      if (
        st === lastStage &&
        pIdx === lastPhraseIdx &&
        rb === lastRealBouquet
      ) {
        return;
      }

      if (st === 'bouquet' && lastStage !== 'bouquet') {
        bouquetStageElapsed = 0;
      }
      if (st === 'dissolve' && lastStage !== 'dissolve') {
        dissolveStageElapsed = 0;
      }
      if (st === 'sphere' && lastStage !== 'sphere') {
        sphereStageElapsed = 0;
        targetZoomScale = 1.0;
      }
      if (st === 'galaxy' && lastStage !== 'galaxy') {
        galaxyStageElapsed = 0;
        targetZoomScale = 1.0;
      }

      lastStage = st;
      lastPhraseIdx = pIdx;
      lastRealBouquet = rb;

      if (st === 'idle') {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (i < PARTICLE_COUNT * 0.25) {
            const ang = Math.random() * Math.PI * 2;
            const spread = (Math.random() + Math.random()) * 0.5 - 0.5;
            const r = 6.2 + spread * 4.2;
            tarX[i] = Math.cos(ang) * r;
            tarY[i] = Math.sin(ang) * r + 1.1;
            tarZ[i] = (Math.random() - 0.5) * 4.0;
            tarSize[i] = 1.2 + Math.random() * 0.7;
          } else {
            tarX[i] = (Math.random() - 0.5) * 52;
            tarY[i] = (Math.random() - 0.5) * 58;
            tarZ[i] = (Math.random() - 0.5) * 28;
            tarSize[i] = 1.0 + Math.random() * 0.9;
          }
          pCol[i] = paletteIdle[i % paletteIdle.length];
        }
      } else if (st === 'vortex') {
        scatterBurstTime = 0.22;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const a = Math.random() * Math.PI * 2;
          const b = Math.acos(2 * Math.random() - 1);
          const r = 6.4 * Math.cbrt(Math.random());
          tarX[i] = r * Math.sin(b) * Math.cos(a);
          tarY[i] = r * Math.sin(b) * Math.sin(a) + 0.8;
          tarZ[i] = r * Math.cos(b);
          tarSize[i] = 1.25 + Math.random() * 0.65;
          pCol[i] = paletteIdle[i % paletteIdle.length];
        }
      } else if (st === 'text') {
        scatterBurstTime = 0.28;
        const list = phrasesRef.current;
        const phrase = list[pIdx % list.length] || 'Chúc Minh Huyền';
        const sampled = sampleTextParticles(phrase, PARTICLE_COUNT);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          tarX[i] = sampled.positions[i * 3];
          tarY[i] = sampled.positions[i * 3 + 1];
          tarZ[i] = sampled.positions[i * 3 + 2];
          pCol[i] = sampled.colors[i];
          tarSize[i] = sampled.sizes[i];
        }
      } else if (st === 'bouquet') {
        if (!rb) {
          scatterBurstTime = 0.25;
          const sampled = sampleBouquetParticles(PARTICLE_COUNT);
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            tarX[i] = sampled.positions[i * 3];
            tarY[i] = sampled.positions[i * 3 + 1];
            tarZ[i] = sampled.positions[i * 3 + 2];
            pCol[i] = sampled.colors[i];
            tarSize[i] = sampled.sizes[i];
          }
        } else {
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            tarX[i] = (Math.random() - 0.5) * 72;
            tarY[i] = (Math.random() - 0.5) * 62;
            tarZ[i] = -6 - Math.random() * 30;
            pCol[i] = paletteIdle[i % paletteIdle.length];
            tarSize[i] = 1.0 + Math.random() * 0.8;
          }
        }
      } else if (st === 'dissolve') {
        scatterBurstTime = 0.24;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const t = Math.random() * Math.PI * 2;
          const u = (Math.random() - 0.5) * Math.PI;
          const r = 0.78 * Math.cbrt(Math.random());
          tarX[i] = r * 14 * Math.pow(Math.sin(t), 3) * Math.cos(u);
          tarY[i] =
            r *
              (11.5 * Math.cos(t) -
                4.2 * Math.cos(2 * t) -
                1.7 * Math.cos(3 * t) -
                0.8 * Math.cos(4 * t)) +
            1.0;
          tarZ[i] = r * 8 * Math.sin(u);
          pCol[i] = i % 3 === 0 ? '#ffd6eb' : '#ff4da6';
          tarSize[i] = 1.3 + Math.random() * 0.65;
        }
      } else if (st === 'sphere') {
        // 3D Crystal Photo & Video Sphere (Quả Cầu 3D)
        scatterBurstTime = 0.22;
        const sampled = sampleSphereParticles(PARTICLE_COUNT);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          tarX[i] = sampled.positions[i * 3];
          tarY[i] = sampled.positions[i * 3 + 1];
          tarZ[i] = sampled.positions[i * 3 + 2];
          pCol[i] = sampled.colors[i];
          tarSize[i] = sampled.sizes[i];
        }
      } else {
        // Stage 'galaxy' - Explodes outward into the wide 3D galaxy cosmos
        scatterBurstTime = 0.32;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          tarX[i] = (Math.random() - 0.5) * 88;
          tarY[i] = (Math.random() - 0.5) * 76;
          tarZ[i] = (Math.random() - 0.5) * 60 - 10;
          pCol[i] = paletteIdle[i % paletteIdle.length];
          tarSize[i] = 0.95 + Math.random() * 0.85;
        }
      }
    };

    triggerTargetUpdateRef.current = assignParticleTargets;

    // 3. Cached Original-Aspect-Ratio Media Manager (Zero per-frame clip overhead!)
    const mediaCache = new Map<string, CachedMediaEntry>();
    let activeVideoCount = 0;

    const getMediaEntry = (item: MemoryItem, idx: number): CachedMediaEntry => {
      const key = item.videoUrl || item.imageUrl || `fb-${idx % 6}`;
      const existing = mediaCache.get(key);
      if (existing) return existing;

      const entry: CachedMediaEntry = {
        spriteCanvas: null,
        aspect: 0.78, // natural portrait default until loaded
        ready: false,
        isVideo: item.mediaType === 'video' && Boolean(item.videoUrl),
      };
      mediaCache.set(key, entry);

      const imgUrl = item.imageUrl || createSunlitPortraitDataUrl(idx);
      if (imgUrl) {
        const img = new Image();
        img.onload = () => {
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            const built = buildRoundedPhotoSprite(
              img,
              img.naturalWidth,
              img.naturalHeight
            );
            entry.spriteCanvas = built.sprite;
            entry.aspect = built.aspect;
            entry.ready = true;
          }
        };
        img.onerror = () => {
          const fb = new Image();
          fb.onload = () => {
            const built = buildRoundedPhotoSprite(
              fb,
              fb.naturalWidth || 384,
              fb.naturalHeight || 384
            );
            entry.spriteCanvas = built.sprite;
            entry.aspect = built.aspect;
            entry.ready = true;
          };
          fb.src = createSunlitPortraitDataUrl(idx);
        };
        img.src = imgUrl;
      }

      if (
        item.mediaType === 'video' &&
        item.videoUrl &&
        activeVideoCount < MAX_CONCURRENT_VIDEOS
      ) {
        activeVideoCount++;
        const vid = document.createElement('video');
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.autoplay = true;
        vid.preload = 'auto';
        vid.onloadedmetadata = () => {
          if (vid.videoWidth > 0 && vid.videoHeight > 0) {
            entry.aspect = THREE.MathUtils.clamp(
              vid.videoWidth / vid.videoHeight,
              0.46,
              2.05
            );
            entry.ready = true;
          }
        };
        vid.src = item.videoUrl;
        vid.play().catch(() => {});
        entry.videoEl = vid;
      }

      return entry;
    };

    // Interaction state (Full 360° 3D rotation + inertia + Wide-Range Zoom In & Zoom Out)
    let isDragging = false;
    let downX = 0;
    let downY = 0;
    let prevX = 0;
    let prevY = 0;
    let rotY = 0;
    let rotX = 0.08;
    let targetRotY = 0;
    let targetRotX = 0.08;
    let velRotY = 0;
    let velRotX = 0;
    let manualFlowOffsetY = 0;
    let zoomScale = 1;
    let targetZoomScale = 1;
    let initialPinchDist = 0;
    let initialPinchZoom = 1;

    assignParticleTargets();
    curX.set(tarX);
    curY.set(tarY);
    curZ.set(tarZ);
    pSize.set(tarSize);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (stageRef.current === 'text') {
          lastStage = null;
          assignParticleTargets();
        }
      });
    }

    applyExternalZoomRef.current = (delta: number) => {
      if (delta === 999) {
        targetZoomScale = 1.0;
      } else {
        targetZoomScale = THREE.MathUtils.clamp(
          targetZoomScale * (delta > 0 ? 1.28 : 0.78),
          0.35,
          3.85
        );
      }
    };

    const hitTestableCards: {
      x: number;
      y: number;
      w: number;
      h: number;
      memory: MemoryItem;
    }[] = [];

    const resumeAllVideos = () => {
      mediaCache.forEach((entry) => {
        if (entry.videoEl && entry.videoEl.paused) {
          entry.videoEl.play().catch(() => {});
        }
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      resumeAllVideos();
      isDragging = true;
      velRotY = 0;
      velRotX = 0;
      canvas.style.cursor = 'grabbing';
      downX = e.clientX;
      downY = e.clientY;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      targetRotY += dx * 0.009;
      targetRotX = THREE.MathUtils.clamp(
        targetRotX + dy * 0.008,
        -1.45,
        1.45
      );
      velRotY = dx * 0.0048;
      velRotX = dy * 0.0038;
      if (stageRef.current === 'galaxy') {
        manualFlowOffsetY -= dy * 0.025;
      }
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      canvas.style.cursor = 'grab';
      const moveDist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moveDist < 10) {
        if (stageRef.current === 'sphere') {
          onSphereTapRef.current();
          return;
        }
        if (stageRef.current === 'galaxy') {
          for (let i = hitTestableCards.length - 1; i >= 0; i--) {
            const c = hitTestableCards[i];
            if (
              Math.abs(e.clientX - c.x) <= c.w * 0.54 &&
              Math.abs(e.clientY - c.y) <= c.h * 0.54
            ) {
              onSelectMemoryRef.current(c.memory);
              break;
            }
          }
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      resumeAllVideos();
      if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialPinchZoom = targetZoomScale;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDist > 10) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        targetZoomScale = THREE.MathUtils.clamp(
          initialPinchZoom * (dist / initialPinchDist),
          0.35,
          3.85
        );
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.ctrlKey ? 0.0065 : 0.0016;
      targetZoomScale = THREE.MathUtils.clamp(
        targetZoomScale * Math.exp(-e.deltaY * factor),
        0.35,
        3.85
      );
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    const heartSprite = getHeartSpriteCanvas();
    let animId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    // Helper to wrap a coordinate into [-halfSpan, +halfSpan] for continuous top-to-bottom falling stream
    const wrapRange = (val: number, halfSpan: number): number => {
      const span = halfSpan * 2;
      return ((((val + halfSpan) % span) + span) % span) - halfSpan;
    };

    // Helper to draw a 3D ring projected onto the 2D canvas with current 3D camera & rotation
    const drawProjected3DRing = (
      radius: number,
      tiltX: number,
      tiltZ: number,
      yOffset: number,
      segments: number,
      strokeStyle: string,
      lineWidth: number,
      cosY: number,
      sinY: number,
      cosX: number,
      sinX: number,
      camZ: number,
      fov: number
    ) => {
      const ctX = Math.cos(tiltX);
      const stx = Math.sin(tiltX);
      const ctz = Math.cos(tiltZ);
      const stz = Math.sin(tiltZ);

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      let started = false;

      for (let s = 0; s <= segments; s++) {
        const ang = (s / segments) * Math.PI * 2;
        const lx = Math.cos(ang) * radius;
        const lz = Math.sin(ang) * radius;

        // Apply local ring tilt
        const y1 = yOffset - lz * stx;
        const z1 = lz * ctX;
        const wx = lx * ctz - y1 * stz;
        const wy = lx * stz + y1 * ctz;
        const wz = z1;

        // Rotate by user's 3D globe rotation (rotY, rotX)
        const rx1 = wx * cosY + wz * sinY;
        const rz1 = -wx * sinY + wz * cosY;
        const ry = wy * cosX - rz1 * sinX;
        const rz = wy * sinX + rz1 * cosX;

        const depth = camZ - rz;
        if (depth <= 1.5) {
          started = false;
          continue;
        }
        const sc = fov / depth;
        const sx = width * 0.5 + rx1 * sc;
        const sy = height * 0.5 - ry * sc;

        if (!started) {
          ctx.moveTo(sx, sy);
          started = true;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
    };

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      elapsed += dt;

      const curStage = stageRef.current;
      if (curStage === 'bouquet') bouquetStageElapsed += dt;
      if (curStage === 'dissolve') dissolveStageElapsed += dt;
      if (curStage === 'sphere') sphereStageElapsed += dt;
      if (curStage === 'galaxy') galaxyStageElapsed += dt;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep cosmic background
      ctx.fillStyle = '#020106';
      ctx.fillRect(0, 0, width, height);

      zoomScale = THREE.MathUtils.damp(zoomScale, targetZoomScale, 6.5, dt);
      const baseCamZ = width < height ? 38 : 31;

      // Cinematic Camera Zoom Choreography across stages:
      let stageCameraFactor = 1.0;
      if (curStage === 'bouquet') {
        const zProgress = Math.min(1, bouquetStageElapsed / 1.35);
        stageCameraFactor = 1.18 - 0.24 * (1 - Math.pow(1 - zProgress, 3));
      } else if (curStage === 'dissolve') {
        const dProgress = Math.min(1, dissolveStageElapsed / 1.15);
        stageCameraFactor = 1.0 - 0.36 * Math.sin(dProgress * Math.PI);
      } else if (curStage === 'sphere') {
        // Starts zoomed in (0.54 * baseCamZ) and pulls back smoothly to 1.0 * baseCamZ to showcase the full 3D Crystal Sphere
        const sProgress = Math.min(1, sphereStageElapsed / 1.3);
        const sEase = 1 - Math.pow(1 - sProgress, 3);
        stageCameraFactor = 0.54 + 0.46 * sEase;
      } else if (curStage === 'galaxy') {
        // Phase 1 (0..0.38s): Zoom IN into the sphere (camZ drops to 0.54)
        // Phase 2 (0.38..1.75s): Zoom OUT (phóng bung ra) to 1.0 as the galaxy expands!
        if (galaxyStageElapsed < 0.38) {
          const p1 = galaxyStageElapsed / 0.38;
          const ease1 = 1 - Math.pow(1 - p1, 2);
          stageCameraFactor = 1.0 - 0.46 * ease1;
        } else if (galaxyStageElapsed < 1.75) {
          const p2 = (galaxyStageElapsed - 0.38) / 1.37;
          const ease2 = 1 - Math.pow(1 - p2, 3);
          stageCameraFactor = 0.54 + 0.46 * ease2;
        }
      }

      const camZ = (baseCamZ * stageCameraFactor) / zoomScale;
      const fov = Math.min(width, height) * 0.92;

      // Update 3D rotation for Sphere and Galaxy stages
      if (curStage === 'sphere' || curStage === 'galaxy') {
        if (!isDragging) {
          const burstSpinBoost =
            curStage === 'galaxy' && galaxyStageElapsed < 0.65
              ? (1 - galaxyStageElapsed / 0.65) * 2.2
              : 0;
          targetRotY += dt * (0.32 + burstSpinBoost) + velRotY;
          targetRotX = THREE.MathUtils.clamp(
            targetRotX + velRotX,
            -1.45,
            1.45
          );
          const decay = Math.pow(0.92, dt * 60);
          velRotY *= decay;
          velRotX *= decay;
        }
        rotY = THREE.MathUtils.damp(rotY, targetRotY, 7.5, dt);
        rotX = THREE.MathUtils.damp(rotX, targetRotX, 7.5, dt);
      }

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // A. Render deep-space twinkling stars
      const bgRot = elapsed * 0.02;
      const bgCos = Math.cos(bgRot);
      const bgSin = Math.sin(bgRot);

      for (let i = 0; i < BG_STAR_COUNT; i++) {
        const rx = bgX[i] * bgCos - bgZ[i] * bgSin;
        const rz = bgX[i] * bgSin + bgZ[i] * bgCos;
        const depth = camZ - rz;
        if (depth <= 1) continue;
        const sc = fov / depth;
        const sx = width * 0.5 + rx * sc;
        const sy = height * 0.5 - bgY[i] * sc;
        if (sx < 0 || sx > width || sy < 0 || sy > height) continue;

        const twinkle = 0.45 + 0.55 * Math.sin(elapsed * 2.4 + bgPhase[i]);
        ctx.globalAlpha = twinkle * 0.72;
        ctx.fillStyle = bgCol[i];
        const s = Math.max(1.0, Math.min(2.1, sc * 0.08));
        ctx.fillRect(sx - s * 0.5, sy - s * 0.5, s, s);
      }
      ctx.globalAlpha = 1;

      // B. Update & Render 6,400 3D Morphing Particles
      const isFastMorph =
        curStage === 'text' ||
        curStage === 'bouquet' ||
        curStage === 'vortex' ||
        curStage === 'sphere';
      const lerpSpeed = isFastMorph ? 6.5 : 3.8;
      const factor = 1 - Math.exp(-lerpSpeed * dt);

      if (scatterBurstTime > 0) {
        scatterBurstTime = Math.max(0, scatterBurstTime - dt);
      }

      const particleRotZ =
        curStage === 'idle'
          ? elapsed * 0.07
          : curStage === 'vortex'
            ? elapsed * 1.15
            : 0;
      const pCosZ = Math.cos(particleRotZ);
      const pSinZ = Math.sin(particleRotZ);

      const particleAlpha =
        curStage === 'bouquet' && showRealBouquetRef.current
          ? 0.38
          : curStage === 'sphere'
            ? 0.78
            : curStage === 'galaxy'
              ? 0.38
              : 0.96;

      ctx.globalAlpha = particleAlpha;

      const heartCoreLimit = Math.floor(PARTICLE_COUNT * 0.18);
      const heartPulse = 1 + 0.09 * Math.sin(elapsed * 3.8);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (scatterBurstTime > 0) {
          curX[i] +=
            Math.sin(curY[i] * 1.4 + i) * 1.35 +
            (Math.random() - 0.5) * 1.7;
          curY[i] += (Math.random() - 0.5) * 1.15;
        }

        curX[i] += (tarX[i] - curX[i]) * factor;
        curY[i] += (tarY[i] - curY[i]) * factor;
        curZ[i] += (tarZ[i] - curZ[i]) * factor;
        pSize[i] += (tarSize[i] - pSize[i]) * factor;

        let px = curX[i];
        let py = curY[i];
        let pz = curZ[i];

        // Pulse the inner 3D Heart Core inside the Sphere to the lofi beat!
        if (curStage === 'sphere' && i < heartCoreLimit) {
          px *= heartPulse;
          py *= heartPulse;
          pz *= heartPulse;
        }

        if (particleRotZ !== 0) {
          const tx = px * pCosZ - py * pSinZ;
          py = px * pSinZ + py * pCosZ;
          px = tx;
        } else if (curStage === 'sphere' || curStage === 'galaxy') {
          // Rotate particles in 3D along with the user's swipe/drag rotation
          const rx1 = px * cosY + pz * sinY;
          const rz1 = -px * sinY + pz * cosY;
          py = py * cosX - rz1 * sinX;
          pz = py * sinX + rz1 * cosX;
          px = rx1;
        }

        const depth = camZ - pz;
        if (depth <= 1) continue;
        const sc = fov / depth;
        const sx = width * 0.5 + px * sc;
        const sy = height * 0.5 - py * sc;
        if (sx < 0 || sx > width || sy < 0 || sy > height) continue;

        ctx.fillStyle = pCol[i];
        const rad = Math.max(
          1.15,
          Math.min(3.2, pSize[i] * (sc / 26))
        );
        ctx.fillRect(sx - rad * 0.5, sy - rad * 0.5, rad, rad);
      }
      ctx.globalAlpha = 1;

      // C. Render Stage 'sphere' (Luxury 3D Crystal Globe of Photos & Videos)
      //    AND Stage 'galaxy' (Zoom-in + Explode-out into 3D Top-to-Bottom Drifting Stream!)
      if (curStage === 'sphere' || curStage === 'galaxy') {
        let morphToGalaxy = 0;
        let explosionShockwave = 0;
        if (curStage === 'galaxy') {
          if (galaxyStageElapsed < 0.28) {
            morphToGalaxy = 0;
            explosionShockwave = -0.12 * (galaxyStageElapsed / 0.28);
          } else {
            const rawT = Math.min(1, (galaxyStageElapsed - 0.28) / 1.35);
            morphToGalaxy = 1 - Math.pow(1 - rawT, 3);
            explosionShockwave = Math.sin(rawT * Math.PI) * 0.55;
          }
        }

        const sphereEntryProgress =
          curStage === 'sphere'
            ? Math.min(1, sphereStageElapsed / 1.15)
            : 1;
        const sphereEntryEase = 1 - Math.pow(1 - sphereEntryProgress, 3);

        // Draw 3D Translucent Crystal Globe Core, Rotating 3D Geodesic Wireframe Rings & Orbital Halos
        const sphereGlowOpacity =
          Math.max(0, 1 - morphToGalaxy * 1.35) * sphereEntryEase;
        if (sphereGlowOpacity > 0.02 && camZ > SPHERE_RADIUS * 0.55) {
          const activeR =
            SPHERE_RADIUS *
            (2.05 - 1.05 * sphereEntryEase) *
            (1 + explosionShockwave * 0.5);
          const screenSphereR = (activeR * fov) / camZ;
          const cx = width * 0.5;
          const cy = height * 0.5;

          ctx.save();
          ctx.globalAlpha = sphereGlowOpacity;

          // 1. Volumetric 3D Crystal Sphere Aura & Specular Highlight
          const coreGrad = ctx.createRadialGradient(
            cx - screenSphereR * 0.28,
            cy - screenSphereR * 0.28,
            screenSphereR * 0.05,
            cx,
            cy,
            screenSphereR * 1.25
          );
          coreGrad.addColorStop(0, 'rgba(255, 214, 235, 0.34)');
          coreGrad.addColorStop(0.38, 'rgba(255, 64, 150, 0.22)');
          coreGrad.addColorStop(0.78, 'rgba(236, 72, 153, 0.36)');
          coreGrad.addColorStop(0.95, 'rgba(255, 133, 192, 0.18)');
          coreGrad.addColorStop(1, 'rgba(255, 42, 133, 0)');

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, screenSphereR * 1.25, 0, Math.PI * 2);
          ctx.fill();

          // 2. True 3D Rotating Latitude Parallels on the Crystal Sphere
          const latitudes = [-0.65, -0.32, 0, 0.32, 0.65];
          latitudes.forEach((latSin, idx) => {
            const latR = activeR * Math.sqrt(1 - latSin * latSin);
            const latY = activeR * latSin;
            drawProjected3DRing(
              latR,
              0,
              0,
              latY,
              48,
              idx === 2
                ? 'rgba(255, 195, 230, 0.42)'
                : 'rgba(255, 133, 192, 0.22)',
              idx === 2 ? 1.6 : 1.0,
              cosY,
              sinY,
              cosX,
              sinX,
              camZ,
              fov
            );
          });

          // 3. True 3D Rotating Longitude Meridians
          drawProjected3DRing(
            activeR,
            Math.PI * 0.5,
            0,
            0,
            52,
            'rgba(255, 165, 215, 0.24)',
            1.1,
            cosY,
            sinY,
            cosX,
            sinX,
            camZ,
            fov
          );
          drawProjected3DRing(
            activeR,
            Math.PI * 0.5,
            Math.PI * 0.5,
            0,
            52,
            'rgba(255, 165, 215, 0.24)',
            1.1,
            cosY,
            sinY,
            cosX,
            sinX,
            camZ,
            fov
          );

          // 4. Dual Intersecting Tilted 3D Cosmic Halo Rings orbiting the Sphere
          drawProjected3DRing(
            activeR * 1.26,
            0.38,
            -0.16,
            0,
            64,
            'rgba(255, 214, 235, 0.52)',
            1.8,
            cosY,
            sinY,
            cosX,
            sinX,
            camZ,
            fov
          );
          drawProjected3DRing(
            activeR * 1.42,
            -0.34,
            0.22,
            0,
            64,
            'rgba(255, 92, 168, 0.38)',
            1.35,
            cosY,
            sinY,
            cosX,
            sinX,
            camZ,
            fov
          );

          // 5. Outer Atmospheric Crystal Rim
          ctx.strokeStyle = 'rgba(255, 190, 228, 0.52)';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(cx, cy, screenSphereR * 1.01, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        const mems = memoriesRef.current;
        const wishes =
          wishesRef.current && wishesRef.current.length > 0
            ? wishesRef.current
            : [
                'Chúc em luôn yêu đời',
                'Chúc mừng ngày phụ nữ Việt Nam',
                'yêu em',
                'mãi yêu em',
                '20/10',
                'Mong mọi điều dịu dàng sẽ đến với em',
                'luôn vui vẻ và hạnh phúc',
                'Chúc em luôn xinh đẹp',
                'cầu mọi may mắn',
              ];

        hitTestableCards.length = 0;

        type StreamRenderItem =
          | {
              kind: 'card';
              rz: number;
              sx: number;
              sy: number;
              w: number;
              h: number;
              alpha: number;
              frontHighlight: number;
              mem: MemoryItem;
              entry: CachedMediaEntry;
            }
          | {
              kind: 'wish';
              rz: number;
              sx: number;
              sy: number;
              scale: number;
              alpha: number;
              sprite: HTMLCanvasElement;
            }
          | {
              kind: 'heart';
              rz: number;
              sx: number;
              sy: number;
              size: number;
              alpha: number;
            };

        const renderQueue: StreamRenderItem[] = [];
        const totalCards = Math.max(46, Math.min(mems.length, 64));
        const HALF_SPAN_Y = 30;
        const goldenAngle = 2.3999632;

        for (let i = 0; i < totalCards; i++) {
          const mem = mems[i % mems.length];
          const entry = getMediaEntry(mem, i);

          // 1. 3D Sphere Position (Fibonacci Crystal Globe Surface - Hiệu ứng Quả Cầu 3D)
          const fibT = (i + 0.5) / totalCards;
          const phi = Math.acos(1 - 2 * fibT);
          const theta = i * goldenAngle;
          const ux = Math.sin(phi) * Math.cos(theta);
          const uy = Math.cos(phi);
          const uz = Math.sin(phi) * Math.sin(theta);

          // Gentle radial breathing shimmer on the sphere surface
          const shimmerWave =
            1 + 0.022 * Math.sin(elapsed * 2.6 + i * 0.7);
          const activeSphereR =
            SPHERE_RADIUS *
            shimmerWave *
            (2.05 - 1.05 * sphereEntryEase) *
            (1 + explosionShockwave);
          const sphereWx = ux * activeSphereR;
          const sphereWy = uy * activeSphereR;
          const sphereWz = uz * activeSphereR;

          // 2. 3D Galaxy Position (Top-to-Bottom Continuous Drifting Stream + Radial Burst)
          const laneAngle = i * goldenAngle;
          const radiusXZ = 3.8 + (i % 7) * 2.85;
          const galaxyWx =
            Math.cos(laneAngle) * radiusXZ * (width < height ? 0.88 : 1.35) +
            Math.sin(elapsed * 0.45 + i) * 0.4 +
            ux * explosionShockwave * 12;
          const galaxyWz =
            Math.sin(laneAngle) * (radiusXZ * 0.85) -
            2 +
            uz * explosionShockwave * 12;

          const fallSpeed = 2.35 + (i % 5) * 0.42;
          const initialY = ((i / totalCards) * 2 - 1) * HALF_SPAN_Y;
          const galaxyWy =
            wrapRange(
              initialY - elapsed * fallSpeed + manualFlowOffsetY,
              HALF_SPAN_Y
            ) +
            uy * explosionShockwave * 8;

          // Smoothly blend between 3D Sphere and 3D Drifting Galaxy
          const wx = THREE.MathUtils.lerp(sphereWx, galaxyWx, morphToGalaxy);
          const wy = THREE.MathUtils.lerp(sphereWy, galaxyWy, morphToGalaxy);
          const wz = THREE.MathUtils.lerp(sphereWz, galaxyWz, morphToGalaxy);

          // Rotate 3D coordinates by user's swipe/drag rotation (rotY, rotX)
          const rx1 = wx * cosY + wz * sinY;
          const rz1 = -wx * sinY + wz * cosY;
          const ry = wy * cosX - rz1 * sinX;
          const rz = wy * sinX + rz1 * cosX;

          const depth = camZ - rz;
          if (depth <= 2.2) continue;

          const sc = fov / depth;
          const sx = width * 0.5 + rx1 * sc;
          const sy = height * 0.5 - ry * sc;

          // Keep TRUE ORIGINAL ASPECT RATIO (width / height) of each photo or video!
          const sphereBaseSize = 3.55 * sc * sphereEntryEase;
          const galaxyBaseSize = (4.8 + (i % 3) * 0.65) * sc;
          const baseScale = THREE.MathUtils.lerp(
            sphereBaseSize,
            galaxyBaseSize,
            morphToGalaxy
          );

          const aspect = entry.aspect || 0.78;
          let cardW = aspect >= 1 ? baseScale : baseScale * aspect;
          let cardH = aspect >= 1 ? baseScale / aspect : baseScale;

          // Natural 3D spherical foreshortening + front-facing magnification on the globe
          let frontHighlight = 0;
          if (morphToGalaxy < 0.95) {
            const normalZ = THREE.MathUtils.clamp(
              rz / Math.max(activeSphereR, 1),
              -1,
              1
            );
            frontHighlight =
              normalZ > 0.55
                ? ((normalZ - 0.55) / 0.45) * (1 - morphToGalaxy)
                : 0;
            const curveScale = THREE.MathUtils.lerp(
              0.68 + 0.38 * Math.max(0, normalZ) + 0.12 * Math.abs(normalZ),
              1.0,
              morphToGalaxy
            );
            cardW *= curveScale;
            cardH *= curveScale;
          }

          if (
            sx + cardW < -20 ||
            sx - cardW > width + 20 ||
            sy + cardH < -20 ||
            sy - cardH > height + 20
          ) {
            continue;
          }

          // Compute alpha for Sphere (front hemisphere crystal-clear, back hemisphere translucent glass) vs Galaxy
          const sphereHemisphereAlpha =
            rz >= 0
              ? THREE.MathUtils.lerp(0.75, 1.0, rz / Math.max(activeSphereR, 1))
              : THREE.MathUtils.lerp(
                  0.16,
                  0.42,
                  (rz + activeSphereR) / Math.max(activeSphereR, 1)
                );

          const edgeFade = THREE.MathUtils.clamp(
            (HALF_SPAN_Y - Math.abs(galaxyWy)) / 4.5,
            0,
            1
          );
          const galaxyAlpha =
            THREE.MathUtils.clamp(1.28 - depth / 66, 0.35, 0.98) * edgeFade;

          const finalAlpha =
            THREE.MathUtils.lerp(
              sphereHemisphereAlpha,
              galaxyAlpha,
              morphToGalaxy
            ) * sphereEntryEase;

          renderQueue.push({
            kind: 'card',
            rz,
            sx,
            sy,
            w: cardW,
            h: cardH,
            alpha: finalAlpha,
            frontHighlight,
            mem,
            entry,
          });
        }

        // Render 28 Drifting 3D Neon Pink Wishes + 28 Glossy Hearts as the Sphere explodes into the Galaxy
        if (morphToGalaxy > 0.04) {
          for (let w = 0; w < 28; w++) {
            const wAngle = w * 1.95 + 0.5;
            const wRad = (4.5 + (w % 6) * 3.1) * morphToGalaxy;
            const wx =
              Math.cos(wAngle) * wRad * (width < height ? 0.85 : 1.3);
            const wz = Math.sin(wAngle) * wRad - 1;

            const fallSpeed = 2.0 + (w % 4) * 0.38;
            const initialY = ((w / 28) * 2 - 1) * HALF_SPAN_Y;
            const wy =
              wrapRange(
                initialY - elapsed * fallSpeed + manualFlowOffsetY,
                HALF_SPAN_Y
              ) * morphToGalaxy;

            const rx1 = wx * cosY + wz * sinY;
            const rz1 = -wx * sinY + wz * cosY;
            const ry = wy * cosX - rz1 * sinX;
            const rz = wy * sinX + rz1 * cosX;

            const depth = camZ - rz;
            if (depth <= 2.5) continue;
            const sc = fov / depth;
            const sx = width * 0.5 + rx1 * sc;
            const sy = height * 0.5 - ry * sc;

            const edgeFade = THREE.MathUtils.clamp(
              (HALF_SPAN_Y - Math.abs(wy)) / 4.5,
              0,
              1
            );
            const sprite = getNeonWishSprite(wishes[w % wishes.length]);

            renderQueue.push({
              kind: 'wish',
              rz,
              sx,
              sy,
              scale: (sc / 28) * morphToGalaxy,
              alpha:
                THREE.MathUtils.clamp(1.22 - depth / 60, 0.3, 0.96) *
                edgeFade *
                morphToGalaxy,
              sprite,
            });
          }

          for (let h = 0; h < 28; h++) {
            const hAngle = h * 2.25;
            const hRad = (4.0 + (h % 6) * 3.0) * morphToGalaxy;
            const wx =
              Math.cos(hAngle) * hRad * (width < height ? 0.9 : 1.3);
            const wz = Math.sin(hAngle) * hRad;

            const fallSpeed = 2.6 + (h % 4) * 0.45;
            const initialY = ((h / 28) * 2 - 1) * HALF_SPAN_Y;
            const wy =
              wrapRange(
                initialY - elapsed * fallSpeed + manualFlowOffsetY,
                HALF_SPAN_Y
              ) * morphToGalaxy;

            const rx1 = wx * cosY + wz * sinY;
            const rz1 = -wx * sinY + wz * cosY;
            const ry = wy * cosX - rz1 * sinX;
            const rz = wy * sinX + rz1 * cosX;

            const depth = camZ - rz;
            if (depth <= 2.5) continue;
            const sc = fov / depth;
            const sx = width * 0.5 + rx1 * sc;
            const sy = height * 0.5 - ry * sc;

            const edgeFade = THREE.MathUtils.clamp(
              (HALF_SPAN_Y - Math.abs(wy)) / 4.5,
              0,
              1
            );

            renderQueue.push({
              kind: 'heart',
              rz,
              sx,
              sy,
              size: (1.55 + (h % 3) * 0.45) * sc * morphToGalaxy,
              alpha:
                THREE.MathUtils.clamp(1.22 - depth / 60, 0.35, 0.95) *
                edgeFade *
                morphToGalaxy,
            });
          }
        }

        // Back-to-front painter's sort
        renderQueue.sort((a, b) => a.rz - b.rz);

        for (let i = 0; i < renderQueue.length; i++) {
          const item = renderQueue[i];
          if (item.alpha <= 0.03) continue;

          if (item.kind === 'card') {
            const { entry, sx, sy, w, h, alpha, frontHighlight, mem } = item;
            const hw = w * 0.5;
            const hh = h * 0.5;

            ctx.globalAlpha = alpha;

            if (
              entry.videoEl &&
              entry.videoEl.readyState >= 2 &&
              entry.videoEl.videoWidth > 0
            ) {
              ctx.drawImage(entry.videoEl, sx - hw, sy - hh, w, h);
              ctx.strokeStyle = 'rgba(255, 133, 192, 0.92)';
              ctx.lineWidth = 2.2;
              ctx.strokeRect(sx - hw, sy - hh, w, h);
              ctx.strokeStyle = 'rgba(255, 245, 250, 0.88)';
              ctx.lineWidth = 1.1;
              ctx.strokeRect(sx - hw + 1.5, sy - hh + 1.5, w - 3, h - 3);
            } else if (entry.spriteCanvas) {
              ctx.drawImage(entry.spriteCanvas, sx - hw, sy - hh, w, h);
            } else {
              ctx.fillStyle = 'rgba(255, 92, 168, 0.35)';
              ctx.fillRect(sx - hw, sy - hh, w, h);
            }

            // Extra crystal rim shimmer for cards passing through the front-center of the 3D Sphere
            if (frontHighlight > 0.15) {
              ctx.globalAlpha = alpha * frontHighlight * 0.65;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.6;
              ctx.strokeRect(sx - hw + 2, sy - hh + 2, w - 4, h - 4);
            }

            if (item.rz >= -2 || morphToGalaxy > 0.5) {
              hitTestableCards.push({
                x: sx,
                y: sy,
                w,
                h,
                memory: mem,
              });
            }
          } else if (item.kind === 'heart') {
            const hs = item.size;
            ctx.globalAlpha = item.alpha;
            ctx.drawImage(
              heartSprite,
              item.sx - hs * 0.5,
              item.sy - hs * 0.5,
              hs,
              hs
            );
          } else if (item.kind === 'wish') {
            const sw = item.sprite.width * item.scale;
            const sh = item.sprite.height * item.scale;
            if (sw >= 18) {
              ctx.globalAlpha = item.alpha;
              ctx.drawImage(
                item.sprite,
                item.sx - sw * 0.5,
                item.sy - sh * 0.5,
                sw,
                sh
              );
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);

      mediaCache.forEach((entry) => {
        if (entry.videoEl) {
          entry.videoEl.pause();
          entry.videoEl.removeAttribute('src');
          entry.videoEl.load();
        }
      });
      mediaCache.clear();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 w-full h-full overflow-hidden"
    />
  );
};
