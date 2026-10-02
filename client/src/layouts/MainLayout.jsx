import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileBottomBar from '../components/layout/MobileBottomBar';
import api from '../services/api';

function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const storageKey = 'manual_analytics_visitor';
    let visitorId = localStorage.getItem(storageKey);
    if (!visitorId) {
      visitorId = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(storageKey, visitorId);
    }
    api.post('/analytics/visitor', { visitorId, path: location.pathname }).catch(() => {});
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}

export default MainLayout;
