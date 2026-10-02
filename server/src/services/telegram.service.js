import { env } from '../config/env.js';

const telegramApiUrl = () => `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

const formatRegistrationMessage = (registration) => [
  '🔔 ĐĂNG KÝ TƯ VẤN MỚI',
  '',
  `👤 Họ tên: ${registration.name}`,
  `☎ Số điện thoại: ${registration.phone}`,
  `🚗 Khóa học: ${registration.courseType}`,
  `📍 Khu vực: ${registration.area}`,
  `📝 Ghi chú: ${registration.note || 'Không có'}`,
  `🕒 Thời gian: ${new Date(registration.createdAt || Date.now()).toLocaleString('vi-VN')}`,
].join('\n');

export async function sendRegistrationNotification(registration) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return { sent: false, reason: 'missing_config' };
  }

  const response = await fetch(telegramApiUrl(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: formatRegistrationMessage(registration),
    }),
    signal: AbortSignal.timeout(8000),
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.description || `Telegram API trả về HTTP ${response.status}.`);
  }

  return { sent: true };
}
