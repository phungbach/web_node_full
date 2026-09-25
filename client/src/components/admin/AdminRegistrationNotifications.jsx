import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const SOUND_PREF_KEY = 'admin_registration_notification_sound';

function loadSoundPreference() {
  try {
    const stored = localStorage.getItem(SOUND_PREF_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    if (context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.0001;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    oscillator.start(now);
    oscillator.stop(now + 0.24);

    oscillator.onended = () => {
      context.close().catch(() => {});
    };
  } catch {
    // silent fallback
  }
}

function AdminRegistrationNotifications() {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(loadSoundPreference);
  const previousUnprocessedRef = useRef(null);
  const dismissedCountRef = useRef(0);
  const mountedRef = useRef(true);

  const shouldPlaySound = (currentUnprocessed, previousUnprocessed, shouldOpenOnIncrease) => {
    if (!soundEnabled || currentUnprocessed <= 0) return false;
    if (previousUnprocessed === null) return true;
    if (currentUnprocessed > previousUnprocessed) return true;
    return shouldOpenOnIncrease && currentUnprocessed > dismissedCountRef.current;
  };

  const fetchStats = async (shouldOpenOnIncrease = false) => {
    try {
      const response = await api.get('/analytics/overview');
      const nextStats = response.data.data;
      if (!mountedRef.current) return;

      setStats(nextStats);

      const currentUnprocessed = Number(nextStats?.unprocessedCount || 0);
      const previousUnprocessed = previousUnprocessedRef.current;
      const shouldShow = currentUnprocessed > 0 && (
        previousUnprocessed === null ||
        currentUnprocessed > previousUnprocessed ||
        (shouldOpenOnIncrease && currentUnprocessed > dismissedCountRef.current)
      );

      previousUnprocessedRef.current = currentUnprocessed;

      if (shouldShow) {
        dismissedCountRef.current = currentUnprocessed;
        setIsVisible(true);
        if (shouldPlaySound(currentUnprocessed, previousUnprocessed, shouldOpenOnIncrease)) {
          playBeep();
        }
      }
    } catch {
      // silent: avoid disruptive popup on transient errors
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchStats(false);
    const intervalId = window.setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_PREF_KEY, String(soundEnabled));
    } catch {
      // ignore persistence failures
    }
  }, [soundEnabled]);

  if (!isVisible || !stats || Number(stats.unprocessedCount || 0) <= 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-md rounded-3xl border border-blue-200 bg-white p-4 shadow-2xl sm:right-6 sm:top-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          !
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Thông báo đăng ký</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Có {Number(stats.unprocessedCount || 0)} đăng ký chưa xử lý
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {Number(stats.todayNewCount || 0) > 0
              ? `Hôm nay có ${Number(stats.todayNewCount)} đăng ký mới.`
              : 'Vui lòng kiểm tra danh sách đăng ký để xử lý kịp thời.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/admin/registrations"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Mở danh sách đăng ký
            </Link>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>Âm báo: {soundEnabled ? 'Bật' : 'Tắt'}</span>
            <button
              type="button"
              onClick={() => setSoundEnabled((current) => !current)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {soundEnabled ? 'Tắt âm' : 'Bật âm'}
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={() => setIsVisible(false)}
          className="rounded-full px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default AdminRegistrationNotifications;
