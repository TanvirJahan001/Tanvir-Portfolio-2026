'use client';
import { useEffect, useState } from 'react';
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
export default function LocalTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(timeFormat.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 15000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="location">
      <i aria-hidden="true" />
      Rajshahi, BD <span className="time">{time || 'UTC+6'}</span>
    </span>
  );
}
