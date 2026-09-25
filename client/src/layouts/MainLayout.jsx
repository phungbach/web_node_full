import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileBottomBar from '../components/layout/MobileBottomBar';

function MainLayout() {
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
