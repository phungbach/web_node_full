import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminRegistrationNotifications from '../components/admin/AdminRegistrationNotifications';

function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-800">
      <AdminRegistrationNotifications />
      <div className="flex min-h-screen">
        <AdminSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminHeader isMobileMenuOpen={isMobileMenuOpen} onMenuToggle={() => setIsMobileMenuOpen((current) => !current)} />

          <main className="min-w-0 flex-1 p-3 sm:p-6 lg:p-8">
            <div className="w-full min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
