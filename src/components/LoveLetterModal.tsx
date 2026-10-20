import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Film, Heart, X } from 'lucide-react';
import { LoveLetterData, MemoryItem } from '../types/gift';
import { createSunlitPortraitDataUrl } from '../utils/defaultMemories';

interface LoveLetterModalProps {
  isOpen: boolean;
  initialMode: 'envelope' | 'letter' | 'memory';
  selectedMemory: MemoryItem | null;
  memories: MemoryItem[];
  loveLetter: LoveLetterData;
  onClose: () => void;
  onSelectMemory: (memory: MemoryItem) => void;
}

const PinkButterflySvg: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`inline-flex items-center justify-center ${className || ''}`}
    style={{ perspective: '400px' }}
  >
    <svg
      viewBox="0 0 100 84"
      className="w-11 h-9 sm:w-13 sm:h-11 overflow-visible drop-shadow-[0_4px_12px_rgba(255,42,133,0.65)]"
    >
      <defs>
        <linearGradient id="bfWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff0f6" />
          <stop offset="45%" stopColor="#ff85c0" />
          <stop offset="100%" stopColor="#eb2f96" />
        </linearGradient>
      </defs>
      <g className="animate-wing-left">
        <path
          d="M 48,42 C 30,10 4,6 6,28 C 7,42 26,48 48,45 Z"
          fill="url(#bfWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path
          d="M 48,45 C 28,48 12,62 20,74 C 28,82 44,68 48,48 Z"
          fill="url(#bfWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </g>
      <g className="animate-wing-right">
        <path
          d="M 52,42 C 70,10 96,6 94,28 C 93,42 74,48 52,45 Z"
          fill="url(#bfWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path
          d="M 52,45 C 72,48 88,62 80,74 C 72,82 56,68 52,48 Z"
          fill="url(#bfWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </g>
      <ellipse cx="50" cy="45" rx="2.5" ry="12" fill="#780650" />
      <path
        d="M 49,34 Q 42,22 36,20 M 51,34 Q 58,22 64,20"
        fill="none"
        stroke="#780650"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const CornerRoseSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 90 90"
    className={`w-11 h-11 sm:w-13 sm:h-13 drop-shadow-[0_4px_12px_rgba(225,29,72,0.55)] animate-rose-sway ${
      className || ''
    }`}
  >
    <defs>
      <radialGradient id="roseCore" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#9f1239" />
        <stop offset="55%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#fda4af" />
      </radialGradient>
    </defs>
    <path
      d="M 22,55 Q 6,42 14,26 Q 30,32 32,48 Z"
      fill="#40916c"
      stroke="#2d6a4f"
      strokeWidth="1"
    />
    <path
      d="M 62,64 Q 80,58 78,40 Q 62,40 56,56 Z"
      fill="#52b788"
      stroke="#2d6a4f"
      strokeWidth="1"
    />
    <path
      d="M 44,55 Q 38,72 26,84"
      fill="none"
      stroke="#2d6a4f"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <circle cx="36" cy="36" r="16" fill="#fda4af" />
    <circle cx="54" cy="36" r="16" fill="#fb7185" />
    <circle cx="45" cy="50" r="16" fill="#f43f5e" />
    <circle cx="45" cy="28" r="15" fill="#fecdd3" />
    <circle cx="45" cy="39" r="15" fill="url(#roseCore)" />
    <path
      d="M 37,38 C 40,30 50,30 53,38 C 50,45 40,45 37,38 Z"
      fill="#ffe4e6"
      opacity="0.55"
    />
  </svg>
);

const FloralCornerClusterSvg: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 140 110" className={className}>
    <ellipse
      cx="32"
      cy="75"
      rx="24"
      ry="10"
      transform="rotate(-35 32 75)"
      fill="#74c69d"
      opacity="0.85"
    />
    <ellipse
      cx="85"
      cy="88"
      rx="26"
      ry="10"
      transform="rotate(-15 85 88)"
      fill="#52b788"
      opacity="0.85"
    />
    <ellipse
      cx="22"
      cy="45"
      rx="20"
      ry="8"
      transform="rotate(-65 22 45)"
      fill="#95d5b2"
      opacity="0.85"
    />
    <circle cx="42" cy="82" r="24" fill="#f43f5e" />
    <circle cx="42" cy="82" r="17" fill="#fb7185" />
    <circle cx="42" cy="82" r="10" fill="#ffe4e6" />

    <circle cx="82" cy="92" r="19" fill="#ec4899" />
    <circle cx="82" cy="92" r="12" fill="#f9a8d4" />
    <circle cx="82" cy="92" r="6" fill="#fff1f2" />

    <circle cx="18" cy="58" r="16" fill="#fb7185" />
    <circle cx="18" cy="58" r="10" fill="#fecdd3" />
    <circle cx="62" cy="66" r="8" fill="#ffffff" />
    <circle cx="62" cy="66" r="3.5" fill="#facc15" />
  </svg>
);

