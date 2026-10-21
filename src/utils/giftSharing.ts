import { GiftConfig, MemoryItem } from '../types/gift';
import { getDefaultGiftConfig } from './defaultMemories';
import { IMGBB_CONFIG, TELEGRAM_CONFIG } from '../config/giftSharingConfig';

interface CompactGiftPayload {
  v?: number; // schema version
  r?: string; // recipient
  t?: string; // letter title
  b?: string; // letter body
  s?: string; // signature
  d?: string; // date
  m?: number; // musicTrackIndex
  w?: string[]; // floatingWishes
  p?: string[]; // particlePhrases
  imgs?: string[]; // image URLs for custom memories
  fp?: string; // footerPhotoUrl
}

// Convert bytes to URL-safe Base64
function toUrlSafeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert URL-safe Base64 to Uint8Array
function fromUrlSafeBase64(base64: string): Uint8Array {
  let b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Nén và mã hóa GiftConfig thành chuỗi URL an toàn, ngắn gọn
 */
export async function encodeGiftToUrlParam(gift: GiftConfig): Promise<string> {
  const defaults = getDefaultGiftConfig();

  // CHỈ lưu link ảnh nếu là URL web hợp lệ (http:// hoặc https://) ngắn gọn.
  // TUYỆT ĐỐI KHÔNG lưu data: (base64) hoặc blob: vì sẽ khiến URL phình to hàng trăm KB gây lỗi URI_TOO_LONG!
  const validWebImages = (gift.memories || [])
    .map((m) => m.imageUrl || m.videoUrl || '')
    .filter((url) => /^https?:\/\//i.test(url) && url.length < 300)
    .slice(0, 10);

  const validFooterPhoto =
    gift.loveLetter.footerPhotoUrl &&
    /^https?:\/\//i.test(gift.loveLetter.footerPhotoUrl) &&
    gift.loveLetter.footerPhotoUrl.length < 300
      ? gift.loveLetter.footerPhotoUrl
      : undefined;

  const payload: CompactGiftPayload = {
    v: 1,
    r: gift.loveLetter.recipient,
    t: gift.loveLetter.title,
    b: gift.loveLetter.body,
    s: gift.loveLetter.signature,
    d: gift.loveLetter.date,
    m: typeof gift.musicTrackIndex === 'number' ? gift.musicTrackIndex : 0,
    // Chỉ lưu nếu khác mặc định để giữ link siêu ngắn gọn
    w:
      JSON.stringify(gift.floatingWishes) !==
      JSON.stringify(defaults.floatingWishes)
        ? gift.floatingWishes
        : undefined,
    p:
      JSON.stringify(gift.particlePhrases) !==
      JSON.stringify(defaults.particlePhrases)
        ? gift.particlePhrases
        : undefined,
    imgs: validWebImages.length > 0 ? validWebImages : undefined,
    fp: validFooterPhoto,
  };

  const jsonString = JSON.stringify(payload);

  // Thử nén bằng CompressionStream ('deflate-raw') nếu trình duyệt hỗ trợ
  if (typeof CompressionStream !== 'undefined' && typeof Blob !== 'undefined') {
    try {
      const stream = new Blob([new TextEncoder().encode(jsonString)])
        .stream()
        .pipeThrough(new CompressionStream('deflate-raw'));
      const buffer = await new Response(stream).arrayBuffer();
      const b64 = toUrlSafeBase64(new Uint8Array(buffer));
      return `z~${b64}`;
    } catch {
      // Fallback
    }
  }

  // Fallback: mã hóa base64 chuẩn UTF-8
  const utf8Bytes = new TextEncoder().encode(jsonString);
  return `b~${toUrlSafeBase64(utf8Bytes)}`;
}

/**
 * Giải nén chuỗi tham số URL thành GiftConfig
 */
export async function decodeGiftFromUrlParam(
  param: string
): Promise<GiftConfig | null> {
  if (!param || typeof param !== 'string') return null;

  try {
    let jsonString = '';

    if (param.startsWith('z~')) {
      const rawB64 = param.slice(2);
      const bytes = fromUrlSafeBase64(rawB64);
      if (
        typeof DecompressionStream !== 'undefined' &&
        typeof Blob !== 'undefined'
      ) {
        const stream = new Blob([bytes])
          .stream()
          .pipeThrough(new DecompressionStream('deflate-raw'));
        jsonString = await new Response(stream).text();
      }
    } else if (param.startsWith('b~')) {
      const rawB64 = param.slice(2);
      const bytes = fromUrlSafeBase64(rawB64);
      jsonString = new TextDecoder().decode(bytes);
    } else {
      // Thử giải mã dạng base64 thông thường
      const bytes = fromUrlSafeBase64(param);
      jsonString = new TextDecoder().decode(bytes);
    }

    if (!jsonString) return null;
    const data = JSON.parse(jsonString) as CompactGiftPayload;
    const defaults = getDefaultGiftConfig();

    // Tái cấu trúc memories từ danh sách link ảnh nếu có
    let memories: MemoryItem[] = defaults.memories;
    if (Array.isArray(data.imgs) && data.imgs.length > 0) {
      memories = data.imgs.map((url, idx) => ({
        id: `shared-mem-${idx}`,
        imageUrl: url,
        mediaType: 'image',
        caption: `Kỷ niệm #${idx + 1}`,
        date: data.d || '20/10',
        note: 'Khoảnh khắc ngọt ngào của hai đứa mình ❤',
      }));
    }

    return {
      id: `gift-${Date.now().toString(36)}`,
      particlePhrases: Array.isArray(data.p) && data.p.length > 0 ? data.p : defaults.particlePhrases,
      floatingWishes: Array.isArray(data.w) && data.w.length > 0 ? data.w : defaults.floatingWishes,
      memories,
      loveLetter: {
        recipient: data.r ?? defaults.loveLetter.recipient,
        title: data.t ?? defaults.loveLetter.title,
        body: data.b ?? defaults.loveLetter.body,
        signature: data.s ?? defaults.loveLetter.signature,
        date: data.d ?? defaults.loveLetter.date,
        footerPhotoUrl: data.fp ?? defaults.loveLetter.footerPhotoUrl,
        footerVideoUrl: defaults.loveLetter.footerVideoUrl,
      },
      musicTrackIndex: typeof data.m === 'number' ? data.m : defaults.musicTrackIndex,
    };
  } catch (err) {
    console.warn('Failed to decode gift from URL:', err);
    return null;
  }
}

/**
 * Tải ảnh trực tiếp lên Đám Mây ImgBB (Miễn phí & Lưu vĩnh viễn)
 */
export async function uploadImageToImgBB(fileOrBlob: Blob): Promise<string | null> {
  const apiKey = IMGBB_CONFIG.apiKey;
  if (!apiKey) return null;

  try {
    const formData = new FormData();
    formData.append('image', fileOrBlob);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data?.success && data?.data?.url) {
      return data.data.url as string;
    }
  } catch (err) {
    console.warn('ImgBB upload error:', err);
  }
  return null;
}

/**
 * Báo tin nhắn tức thì về Telegram khi có người tạo quà tặng mới
 */
export async function notifyTelegramGiftCreated(
  gift: GiftConfig,
  shareUrl: string
): Promise<boolean> {
  if (!TELEGRAM_CONFIG.enabled || !TELEGRAM_CONFIG.botToken || !TELEGRAM_CONFIG.chatId) {
    return false;
  }

  try {
    const recipient = gift.loveLetter.recipient || 'Người thương';
    const title = gift.loveLetter.title || 'Món quà tình yêu';
    const bodyPreview = (gift.loveLetter.body || '').slice(0, 150) + (gift.loveLetter.body.length > 150 ? '...' : '');
    const dateStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const message = [
      `💌 <b>Có người vừa tạo quà tặng 3D mới!</b>`,
      ``,
      `👤 <b>Người nhận:</b> ${recipient}`,
      `📌 <b>Tiêu đề:</b> ${title}`,
      `📝 <b>Thư tình:</b> <i>"${bodyPreview}"</i>`,
      `🎵 <b>Bài nhạc số:</b> ${gift.musicTrackIndex ?? 0}`,
      `⏰ <b>Thời gian:</b> ${dateStr}`,
      ``,
      `🔗 <b>Link xem quà:</b> <a href="${shareUrl}">${shareUrl}</a>`,
    ].join('\n');

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );

    return res.ok;
  } catch (err) {
    console.warn('Failed to send Telegram notification:', err);
    return false;
  }
}
