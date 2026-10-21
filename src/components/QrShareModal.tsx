import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, Eye, Heart, Info, Sparkles, X } from 'lucide-react';
import { GiftConfig } from '../types/gift';
import { encodeGiftToUrlParam, notifyTelegramGiftCreated } from '../utils/giftSharing';

interface QrShareModalProps {
  isOpen: boolean;
  giftConfig: GiftConfig;
  onClose: () => void;
  onPreviewRecipientMode?: () => void;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({
  isOpen,
  giftConfig,
  onClose,
  onPreviewRecipientMode,
}) => {
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWish, setCopiedWish] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsEncoding(true);

    const generateUrlAndCard = async () => {
      try {
        // Nén và mã hóa toàn bộ dữ liệu quà tặng vào tham số 'g'
        const encodedData = await encodeGiftToUrlParam(giftConfig);
        
        // Khởi tạo URL sạch từ origin và pathname (không mang theo param cũ)
        const url = new URL(window.location.origin + window.location.pathname);

        // Chuyển domain ais-dev- sang ais-pre- nếu đang dùng AI Studio
        if (url.hostname.startsWith('ais-dev-')) {
          url.hostname = url.hostname.replace('ais-dev-', 'ais-pre-');
        }

        url.search = '';
        url.searchParams.set('g', encodedData);
        const finalUrl = url.toString();

        if (!isMounted) return;
        setShareUrl(finalUrl);
        setIsEncoding(false);

        // Tự động gửi thông báo Telegram nếu được cấu hình
        notifyTelegramGiftCreated(giftConfig, finalUrl);

        // Vẽ thiệp mã QR
        const canvas = cardCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 720;
        canvas.height = 960;

        // Pastel pink floral card background
        const grad = ctx.createLinearGradient(0, 0, 720, 960);
        grad.addColorStop(0, '#fff5f8');
        grad.addColorStop(0.5, '#ffe3ee');
        grad.addColorStop(1, '#ffc8de');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 720, 960);

        // Soft pink border
        ctx.strokeStyle = '#f48fb1';
        ctx.lineWidth = 4;
        ctx.strokeRect(32, 32, 656, 896);

        // Header "20/10" & Love Title
        ctx.fillStyle = '#d81b60';
        ctx.textAlign = 'center';
        ctx.font = '700 56px "Dancing Script", cursive';
        ctx.fillText('Happy 20/10', 360, 130);

        ctx.fillStyle = '#880e4f';
        ctx.font = '600 28px "Dancing Script", cursive';
        ctx.fillText(
          giftConfig.loveLetter.recipient || 'Gửi cô gái bé nhỏ của anh',
          360,
          185
        );

        // Generate pink QR code
        const qrCanvas = document.createElement('canvas');
        await QRCode.toCanvas(qrCanvas, finalUrl, {
          width: 380,
          margin: 2,
          color: {
            dark: '#c2185b',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });

        // Heart-accented white card frame for QR
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(216, 27, 96, 0.25)';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.roundRect(150, 240, 420, 420, 36);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = '#f06292';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(150, 240, 420, 420, 36);
        ctx.stroke();

        ctx.drawImage(qrCanvas, 170, 260, 380, 380);

        // Footer text
        ctx.fillStyle = '#ad1457';
        ctx.font = '600 24px "Quicksand", sans-serif';
        ctx.fillText('Quét mã QR bằng Camera điện thoại để mở quà 🎁', 360, 745);

        ctx.fillStyle = '#880e4f';
        ctx.font = '600 32px "Dancing Script", cursive';
        ctx.fillText(
          giftConfig.loveLetter.signature || 'Anh yêu em bé của anh ❤️',
          360,
          835
        );
      } catch (err) {
        console.error('Error generating card & share link:', err);
        if (isMounted) setIsEncoding(false);
      }
    };

    generateUrlAndCard();

    return () => {
      isMounted = false;
    };
  }, [isOpen, giftConfig]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2500);
      notifyTelegramGiftCreated(giftConfig, shareUrl);
    } catch {
      // Ignore
    }
  };

  const handleCopyWishAndLink = async () => {
    try {
      const recipient = giftConfig.loveLetter.recipient || 'Em';
      const text = `Gửi tặng ${recipient} món quà nhỏ từ trái tim ❤️ Mở ra để khám phá vũ trụ tình yêu dành riêng cho em nhé:\n${shareUrl}`;
      await navigator.clipboard.writeText(text);
      setCopiedWish(true);
      window.setTimeout(() => setCopiedWish(false), 2500);
      notifyTelegramGiftCreated(giftConfig, shareUrl);
    } catch {
      // Ignore
    }
  };

  const handleDownloadCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Thiep-QR-${encodeURIComponent(giftConfig.loveLetter.recipient || '20-10')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    notifyTelegramGiftCreated(giftConfig, shareUrl);
  };

  const handlePreviewGirlfriendView = () => {
    if (onPreviewRecipientMode) {
      onPreviewRecipientMode();
      onClose();
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-[#ff85c0]/40 bg-[#12041c]/95 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-base font-bold text-[#ff85c0] flex items-center gap-2">
            <span>🎁</span>
            <span>Chia Sẻ Quà Tặng & Mã QR</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scroll p-6 space-y-4 text-center">
          {/* Card Preview */}
          <div className="mx-auto max-w-[250px] overflow-hidden rounded-2xl border border-[#ff85c0]/40 shadow-2xl relative">
            <canvas ref={cardCanvasRef} className="w-full h-auto block" />
            {isEncoding && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-pink-300">
                Đang tạo mã QR vĩnh viễn...
              </div>
            )}
          </div>

          {/* Permanent Link Info Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-[11px] font-medium text-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>Link lưu trữ vĩnh viễn — Tự chứa trọn vẹn thư & lời chúc</span>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#ff2a85] text-white px-4 py-2 text-xs font-bold shadow-[0_0_15px_rgba(255,42,133,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Tải Thiệp QR (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2 text-xs font-bold text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">Đã chép link quà</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Sao chép link quà</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyWishAndLink}
              className="flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-[#ff85c0]/30 bg-[#ff2a85]/15 px-4 py-2 text-xs font-bold text-[#ffd6eb] hover:bg-[#ff2a85]/30 transition-all cursor-pointer"
            >
              {copiedWish ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã chép kèm lời chúc</span>
                </>
              ) : (
                <>
                  <Heart className="h-3.5 w-3.5 text-[#ff85c0]" />
                  <span>Chép kèm lời chúc</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePreviewGirlfriendView}
              className="flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-pink-300" />
              <span>Xem thử giao diện Bạn Gái</span>
            </button>
          </div>

          {/* Notes & Guidance Box */}
          <div className="rounded-2xl border border-pink-400/25 bg-pink-500/10 p-3.5 text-left text-xs text-[#ffd6eb]/90 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[#ff85c0]">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Đặc điểm của đường link vĩnh viễn:</span>
            </div>
            <p>
              • Toàn bộ thư tình, tên người nhận và cài đặt nhạc được nén trực tiếp vào đường link. Dù bạn gái mở ở máy nào cũng sẽ xem được đúng 100% món quà bạn đã tạo.
            </p>
            <p>
              • Khi bạn gái mở, hệ thống sẽ tự động chuyển sang <strong>Chế độ Người Nhận Quà</strong> (ẩn thanh chỉnh sửa để giữ không gian lãng mạn).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
