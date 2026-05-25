import 'reflect-metadata';
require('dotenv').config();

const ANDROID_APP_ID = process.env.FIREBASE_ANDROID_APP_ID;
const ANDROID_SECRET = process.env.FIREBASE_ANDROID_API_SECRET;
const IOS_APP_ID = process.env.FIREBASE_IOS_APP_ID;
const IOS_SECRET = process.env.FIREBASE_IOS_API_SECRET;

if (!ANDROID_APP_ID || !ANDROID_SECRET || !IOS_APP_ID || !IOS_SECRET) {
  console.error('❌ LỖI: Thiếu thông tin cấu hình Firebase trong file .env!');
  process.exit(1);
}

const PARKING_NAMES = [
  'Bãi xe Vincom Center Đồng Khởi',
  'Bãi xe Bitexco Financial Tower',
  'Bãi xe Saigon Centre',
  'Bãi xe Lotte Mart Quận 7',
  'Bãi xe Landmark 81',
];

const FEEDBACKS_POSITIVE = [
  'Ứng dụng tìm kiếm bãi đỗ xe và thanh toán siêu nhanh, vô cùng tiện lợi.',
  'Giao diện dark mode rất chuyên nghiệp, mượt mà và trực quan.',
  'Thích nhất tính năng lưu vị trí xe, không sợ quên chỗ đỗ.',
  'Rất hài lòng, tiết kiệm nhiều thời gian tìm bãi đỗ.',
  'Quy trình checkin bằng mã QR rất nhanh và thông minh.',
];

const FEEDBACKS_NEGATIVE = [
  'Lỗi thanh toán ví liên tục, trừ tiền nhưng không check-in được.',
  'Giao diện nạp tiền phức tạp, load bản đồ rất chậm.',
  'Ứng dụng ngốn pin và đôi lúc bị đơ khi đang checkout.',
];

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

