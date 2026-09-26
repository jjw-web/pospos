import type { CapacitorConfig } from '@capacitor/cli';

// Production: app phải chạy từ dist/ local trong máy.
// TUYỆT ĐỐI không commit server.url vào file này — IPA chạy remote URL sẽ
// trắng màn khi mất mạng và tự reload mỗi lần Vercel deploy (hiện tượng "crash xong reset").
// Khi cần live-reload lúc dev, chạy với biến môi trường:
//   CAPACITOR_SERVER_URL=https://pospos.vercel.app npx cap run ios -l
const devServerUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.bongcafe.pos',
  appName: 'Bong Cafe POS',
  webDir: 'dist',
  ...(devServerUrl ? { server: { url: devServerUrl, cleartext: false } } : {}),
};

export default config;