const FloatingLetterPetals: React.FC = () => {
  const petals = [
    { left: '12%', delay: '0s', size: 12 },
    { left: '34%', delay: '1.4s', size: 10 },
    { left: '58%', delay: '2.6s', size: 14 },
    { left: '78%', delay: '0.8s', size: 11 },
    { left: '88%', delay: '3.4s', size: 9 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
      {petals.map((p, idx) => (
        <span
          key={idx}
          style={{
            left: p.left,
            animationDelay: p.delay,
            width: `${p.size}px`,
            height: `${p.size * 0.7}px`,
          }}
          className="absolute top-0 rounded-full bg-gradient-to-br from-[#ff85c0] to-[#ff2a85]/70 animate-petal-fall"
        />
      ))}
    </div>
  );
};

export const LoveLetterModal: React.FC<LoveLetterModalProps> = ({
  isOpen,
  initialMode,
  selectedMemory,
  memories,
  loveLetter,
  onClose,
  onSelectMemory,
}) => {
  const [mode, setMode] = useState<'envelope' | 'letter' | 'memory'>(
    initialMode
  );
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [typedLength, setTypedLength] = useState(0);

  const fullText = `${loveLetter.body}\n${loveLetter.signature}`;

  useEffect(() => {
    if (!isOpen) {
      setIsFlapOpen(false);
      setTypedLength(0);
      return;
    }
    setMode(initialMode);
    if (initialMode === 'letter') {
      setTypedLength(0);
    }
  }, [isOpen, initialMode, selectedMemory]);

  useEffect(() => {
    if (!isOpen || mode !== 'letter') return;
    if (typedLength >= fullText.length) return;

    const timer = window.setTimeout(() => {
      setTypedLength((prev) => prev + 1);
    }, 28);
    return () => window.clearTimeout(timer);
  }, [isOpen, mode, typedLength, fullText.length]);

  if (!isOpen) return null;

  const handleOpenEnvelope = () => {
    if (isFlapOpen) return;
    setIsFlapOpen(true);
    window.setTimeout(() => {
      setTypedLength(0);
      setMode('letter');
    }, 680);
  };

  const currentMemory =
    selectedMemory || (memories.length > 0 ? memories[0] : null);
  const currentIndex = currentMemory
    ? Math.max(
        0,
        memories.findIndex((m) => m.id === currentMemory.id)
      )
    : 0;
  const fallbackPortrait = createSunlitPortraitDataUrl(0);

  const firstPhotoMemory = memories.find(
    (m) => m.mediaType !== 'video' && m.imageUrl
  );
  const cornerPhotoUrl =
    firstPhotoMemory?.imageUrl ||
    loveLetter.footerPhotoUrl ||
    fallbackPortrait;

  const isTypingDone = typedLength >= fullText.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[3px] transition-opacity"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="fixed top-5 right-5 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white/85 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      {/* MODE 1: BOTANICAL WATERCOLOR 20/10 ENVELOPE (Matches 0:27 - 0:29 of Video) */}
      {mode === 'envelope' && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEnvelope();
          }}
          className="relative flex flex-col items-center cursor-pointer select-none animate-fadeIn"
        >
          <div
            className="relative w-[330px] sm:w-[390px] h-[230px] sm:h-[260px] animate-float-slow"
            style={{ perspective: '900px' }}
          >
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#fff5f8] via-[#ffe4ee] to-[#ffd1e3] shadow-[0_0_55px_rgba(255,80,160,0.6)] border-2 border-[#ffb3d1] overflow-hidden">
              <FloralCornerClusterSvg className="absolute -bottom-3 -left-3 w-36 h-28 pointer-events-none" />
              <FloralCornerClusterSvg className="absolute -bottom-3 -right-3 w-36 h-28 scale-x-[-1] pointer-events-none" />

              <svg
                viewBox="0 0 390 260"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <path
                  d="M 0,260 L 155,125 L 235,125 L 390,260"
                  fill="rgba(255, 230, 240, 0.55)"
                  stroke="#f48fb1"
                  strokeWidth="1.5"
                />
                <path
                  d="M 0,0 L 195,152 L 390,0"
                  fill="none"
                  stroke="#f06292"
                  strokeWidth="2"
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2 text-center px-4">
                <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#ad1457]/85">
                  {loveLetter.title || 'DÀNH TẶNG EM'}
                </p>
                <p className="font-script text-3xl sm:text-4xl font-bold text-[#c2185b] mt-0.5">
                  {loveLetter.date || '20 / 10'}
                </p>

                <div
                  className={`mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#fb7185] via-[#e11d48] to-[#9f1239] border-2 border-[#fecdd3] shadow-[0_6px_18px_rgba(225,29,72,0.55)] transition-all duration-500 ${
                    isFlapOpen
                      ? 'scale-125 opacity-0 -translate-y-6'
                      : 'hover:scale-105'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#fda4af]/60">
                    <Heart className="h-5 w-5 fill-[#fff1f2] text-[#fff1f2] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute top-0 inset-x-0 h-[145px] origin-top pointer-events-none transition-transform duration-700"
              style={{
                transform: isFlapOpen ? 'rotateX(175deg)' : 'rotateX(0deg)',
              }}
            >
              <svg viewBox="0 0 390 150" className="w-full h-full">
                <polygon
                  points="0,0 195,145 390,0"
                  fill="#ffe0ec"
                  stroke="#f48fb1"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-[#ffd6e7]/90 tracking-wide animate-pulse">
            Chạm phong bì để mở thư ✨
          </p>
        </div>
      )}

      {/* MODE 2: CLEAN SINGLE-PAGE VERTICAL FLORAL LETTER CARD (Matches 0:30 - 0:31 of Video) */}
      {mode === 'letter' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-3xl border-2 border-[#ffb3d1] bg-gradient-to-b from-[#fff7fa] via-[#ffe6f0] to-[#ffd4e5] px-6 py-6 sm:px-7 sm:py-7 text-[#4a0e2e] shadow-[0_0_60px_rgba(255,80,160,0.65)] animate-letter-unfold"
        >
          <FloatingLetterPetals />

          <PinkButterflySvg className="absolute -top-5 -left-4 z-20 pointer-events-none" />
          <CornerRoseSvg className="absolute -top-5 -right-4 z-20 pointer-events-none" />

          <FloralCornerClusterSvg className="absolute -bottom-3 -left-3 w-36 h-28 pointer-events-none opacity-95" />
          <FloralCornerClusterSvg className="absolute -bottom-3 -right-3 w-36 h-28 scale-x-[-1] pointer-events-none opacity-95" />

          <div className="relative z-10 space-y-3.5">
            <h2 className="font-script text-2xl sm:text-3xl font-bold text-[#9d174d]">
              {loveLetter.recipient} ❤
            </h2>

            <div
              onClick={() => setTypedLength(fullText.length)}
              className="font-script text-[19px] sm:text-[21px] leading-relaxed text-[#590d22] whitespace-pre-line min-h-[150px] cursor-pointer"
              title="Chạm để hiện toàn bộ chữ"
            >
              {fullText.slice(0, typedLength)}
              {!isTypingDone && (
                <span className="inline-block w-0.5 h-5 bg-[#c2185b] ml-0.5 animate-pulse align-middle" />
              )}
            </div>

            <div className="pt-1 flex items-end justify-end">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white shadow-[0_6px_20px_rgba(225,29,72,0.35)] bg-[#ffe5ec]">
                <img
                  src={cornerPhotoUrl}
                  alt={loveLetter.recipient}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (fallbackPortrait) {
                      (e.currentTarget as HTMLImageElement).src =
                        fallbackPortrait;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: PHOTO & VIDEO LIGHTBOX IN TRUE ORIGINAL ASPECT RATIO */}
      {mode === 'memory' && currentMemory && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl border-2 border-[#ff85c0] bg-[#160621]/95 p-4 text-white shadow-[0_0_50px_rgba(255,42,133,0.6)] animate-fadeIn"
        >
          <div className="relative flex items-center justify-center max-h-[62vh] w-full overflow-hidden rounded-2xl border border-[#ffb3d9]/50 bg-black/90">
            {currentMemory.mediaType === 'video' && currentMemory.videoUrl ? (
              <video
                src={currentMemory.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[62vh] w-auto max-w-full object-contain"
              />
            ) : (
              <img
                src={currentMemory.imageUrl}
                alt={currentMemory.caption}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (fallbackPortrait) {
                    (e.currentTarget as HTMLImageElement).src = fallbackPortrait;
                  }
                }}
                className="max-h-[62vh] w-auto max-w-full object-contain"
              />
            )}

            {currentMemory.mediaType === 'video' && (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 border border-[#ff85c0]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#ffb3d9]">
                <Film className="h-3 w-3" /> Video
              </span>
            )}
          </div>

          <div className="mt-3.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const prevIdx =
                  (currentIndex - 1 + memories.length) % memories.length;
                onSelectMemory(memories[prevIdx]);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#ff2a85] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFlapOpen(false);
                setTypedLength(0);
                setMode('envelope');
              }}
              className="rounded-full bg-[#ff2a85]/25 border border-[#ff85c0]/50 px-4 py-1.5 text-xs font-semibold text-[#ffd6eb] hover:bg-[#ff2a85] hover:text-white transition-colors cursor-pointer"
            >
              💌 Mở thư 20/10 ({currentIndex + 1}/{memories.length})
            </button>

            <button
              type="button"
              onClick={() => {
                const nextIdx = (currentIndex + 1) % memories.length;
                onSelectMemory(memories[nextIdx]);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#ff2a85] transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
