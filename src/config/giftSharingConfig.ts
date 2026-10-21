/**
 * Cấu hình chia sẻ quà tặng, lưu trữ đám mây và thông báo Telegram.
 * 
 * HƯỚNG DẪN BẬT THÔNG BÁO TELEGRAM (Hoàn toàn miễn phí, chỉ mất 1 phút):
 * 1. Mở Telegram, tìm kiếm bot: @BotFather -> Bấm Start -> Gõ /newbot để tạo bot và copy BOT TOKEN dán vào botToken bên dưới.
 * 2. Tìm kiếm bot: @userinfobot -> Bấm Start -> Copy dãy số Id của bạn dán vào chatId bên dưới.
 * 3. Chuyển enabled: true -> Xong! Mỗi khi ai tạo quà, bot sẽ báo ngay về điện thoại bạn.
 */
export const TELEGRAM_CONFIG = {
  enabled: true,
  botToken: '8926685506:AAE8efoWb19bOn8IxjyUEI2HZ12rAV7v8bM',
  chatId: '8331970784',
};

/**
 * API Key ImgBB miễn phí để lưu ảnh vĩnh viễn trên đám mây.
 * Bạn có thể dùng key mặc định dưới đây hoặc đăng ký key riêng tại https://api.imgbb.com/ (miễn phí 100%).
 */
export const IMGBB_CONFIG = {
  apiKey: '9c2d7650dfbf9c9a66d987d354b6fb79', // Client public key
};
