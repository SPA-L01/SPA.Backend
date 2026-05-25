import 'reflect-metadata';
require('dotenv').config();

const ANDROID_APP_ID = process.env.FIREBASE_ANDROID_APP_ID;
const ANDROID_SECRET = process.env.FIREBASE_ANDROID_API_SECRET;
const IOS_APP_ID = process.env.FIREBASE_IOS_APP_ID;
const IOS_SECRET = process.env.FIREBASE_IOS_API_SECRET;

if (!ANDROID_APP_ID || !ANDROID_SECRET || !IOS_APP_ID || !IOS_SECRET) {
  console.error('❌ LỖI: Thiếu cấu hình trong file .env');
  process.exit(1);
}

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

const generateAppInstanceId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

async function run() {
  console.log('⚡ Đang bắn 20 sự kiện thời gian thực (Realtime - ngay bây giờ) lên Firebase...');
  
  // Gửi 10 sự kiện Android và 10 sự kiện iOS với timestamp hiện tại
  const nowMs = Date.now();
  
  const platforms = [
    { os: 'android', appId: ANDROID_APP_ID, secret: ANDROID_SECRET },
    { os: 'ios', appId: IOS_APP_ID, secret: IOS_SECRET }
  ];

  let count = 0;

  for (let i = 0; i < 10; i++) {
    for (const plat of platforms) {
      const url = `https://www.google-analytics.com/mp/collect?firebase_app_id=${plat.appId}&api_secret=${plat.secret}`;
      
      const payload = {
        app_instance_id: generateAppInstanceId(),
        events: [
          {
            name: 'screen_view',
            params: {
              firebase_screen: '/',
              firebase_screen_class: 'HomeScreen',
              device_os: plat.os,
              engagement_time_msec: 2000,
            },
          },
          {
            name: 'submit_survey',
            params: {
              overall_rating: 5,
              usability_rating: 5,
              booking_rating: 5,
              ui_rating: 5,
              has_comment: false,
              device_os: plat.os,
              last_visited_screen: '/',
            },
          }
        ],
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          count++;
          console.log(`  [${count}] Gửi thành công sự kiện realtime cho ${plat.os}`);
        } else {
          const text = await response.text();
          console.error(`  ❌ Lỗi gửi ${plat.os} (HTTP ${response.status}): ${text}`);
        }
      } catch (err: any) {
        console.error(`  ❌ Lỗi kết nối: ${err.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`\n🎉 Xong! Đã bắn ${count} sự kiện Realtime. Bạn hãy tải lại trang Google Analytics Realtime để kiểm tra.`);
}

run().catch(console.error);