async function run() {
  console.log(`🚀 Bắt đầu mô phỏng 3 luồng hành vi thực tế (Booking, TopUp, Friction) lên Firebase Analytics...`);
  
  const totalSessions = 200;
  const nowMs = Date.now();
  const seventyTwoHoursMs = 72 * 60 * 60 * 1000;

  let successCount = 0;
  let surveysCount = 0;

  for (let i = 0; i < totalSessions; i++) {
    const sessionStartOffsetMs = Math.floor(Math.random() * seventyTwoHoursMs);
    const sessionStartTimeMs = nowMs - sessionStartOffsetMs;

    const clientId = generateUUID();
    const os = Math.random() > 0.45 ? 'ios' : 'android';
    const parking = randomElement(REAL_PARKINGS_WITH_ID());

    const events: any[] = [];
    let relativeTimeMs = 0;

    // Phân chia luồng hành vi ngẫu nhiên
    const behaviorRoll = Math.random();

    if (behaviorRoll < 0.60) {
      // ==========================================
      // LUỒNG A: Đặt chỗ và Hoàn thành thành công (60% người dùng)
      // ==========================================
      
      // 1. Vào App -> Home Screen
      relativeTimeMs += randomRange(1000, 2500);

      events.push({
        name: 'screen_view',
        params: { screen_name: '/', device_os: os, engagement_time_msec: 1500 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(4000, 8000);

      // 2. Vào xem chi tiết bãi đỗ xe
      events.push({
        name: 'screen_view',
        params: { screen_name: `/parking/${parking.id}`, device_os: os, engagement_time_msec: 4000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      events.push({
        name: 'view_parking_detail',
        params: { parking_id: parking.id, parking_name: parking.name },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs + 50) * 1000,
      });
      relativeTimeMs += randomRange(8000, 15000);

      // 3. Tiến hành đặt chỗ
      events.push({
        name: 'screen_view',
        params: { screen_name: `/booking/${parking.id}`, device_os: os, engagement_time_msec: 3500 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      events.push({
        name: 'booking_start',
        params: { parking_id: parking.id, parking_name: parking.name },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs + 50) * 1000,
      });
      relativeTimeMs += randomRange(10000, 20000);

      // 4. Màn hình thanh toán và thành công
      events.push({
        name: 'screen_view',
        params: { screen_name: '/payment/checkout', device_os: os, engagement_time_msec: 6000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(6000, 10000);

      const fee = randomRange(2, 6) * 10000;
      events.push({
        name: 'screen_view',
        params: { screen_name: '/payment/success', device_os: os, engagement_time_msec: 2000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      events.push({
        name: 'booking_success',
        params: { parking_id: parking.id, fee: fee },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs + 50) * 1000,
      });
      relativeTimeMs += randomRange(20000, 50000);

      // 5. Checkout (kết thúc gửi xe)
      events.push({
        name: 'screen_view',
        params: { screen_name: '/(tabs)/history', device_os: os, engagement_time_msec: 3000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      events.push({
        name: 'checkout_success',
        params: { parking_id: parking.id, parking_name: parking.name },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs + 50) * 1000,
      });
      relativeTimeMs += randomRange(3000, 6000);

      // 6. Nhận khảo sát (tỉ lệ 25% người dùng luồng A trả lời)
      if (Math.random() < 0.25) {
        events.push({
          name: 'survey_modal_opened',
          params: { device_os: os },
          timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
        });
        relativeTimeMs += randomRange(10000, 22000);

        const rating = randomRange(4, 5);
        events.push({
          name: 'submit_survey',
          params: {
            overall_rating: rating,
            usability_rating: randomRange(4, 5),
            booking_rating: randomRange(4, 5),
            ui_rating: randomRange(4, 5),
            has_comment: true,
            comment_text: randomElement(FEEDBACKS_POSITIVE),
            session_duration: Math.round(relativeTimeMs / 1000),
            device_os: os,
            last_visited_screen: '/(tabs)/history',
          },
          timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
        });
        surveysCount++;
      }

    } else if (behaviorRoll < 0.85) {
      // ==========================================
      // LUỒNG B: Nạp tiền ví & Kiểm tra điểm yêu thích (25% người dùng)
      // ==========================================
      
      relativeTimeMs += randomRange(1000, 2000);

      // 1. Vào màn hình cá nhân
      events.push({
        name: 'screen_view',
        params: { screen_name: '/(tabs)/profile', device_os: os, engagement_time_msec: 2500 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(3000, 6000);

      // 2. Vào Ví tiền
      events.push({
        name: 'screen_view',
        params: { screen_name: '/wallet', device_os: os, engagement_time_msec: 3000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(3000, 6000);

      // 3. Tiến hành nạp tiền
      events.push({
        name: 'screen_view',
        params: { screen_name: '/wallet/top-up', device_os: os, engagement_time_msec: 8000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(8000, 15000);

      const topupAmount = randomRange(5, 20) * 10000;
      events.push({
        name: 'top_up_success',
        params: { amount: topupAmount, device_os: os },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(5000, 10000);

      // 4. Xem bãi đỗ yêu thích
      events.push({
        name: 'screen_view',
        params: { screen_name: '/(tabs)/saved', device_os: os, engagement_time_msec: 4000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });

    } else {
      // ==========================================
      // LUỒNG C: Lỗi Thanh toán/Nạp tiền -> Đánh giá thấp (15% người dùng)
      // ==========================================
      
      relativeTimeMs += randomRange(1000, 2000);

      // 1. Vào Detail -> Booking
      events.push({
        name: 'screen_view',
        params: { screen_name: `/parking/${parking.id}`, device_os: os, engagement_time_msec: 3000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(4000, 8000);

      events.push({
        name: 'screen_view',
        params: { screen_name: '/payment/checkout', device_os: os, engagement_time_msec: 5000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(5000, 8000);

      // 2. Gặp lỗi thanh toán
      events.push({
        name: 'payment_failed',
        params: { parking_id: parking.id, error_message: 'Ví không đủ số dư', device_os: os },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(8000, 15000);

      // 3. Tắt màn hình hoặc vào thẳng History để hủy/xem trạng thái
      events.push({
        name: 'screen_view',
        params: { screen_name: '/(tabs)/history', device_os: os, engagement_time_msec: 6000 },
        timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
      });
      relativeTimeMs += randomRange(6000, 12000);

      // 4. Hiện khảo sát & Nhập đánh giá xấu (50% người dùng lỗi sẽ đánh giá tệ)
      if (Math.random() < 0.50) {
        events.push({
          name: 'survey_modal_opened',
          params: { device_os: os },
          timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
        });
        relativeTimeMs += randomRange(15000, 30000);

        const rating = randomRange(1, 2);
        events.push({
          name: 'submit_survey',
          params: {
            overall_rating: rating,
            usability_rating: randomRange(1, 3),
            booking_rating: randomRange(1, 2),
            ui_rating: randomRange(2, 3),
            has_comment: true,
            comment_text: randomElement(FEEDBACKS_NEGATIVE),
            session_duration: Math.round(relativeTimeMs / 1000),
            device_os: os,
            last_visited_screen: '/payment/checkout',
          },
          timestamp_micros: (sessionStartTimeMs + relativeTimeMs) * 1000,
        });
        surveysCount++;
      }
    }

    // Xác định Endpoint và Key dựa trên thiết bị iOS / Android
    const url = os === 'ios'
      ? `https://www.google-analytics.com/mp/collect?firebase_app_id=${IOS_APP_ID}&api_secret=${IOS_SECRET}`
      : `https://www.google-analytics.com/mp/collect?firebase_app_id=${ANDROID_APP_ID}&api_secret=${ANDROID_SECRET}`;

    // Map event parameters to GA4 standards dynamically
    const mappedEvents = events.map(evt => {
      if (evt.name === 'screen_view' && evt.params.screen_name) {
        const screen = evt.params.screen_name;
        let screenClass = 'Screen';
        if (screen === '/') screenClass = 'HomeScreen';
        else if (screen.startsWith('/parking/')) screenClass = 'ParkingDetailScreen';
        else if (screen.startsWith('/booking/')) screenClass = 'BookingScreen';
        else if (screen === '/payment/checkout') screenClass = 'CheckoutScreen';
        else if (screen === '/payment/success') screenClass = 'PaymentSuccessScreen';
        else if (screen === '/(tabs)/history') screenClass = 'HistoryScreen';
        else if (screen === '/(tabs)/profile') screenClass = 'ProfileScreen';
        else if (screen === '/wallet') screenClass = 'WalletScreen';
        else if (screen === '/wallet/top-up') screenClass = 'TopUpScreen';
        else if (screen === '/(tabs)/saved') screenClass = 'SavedScreen';
        
        evt.params.firebase_screen = screen;
        evt.params.firebase_screen_class = screenClass;
        delete evt.params.screen_name;
      }
      return evt;
    });

    const generateAppInstanceId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const payload = {
      app_instance_id: generateAppInstanceId(),
      events: mappedEvents,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Gửi session thứ ${i + 1} thất bại (HTTP ${response.status}): ${errorText}`);
      } else {
        successCount++;
        if (successCount % 40 === 0) {
          console.log(`  Đã gửi thành công: ${successCount}/${totalSessions} sessions...`);
        }
      }
    } catch (err: any) {
      console.error(`❌ Gửi session thứ ${i + 1} thất bại:`, err.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  console.log(`\n🎉 HOÀN THÀNH: Đã bắn thành công ${successCount}/${totalSessions} phiên người dùng lên Firebase Analytics!`);
  console.log(`📊 Tổng số khảo sát đã được ghi nhận: ${surveysCount} lượt.`);
}

function REAL_PARKINGS_WITH_ID() {
  return [
    { id: 'a51403f2-a564-427f-9a2d-52e1135b74a0', name: 'Bãi xe Vincom Center Đồng Khởi' },
    { id: 'a51403f2-a564-427f-9a2d-52e1135b74a1', name: 'Bãi xe Bitexco Financial Tower' },
    { id: 'a51403f2-a564-427f-9a2d-52e1135b74a2', name: 'Bãi xe Saigon Centre' },
    { id: 'a51403f2-a564-427f-9a2d-52e1135b74a3', name: 'Bãi xe Lotte Mart Quận 7' },
    { id: 'a51403f2-a564-427f-9a2d-52e1135b74a4', name: 'Bãi xe Landmark 81' },
  ];
}

run().catch(console.error);
