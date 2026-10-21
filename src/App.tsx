/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Fingerprint,
  FolderUp,
  Heart,
  Mail,
  QrCode,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { CosmicScene3D, ExperienceStage } from './components/CosmicScene3D';
import { LoveLetterModal } from './components/LoveLetterModal';
import { MemoryStudioModal } from './components/MemoryStudioModal';
import { QrShareModal } from './components/QrShareModal';
import { GiftConfig, MemoryItem } from './types/gift';
import {
  createRoseBouquetDataUrl,
  createRoseBouquetForegroundOverlayDataUrl,
  createSunlitPortraitDataUrl,
  getDefaultGiftConfig,
  processBulkUploadedFiles,
  sanitizeLegacyGiftConfig,
} from './utils/defaultMemories';
import { decodeGiftFromUrlParam } from './utils/giftSharing';
import { romanticAudio } from './utils/romanticAudio';

const STORAGE_KEY = 'cosmic_love_dlove_v10';

const BouquetButterfly3D: React.FC = () => (
  <div
    className="absolute top-6 left-6 sm:top-8 sm:left-8 z-40 pointer-events-none animate-butterfly-orbit"
    style={{ perspective: '450px' }}
  >
    <svg
      viewBox="0 0 100 84"
      className="w-11 h-9 sm:w-13 sm:h-11 overflow-visible drop-shadow-[0_0_16px_rgba(255,255,255,0.95)]"
    >
      <defs>
        <linearGradient id="whiteWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#fff0f6" />
          <stop offset="100%" stopColor="#ffadd2" />
        </linearGradient>
      </defs>
      <g className="animate-wing-left">
        <path
          d="M 48,42 C 28,8 4,6 6,28 C 8,42 26,48 48,45 Z"
          fill="url(#whiteWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path
          d="M 48,45 C 28,48 12,62 20,74 C 28,82 44,68 48,48 Z"
          fill="url(#whiteWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </g>
      <g className="animate-wing-right">
        <path
          d="M 52,42 C 72,8 96,6 94,28 C 92,42 74,48 52,45 Z"
          fill="url(#whiteWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path
          d="M 52,45 C 72,48 88,62 80,74 C 72,82 56,68 52,48 Z"
          fill="url(#whiteWingGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </g>
      <ellipse cx="50" cy="45" rx="2.2" ry="11" fill="#fff0f6" />
    </svg>
  </div>
);

