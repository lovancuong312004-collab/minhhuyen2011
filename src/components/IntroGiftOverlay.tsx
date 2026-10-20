import React, { useEffect, useState } from 'react';
import { Heart, Smartphone } from 'lucide-react';

interface IntroGiftOverlayProps {
  recipient: string;
  bannerTitle: string;
  onOpenGift: () => void;
}

export const IntroGiftOverlay: React.FC<IntroGiftOverlayProps> = ({
  recipient,
  bannerTitle,
  onOpenGift,
}) => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsPortraitMobile(h > w && w < 768);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleEnter = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    window.setTimeout(() => {
      onOpenGift();
    }, 550);
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center transition-all duration-700 cursor-pointer ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 45%, rgba(45, 10, 68, 0.72) 0%, rgba(10, 3, 20, 0.92) 55%, rgba(3, 1, 8, 0.98) 100%)',
      }}
    >
      <div className="max-w-md space-y-6">
        {/* Glowing Minimal Heart Seal */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] shadow-[0_0_50px_rgba(255,60,130,0.4)] animate-soft-glow">
          <Heart className="h-8 w-8 fill-[#ff4d8d] text-[#ff4d8d] drop-shadow-[0_0_16px_rgba(255,77,141,0.9)]" />
        </div>

        <div className="space-y-2">
          <p className="font-editorial italic text-base sm:text-lg text-[#ffd6e7]/80 tracking-wide">
            {recipient || 'Gửi người con gái anh thương,'}
          </p>
          <h1 className="font-script text-4xl sm:text-5xl text-white drop-shadow-[0_0_24px_rgba(255,77,141,0.65)]">
            {bannerTitle}
          </h1>
        </div>

        {/* Minimal, Elegant Landscape Hint on Portrait iPhone */}
        {isPortraitMobile && (
          <div className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-[#ffd6e7]/75">
            <Smartphone className="h-4 w-4 text-[#ff85b3] animate-rotate-phone shrink-0" />
            <span>Xoay ngang điện thoại để ngắm trọn vẹn bầu trời sao</span>
          </div>
        )}

        <div className="pt-4">
          <span className="inline-block border-b border-[#ff85b3]/40 pb-1 text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-[#ffd6e7]/80 transition-opacity hover:text-white">
            Chạm nhẹ vào màn hình để mở
          </span>
        </div>
      </div>
    </div>
  );
};
