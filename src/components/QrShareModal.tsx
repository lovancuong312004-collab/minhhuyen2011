import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, X } from 'lucide-react';
import { GiftConfig } from '../types/gift';

interface QrShareModalProps {
  isOpen: boolean;
  giftConfig: GiftConfig;
  onClose: () => void;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({
  isOpen,
  giftConfig,
  onClose,
}) => {
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const url = new URL(window.location.href);
    url.searchParams.set('gift', giftConfig.id || 'love-2010');
    const finalUrl = url.toString();
    setShareUrl(finalUrl);

    const renderGiftQrCard = async () => {
      const canvas = cardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 720;
      canvas.height = 960;

      // Pastel pink floral card background matching 0:01 - 0:03 of Video 2
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
        errorCorrectionLevel: 'H',
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
      ctx.fillText('Quét mã QR bằng Camera iPhone để mở quà 🎁', 360, 745);

      ctx.fillStyle = '#880e4f';
      ctx.font = '600 32px "Dancing Script", cursive';
      ctx.fillText(
        giftConfig.loveLetter.signature || 'Anh yêu em bé của anh ❤️',
        360,
        835
      );
    };

    renderGiftQrCard();
  }, [isOpen, giftConfig]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  const handleDownloadCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'Thiep-QR-20-10.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl border border-[#ff85c0]/40 bg-[#12041c]/95 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-base font-bold text-[#ff85c0]">
            Thiệp Mã QR 20/10 Tặng Bạn Gái
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

        <div className="overflow-y-auto custom-scroll p-6 space-y-5 text-center">
          <div className="mx-auto max-w-[270px] overflow-hidden rounded-2xl border border-[#ff85c0]/40 shadow-2xl">
            <canvas ref={cardCanvasRef} className="w-full h-auto block" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-[#ff2a85] text-white px-5 py-2 text-xs font-bold shadow-[0_0_15px_rgba(255,42,133,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Tải Thiệp QR</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-5 py-2 text-xs font-bold text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Đã sao chép link</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
