'use strict'

let fetch
try {
  fetch = require('node-fetch')
} catch {
  fetch = null
}

const TOKEN = process.env.LINE_NOTIFY_TOKEN

let lastAlertTime = 0
const COOLDOWN_MS = 5 * 60 * 1000  // แจ้งเตือนซ้ำได้อีกครั้งหลัง 5 นาที

/**
 * ส่งข้อความแจ้งเตือนไปยัง LINE Notify
 * @param {string} message
 */
async function sendLine(message) {
  if (!TOKEN || !fetch) return

  const now = Date.now()
  if (now - lastAlertTime < COOLDOWN_MS) return
  lastAlertTime = now

  try {
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`,
    })
    if (res.ok) {
      console.log('[LINE Notify] ✅ ส่งแจ้งเตือนสำเร็จ')
    } else {
      console.warn('[LINE Notify] ⚠️ ส่งไม่สำเร็จ:', res.status)
    }
  } catch (err) {
    console.error('[LINE Notify] ❌ Error:', err.message)
  }
}

/**
 * แจ้งเตือนเมื่ออุณหภูมิเกิน threshold
 * @param {number} temp - อุณหภูมิปัจจุบัน
 * @param {number} threshold - เกณฑ์ (default 70°C)
 */
function checkAndNotify(temp, threshold = 70) {
  if (!TOKEN) return
  if (temp > threshold) {
    sendLine(
      `\n🔥 แจ้งเตือน: อุณหภูมิสูงเกินกำหนด!\n` +
      `อุณหภูมิปัจจุบัน: ${temp.toFixed(1)}°C\n` +
      `เกณฑ์ที่ตั้งไว้: ${threshold}°C\n` +
      `เวลา: ${new Date().toLocaleString('th-TH')}`
    )
  }
}

module.exports = { checkAndNotify }
