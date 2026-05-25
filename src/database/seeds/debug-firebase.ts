import 'reflect-metadata';
require('dotenv').config();

const ANDROID_APP_ID = process.env.FIREBASE_ANDROID_APP_ID;
const ANDROID_SECRET = process.env.FIREBASE_ANDROID_API_SECRET;
const IOS_APP_ID = process.env.FIREBASE_IOS_APP_ID;
const IOS_SECRET = process.env.FIREBASE_IOS_API_SECRET;

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

async function testDebug() {
  console.log('🔍 Kiểm tra bằng Google Analytics Validation Server (Debug)...');
  
  const plat = { os: 'ios', appId: IOS_APP_ID, secret: IOS_SECRET };
  const debugUrl = `https://www.google-analytics.com/debug/mp/collect?firebase_app_id=${plat.appId}&api_secret=${plat.secret}`;

  const payload = {
    client_id: generateUUID(),
    events: [
      {
        name: 'screen_view',
        params: {
          screen_name: '/',
          device_os: plat.os,
          engagement_time_msec: 100,
        },
      }
    ],
  };

  try {
    const response = await fetch(debugUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('HTTP Status:', response.status);
    console.log('Phản hồi kiểm tra lỗi từ Google:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('❌ Lỗi kết nối:', err.message);
  }
}

testDebug().catch(console.error);