const LeftFeatheredAngelWingSvg: React.FC = () => (
  <svg
    viewBox="0 0 110 80"
    className="w-14 h-10 sm:w-18 sm:h-13 drop-shadow-[0_0_16px_rgba(255,180,220,0.9)]"
  >
    <defs>
      <linearGradient id="angelFeatherL" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#ffeef6" />
        <stop offset="100%" stopColor="#f8bbd0" />
      </linearGradient>
    </defs>
    <path
      d="M 105,46 C 85,16 42,6 6,14 C 16,26 34,30 52,32 C 26,32 12,40 14,50 C 26,52 44,50 62,48 C 36,52 24,60 28,68 C 44,68 64,62 82,56 C 60,64 48,72 54,76 C 72,76 92,64 105,52 Z"
      fill="url(#angelFeatherL)"
      stroke="#f48fb1"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const RightFeatheredAngelWingSvg: React.FC = () => (
  <svg
    viewBox="0 0 110 80"
    className="w-14 h-10 sm:w-18 sm:h-13 drop-shadow-[0_0_16px_rgba(255,180,220,0.9)]"
  >
    <defs>
      <linearGradient id="angelFeatherR" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#ffeef6" />
        <stop offset="100%" stopColor="#f8bbd0" />
      </linearGradient>
    </defs>
    <path
      d="M 5,46 C 25,16 68,6 104,14 C 94,26 76,30 58,32 C 84,32 98,40 96,50 C 84,52 66,50 48,48 C 74,52 86,60 82,68 C 66,68 46,62 28,56 C 50,64 62,72 56,76 C 38,76 18,64 5,52 Z"
      fill="url(#angelFeatherR)"
      stroke="#f48fb1"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default function App() {
  const [giftConfig, setGiftConfig] = useState<GiftConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GiftConfig;
        return sanitizeLegacyGiftConfig(parsed);
      }
    } catch {
      // Fallback
    }
    return getDefaultGiftConfig();
  });

  const [stage, setStage] = useState<ExperienceStage>('idle');
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [isHoldingStart, setIsHoldingStart] = useState(false);

  const [showRealBouquet, setShowRealBouquet] = useState(false);
  const [bouquetPhotosRevealed, setBouquetPhotosRevealed] = useState(false);
  const [isBouquetZoomingIn, setIsBouquetZoomingIn] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showWingedEnvelope, setShowWingedEnvelope] = useState(false);
  // Once the user opens the letter, hide the flying envelope so it doesn't block the falling photos!
  const [hasViewedLetter, setHasViewedLetter] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [externalZoomSignal, setExternalZoomSignal] = useState(0);

  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterModalMode, setLetterModalMode] = useState<
    'envelope' | 'letter' | 'memory'
  >('envelope');
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [isRecipientMode, setIsRecipientMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hostname = window.location.hostname;
    return (
      params.has('g') ||
      hashParams.has('g') ||
      params.has('gift') ||
      hostname.startsWith('ais-pre-') ||
      params.get('mode') === 'recipient'
    );
  });

  const [quickUploadBanner, setQuickUploadBanner] = useState<string>('');
  const quickFilesInputRef = useRef<HTMLInputElement | null>(null);

  const bouquetImageUrl = useMemo(() => createRoseBouquetDataUrl(), []);
  const bouquetForegroundOverlayUrl = useMemo(
    () => createRoseBouquetForegroundOverlayDataUrl(),
    []
  );
  const fallbackPortraitUrl = useMemo(
    () => createSunlitPortraitDataUrl(0),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const encodedGift = params.get('g') || hashParams.get('g');

    // Ưu tiên đọc dữ liệu mã hóa vĩnh viễn từ link URL
    if (encodedGift) {
      decodeGiftFromUrlParam(encodedGift).then((customGift) => {
        if (customGift) {
          const cleanGift = sanitizeLegacyGiftConfig(customGift);
          setGiftConfig(cleanGift);
          setIsRecipientMode(true);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanGift));
          } catch {
            // Ignore
          }
        }
      });
      return;
    }

    // Nếu không có 'g', kiểm tra 'gift' từ API hoặc local
    const giftId = params.get('gift') || '';
    fetch(`/api/gift${giftId ? `?id=${encodeURIComponent(giftId)}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          data?.ok &&
          data.gift &&
          Array.isArray(data.gift.memories) &&
          data.gift.memories.length > 0
        ) {
          const cleanGift = sanitizeLegacyGiftConfig(data.gift);
          setGiftConfig(cleanGift);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanGift));
          } catch {
            // Ignore
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    romanticAudio.setTrackIndex(giftConfig.musicTrackIndex || 0);
    romanticAudio.setCustomAudio(giftConfig.customAudioDataUrl);
  }, [giftConfig.musicTrackIndex, giftConfig.customAudioDataUrl]);

  useEffect(() => {
    if (stage === 'vortex') {
      const t = window.setTimeout(() => {
        setActivePhraseIndex(0);
        setStage('text');
      }, 900);
      return () => window.clearTimeout(t);
    }

    if (stage === 'text') {
      const totalPhrases = giftConfig.particlePhrases?.length || 4;
      const t = window.setTimeout(() => {
        if (activePhraseIndex + 1 < totalPhrases) {
          setActivePhraseIndex((prev) => prev + 1);
        } else {
          setShowRealBouquet(false);
          setBouquetPhotosRevealed(false);
          setIsBouquetZoomingIn(false);
          setStage('bouquet');
        }
      }, 2350);
      return () => window.clearTimeout(t);
    }

    if (stage === 'bouquet') {
      const t1 = window.setTimeout(() => {
        setShowRealBouquet(true);
      }, 1350);
      return () => window.clearTimeout(t1);
    }

    // After Bouquet -> 3D particle dissolve + zoom burst -> Stage 'sphere' (3D Photo & Video Globe - Quả Cầu 3D)
    if (stage === 'dissolve') {
      const t = window.setTimeout(() => {
        setStage('sphere');
      }, 950);
      return () => window.clearTimeout(t);
    }

    if (stage === 'galaxy') {
      const t = window.setTimeout(() => {
        setShowWingedEnvelope(true);
      }, 2500);
      return () => window.clearTimeout(t);
    } else {
      setShowWingedEnvelope(false);
    }
  }, [stage, activePhraseIndex, giftConfig.particlePhrases]);

  const handleStartSequence = () => {
    if (stage !== 'idle' || isHoldingStart) return;
    setIsHoldingStart(true);
    romanticAudio.startIntro();
    romanticAudio.playSparkleChime();
    setIsMusicPlaying(true);

    window.setTimeout(() => {
      setIsHoldingStart(false);
      setStage('vortex');
    }, 420);
  };

  const handleBouquetTap = () => {
    if (isBouquetZoomingIn) return;
    romanticAudio.playSparkleChime();
    if (!bouquetPhotosRevealed) {
      setBouquetPhotosRevealed(true);
    } else {
      // Switch to user's uploaded song ("chờ anh chút thôi. #nhachaymoingay #lofi #lyrics #chill.mp3") on infinite loop
      // right when tapping the flower bouquet to transition to the 3D Sphere!
      romanticAudio.switchToSphereSong();
      setIsMusicPlaying(true);

      // Zoom in into the bouquet + pink flash, then burst into the 3D Sphere (Quả Cầu 3D)!
      setIsBouquetZoomingIn(true);
      setShowShockwave(true);
      window.setTimeout(() => {
        setShowRealBouquet(false);
        setIsBouquetZoomingIn(false);
        setStage('dissolve');
      }, 420);
      window.setTimeout(() => {
        setShowShockwave(false);
      }, 680);
    }
  };

  const handleExplodeSphere = useCallback(() => {
    romanticAudio.playSparkleChime();
    setShowShockwave(true);
    setStage('galaxy');
    window.setTimeout(() => {
      setShowShockwave(false);
    }, 750);
  }, []);

  const handleSelectMemoryFrom3D = useCallback((memory: MemoryItem) => {
    romanticAudio.playSparkleChime();
    setSelectedMemory(memory);
    setLetterModalMode('memory');
    setIsLetterModalOpen(true);
  }, []);

  const handleOpenWingedLetter = () => {
    romanticAudio.playSparkleChime();
    setHasViewedLetter(true);
    setLetterModalMode('envelope');
    setIsLetterModalOpen(true);
  };

  const handleOpenFloralEnvelope = () => {
    romanticAudio.playSparkleChime();
    setHasViewedLetter(true);
    setLetterModalMode('envelope');
    setIsLetterModalOpen(true);
  };

  const handleReplay = () => {
    romanticAudio.startIntro();
    setIsMusicPlaying(true);
    setShowRealBouquet(false);
    setBouquetPhotosRevealed(false);
    setIsBouquetZoomingIn(false);
    setShowWingedEnvelope(false);
    setHasViewedLetter(false);
    setActivePhraseIndex(0);
    setStage('vortex');
  };

  const handleSaveGiftConfig = async (
    updated: GiftConfig,
    openQrAfterSave: boolean
  ) => {
    setIsSavingServer(true);
    setGiftConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota exceeded if large
    }

    try {
      await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // Best-effort
    } finally {
      setIsSavingServer(false);
      setIsStudioOpen(false);
      if (openQrAfterSave) {
        setIsQrModalOpen(true);
      }
    }
  };

  // Appends newly uploaded files to Minh Huyen's existing photos & videos so nothing is ever lost!
  const handleQuickBulkUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setQuickUploadBanner('⚡ Đang tải thêm ảnh & video (.mov/.mp4/.heic)...');
    try {
      const imported = await processBulkUploadedFiles(
        files,
        (done, total) => {
          setQuickUploadBanner(`⚡ Đang tải tốc độ cao: ${done}/${total} tệp...`);
        }
      );
      if (imported.length > 0) {
        const firstVid = imported.find((m) => m.mediaType === 'video');
        const firstImg = imported.find((m) => m.mediaType !== 'video');
        const mergedMemories = [...imported, ...giftConfig.memories].slice(
          0,
          120
        );
        const updated: GiftConfig = {
          ...giftConfig,
          memories: mergedMemories,
          loveLetter: {
            ...giftConfig.loveLetter,
            footerPhotoUrl:
              firstImg?.imageUrl || giftConfig.loveLetter.footerPhotoUrl,
            footerVideoUrl:
              firstVid?.videoUrl || giftConfig.loveLetter.footerVideoUrl,
          },
        };
        await handleSaveGiftConfig(updated, false);
        const vidCount = imported.filter((m) => m.mediaType === 'video').length;
        setQuickUploadBanner(
          `✨ Đã thêm ${imported.length - vidCount} ảnh & ${vidCount} video (Tổng: ${mergedMemories.length})!`
        );
        window.setTimeout(() => setQuickUploadBanner(''), 3800);
      } else {
        setQuickUploadBanner('');
      }
    } catch {
      setQuickUploadBanner('');
    }
  };

  // Pick 5 photo memories for the Rose Bouquet pop-up
  const topPhotosForBouquet = useMemo(() => {
    const onlyPhotos = giftConfig.memories.filter(
      (m) => m.mediaType !== 'video' && m.imageUrl
    );
    return (onlyPhotos.length >= 5 ? onlyPhotos : giftConfig.memories).slice(
      0,
      5
    );
  }, [giftConfig.memories]);

  const bouquetPhotoPositions = [
    {
      // Center Hero Photo (Minh Huyen in white Ao dai)
      left: '36%',
      top: '15%',
      rotate: '0deg',
      delay: '180ms',
      zIndex: 26,
      size: 'w-[90px] h-[116px] sm:w-[108px] sm:h-[138px]',
    },
    {
      // Top-Left Photo
      left: '18%',
      top: '2%',
      rotate: '-9deg',
      delay: '0ms',
      zIndex: 22,
      size: 'w-[84px] h-[106px] sm:w-[98px] sm:h-[124px]',
    },
    {
      // Top-Right Photo
      left: '54%',
      top: '2%',
      rotate: '9deg',
      delay: '90ms',
      zIndex: 22,
      size: 'w-[84px] h-[106px] sm:w-[98px] sm:h-[124px]',
    },
    {
      // Outer-Left Wing Photo
      left: '5%',
      top: '20%',
      rotate: '-14deg',
      delay: '260ms',
      zIndex: 24,
      size: 'w-[82px] h-[104px] sm:w-[96px] sm:h-[122px]',
    },
    {
      // Outer-Right Wing Photo
      left: '67%',
      top: '20%',
      rotate: '14deg',
      delay: '340ms',
      zIndex: 24,
      size: 'w-[82px] h-[104px] sm:w-[96px] sm:h-[122px]',
    },
  ];

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (
          !isStudioOpen &&
          e.dataTransfer.files &&
          e.dataTransfer.files.length > 0
        ) {
          handleQuickBulkUpload(e.dataTransfer.files);
        }
      }}
      className="relative w-screen h-screen overflow-hidden bg-[#020106] select-none"
    >
      {/* 1. Core 3D Engine (3D Sphere + Top-to-bottom falling stream in original aspect ratio) */}
      <CosmicScene3D
        stage={stage}
        showRealBouquet={showRealBouquet}
        activePhraseIndex={activePhraseIndex}
        particlePhrases={giftConfig.particlePhrases}
        floatingWishes={giftConfig.floatingWishes}
        memories={giftConfig.memories}
        externalZoomDelta={externalZoomSignal}
        onSphereTap={handleExplodeSphere}
        onSelectMemory={handleSelectMemoryFrom3D}
      />

      {/* 2. Pink Nebula Flash on Transition */}
      <div
        className={`fixed inset-0 z-20 pointer-events-none transition-opacity duration-700 ${
          showShockwave ? 'opacity-85' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 130, 195, 0.8) 0%, rgba(236, 72, 153, 0.4) 45%, rgba(0, 0, 0, 0) 80%)',
        }}
      />

      {/* Quick Bulk Upload Status Toast */}
      {quickUploadBanner && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 rounded-full border border-[#ff85c0] bg-[#160524]/95 px-5 py-2 text-xs font-bold text-[#ffd6eb] shadow-[0_0_25px_rgba(255,42,133,0.6)]">
          {quickUploadBanner}
        </div>
      )}

      {/* 3. Top-Right Controls + 1-Click Add More Photos/Videos */}
      <header className="fixed top-0 right-0 z-30 pt-safe pr-4 pt-3.5 flex items-center gap-2">
        {!isRecipientMode && (
          <>
            <input
              ref={quickFilesInputRef}
              type="file"
              accept="image/*,video/*,.heic,.heif,.mov,.mp4,.webm,.zip"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleQuickBulkUpload(e.target.files);
                }
                e.target.value = '';
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => quickFilesInputRef.current?.click()}
              title="Thêm nhanh ảnh & video mới (.mov/.mp4/.heic/.zip)"
              className="flex h-9 items-center gap-1.5 rounded-full border border-[#ff85c0]/50 bg-[#ff2a85]/25 px-3.5 text-xs font-bold text-[#ffd6eb] hover:bg-[#ff2a85] hover:text-white transition-all cursor-pointer"
            >
              <FolderUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Thêm Ảnh/Video</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            const playing = romanticAudio.toggle();
            setIsMusicPlaying(playing);
          }}
          title={isMusicPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
          aria-label="Âm nhạc"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/75 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
        >
          {isMusicPlaying ? (
            <Volume2 className="h-4 w-4 text-[#ff85c0]" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={handleOpenFloralEnvelope}
          title="Mở phong bì thư 20/10"
          aria-label="Mở thư"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/75 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
        >
          <Mail className="h-4 w-4 text-[#ff85c0]" />
        </button>

        {stage !== 'idle' && (
          <button
            type="button"
            onClick={handleReplay}
            title="Xem lại từ đầu"
            aria-label="Xem lại"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/75 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}

        {!isRecipientMode && (
          <>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              title="Lấy mã QR tặng bạn gái"
              aria-label="Mã QR"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/75 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsStudioOpen(true)}
              title="Quản lý ảnh, video & sửa chữ"
              aria-label="Cài đặt"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/65 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </>
        )}
      </header>

      {/* 4. STAGE 'idle': Glowing Pink Fingerprint Sensor ("Chạm để bắt đầu") */}
      {stage === 'idle' && (
        <div
          onClick={handleStartSequence}
          className="fixed inset-0 z-20 flex flex-col items-center justify-end pb-12 cursor-pointer pb-safe"
        >
          <div className="flex flex-col items-center mb-3">
            <span className="text-2xl mb-1 animate-bounce">✨</span>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#ffb3d9] drop-shadow-[0_2px_12px_rgba(255,42,133,0.95)] animate-pulse">
              Chạm vào màn hình hoặc dấu vân tay để mở quà 🎁
            </p>
          </div>
          <button
            type="button"
            onPointerDown={handleStartSequence}
            onClick={(e) => {
              e.stopPropagation();
              handleStartSequence();
            }}
            aria-label="Chạm để bắt đầu"
            className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ff5ca8] bg-[#ff2a85]/25 text-[#ff85c0] shadow-[0_0_35px_rgba(255,42,133,0.9)] transition-transform duration-300 cursor-pointer ${
              isHoldingStart ? 'scale-125 bg-[#ff2a85]/50' : 'hover:scale-110 active:scale-95'
            }`}
          >
            <span className="absolute inset-0 rounded-full border border-[#ff85c0] animate-ping opacity-45" />
            <Fingerprint className="h-9 w-9 text-[#ffb3d9]" />
          </button>
        </div>
      )}

      {/* 5. STAGE 'bouquet': Blooming Korean Pink Rose Bouquet + 3D Butterfly + Embedded Portrait Photos */}
      {stage === 'bouquet' && showRealBouquet && (
        <div
          onClick={handleBouquetTap}
          className="fixed inset-0 z-20 flex flex-col items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div
            className={`relative w-[345px] sm:w-[420px] h-[385px] sm:h-[460px] flex items-center justify-center transition-all duration-500 ease-out ${
              isBouquetZoomingIn
                ? 'scale-150 opacity-0'
                : 'scale-100 opacity-100'
            }`}
          >
            <img
              src={bouquetImageUrl}
              alt="Bó hoa hồng 20/10"
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,77,141,0.45)]"
            />

            {bouquetPhotosRevealed && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {topPhotosForBouquet.map((mem, idx) => {
                  const pos =
                    bouquetPhotoPositions[idx % bouquetPhotoPositions.length];
                  return (
                    <div
                      key={mem.id}
                      style={{
                        left: pos.left,
                        top: pos.top,
                        zIndex: pos.zIndex,
                        animationDelay: pos.delay,
                      }}
                      className={`absolute ${pos.size} animate-bouquet-photo`}
                    >
                      <div
                        style={{ transform: `rotate(${pos.rotate})` }}
                        className="w-full h-full overflow-hidden rounded-2xl border-[2.5px] border-white shadow-[0_10px_26px_rgba(140,12,68,0.75)] bg-[#ffe5ec]"
                      >
                        <img
                          src={mem.imageUrl || fallbackPortraitUrl}
                          alt={mem.caption}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (fallbackPortraitUrl) {
                              (e.currentTarget as HTMLImageElement).src =
                                fallbackPortraitUrl;
                            }
                          }}
                          className="w-full h-full object-cover object-[50%_18%]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {bouquetPhotosRevealed && (
              <img
                src={bouquetForegroundOverlayUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 z-30 w-full h-full object-contain pointer-events-none"
              />
            )}

            <BouquetButterfly3D />
          </div>

          <div
            className={`mt-2 rounded-full bg-black/55 border border-white/15 px-5 py-1.5 backdrop-blur-sm transition-opacity duration-300 ${
              isBouquetZoomingIn ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <p className="text-xs sm:text-sm font-medium text-white/90 tracking-wide animate-pulse">
              {bouquetPhotosRevealed ? 'Ấn giữ bó hoa' : 'Chạm vào bó hoa'}
            </p>
          </div>
        </div>
      )}

      {/* 6. STAGE 'sphere': 3D Photo & Video Globe ("Chạm vào quả cầu nhé" to zoom in & explode into 3D Galaxy) */}
      {stage === 'sphere' && (
        <div className="fixed inset-x-0 bottom-10 z-20 flex flex-col items-center pointer-events-none pb-safe">
          <button
            type="button"
            onClick={handleExplodeSphere}
            className="pointer-events-auto rounded-full bg-black/60 border border-[#ff85c0]/50 px-6 py-2 text-xs sm:text-sm font-semibold text-[#ffd6eb] hover:text-white hover:border-[#ff85c0] shadow-[0_0_24px_rgba(255,42,133,0.6)] transition-all cursor-pointer animate-pulse"
          >
            Chạm vào quả cầu nhé ✨
          </button>
        </div>
      )}

      {/* Interactive Zoom In / Zoom Out Controls for Sphere & Galaxy stages */}
      {(stage === 'sphere' || stage === 'galaxy') && (
        <div className="fixed bottom-5 right-4 z-30 flex flex-col gap-2 pb-safe">
          <button
            type="button"
            onClick={() =>
              setExternalZoomSignal((prev) =>
                prev > 0 ? prev + 1 : 1
              )
            }
            title="Zoom vào gần (Phóng to)"
            aria-label="Zoom vào"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-[#ffd6eb] hover:bg-[#ff2a85] hover:text-white shadow-[0_0_16px_rgba(255,42,133,0.4)] transition-all cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setExternalZoomSignal((prev) =>
                prev < 0 ? prev - 1 : -1
              )
            }
            title="Phóng ra xa (Thu nhỏ)"
            aria-label="Phóng ra"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-[#ffd6eb] hover:bg-[#ff2a85] hover:text-white shadow-[0_0_16px_rgba(255,42,133,0.4)] transition-all cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 7. STAGE 'galaxy': Flying Winged Love Envelope (Automatically hidden once the user has clicked to view the letter!) */}
      {stage === 'galaxy' &&
        showWingedEnvelope &&
        !hasViewedLetter &&
        !isLetterModalOpen && (
          <div className="fixed inset-x-0 bottom-14 sm:bottom-16 z-20 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={handleOpenWingedLetter}
              aria-label="Mở bức thư có cánh đang bay"
              className="pointer-events-auto group flex flex-col items-center cursor-pointer animate-envelope-flight"
            >
              <div className="flex items-center justify-center drop-shadow-[0_0_32px_rgba(255,80,165,0.95)] transition-transform duration-300 group-hover:scale-110">
                <div className="-mr-1.5 animate-angel-left">
                  <LeftFeatheredAngelWingSvg />
                </div>

                <div className="relative z-10 flex h-13 w-19 sm:h-15 sm:w-22 items-center justify-center rounded-xl bg-gradient-to-b from-[#ffffff] to-[#ffe6f0] border-2 border-[#ffb3d1] shadow-[0_0_28px_rgba(255,105,180,0.85)]">
                  <svg
                    viewBox="0 0 80 56"
                    className="absolute inset-0 w-full h-full"
                  >
                    <path
                      d="M 2,46 L 30,26 M 78,46 L 50,26"
                      fill="none"
                      stroke="#f8bbd0"
                      strokeWidth="2"
                    />
                    <path
                      d="M 2,2 L 40,30 L 78,2"
                      fill="none"
                      stroke="#f48fb1"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <Heart className="relative z-10 h-5 w-5 sm:h-6 sm:w-6 fill-[#e11d48] text-[#e11d48] mt-1.5 drop-shadow-[0_2px_6px_rgba(225,29,72,0.5)] animate-pulse" />
                </div>

                <div className="-ml-1.5 animate-angel-right">
                  <RightFeatheredAngelWingSvg />
                </div>
              </div>

              <span className="mt-2 rounded-full bg-black/65 border border-[#ff85c0]/45 px-4 py-1 text-xs font-medium text-[#ffd6eb] shadow-lg">
                Chạm vào thư đang bay nhé 💌
              </span>
            </button>
          </div>
        )}

      {/* 8. Floral Envelope & Single-Page Love Letter Modal */}
      <LoveLetterModal
        isOpen={isLetterModalOpen}
        initialMode={letterModalMode}
        selectedMemory={selectedMemory}
        memories={giftConfig.memories}
        loveLetter={giftConfig.loveLetter}
        onClose={() => setIsLetterModalOpen(false)}
        onSelectMemory={(mem) => setSelectedMemory(mem)}
      />

      {/* 9. Customization Studio Modal */}
      <MemoryStudioModal
        isOpen={isStudioOpen}
        giftConfig={giftConfig}
        isSavingServer={isSavingServer}
        onClose={() => setIsStudioOpen(false)}
        onSaveGiftConfig={handleSaveGiftConfig}
      />

      {/* 10. Downloadable 20/10 QR Card Modal */}
      <QrShareModal
        isOpen={isQrModalOpen}
        giftConfig={giftConfig}
        onClose={() => setIsQrModalOpen(false)}
        onPreviewRecipientMode={() => setIsRecipientMode(true)}
      />

      {/* 11. Discreet Admin Toggle for the Creator */}
      {isRecipientMode && (
        <>
          <button
            type="button"
            onClick={() => setIsRecipientMode(false)}
            title="Mở thanh công cụ chỉnh sửa (Dành cho người tạo)"
            aria-label="Chế độ chỉnh sửa"
            className="fixed bottom-3 left-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white/20 hover:bg-black/60 hover:text-white/80 transition-all opacity-30 hover:opacity-100 cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3" />
          </button>

          {/* 12. "Tự tạo quà tặng 3D" button for visitors */}
          <button
            type="button"
            onClick={() => {
              setIsRecipientMode(false);
              setIsStudioOpen(true);
            }}
            title="Tự tạo một món quà 3D tặng người yêu của bạn"
            className="fixed bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-full border border-pink-400/40 bg-[#160524]/85 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-semibold text-[#ffd6eb] shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:bg-[#ff2a85]/40 hover:text-white hover:border-[#ff85c0] transition-all cursor-pointer"
          >
            <span>✨ Tự tạo quà tặng 3D</span>
          </button>
        </>
      )}
    </div>
  );
}
