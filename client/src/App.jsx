import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Home from './pages/Home/Home';
import DrivingCar from './pages/DrivingCar/DrivingCar';
import DrivingMotorbike from './pages/DrivingMotorbike/DrivingMotorbike';
import Blog from './pages/Blog/Blog';
import BlogDetail from './pages/BlogDetail/BlogDetail';
import FAQ from './pages/FAQ/FAQ';
import Contact from './pages/Contact/Contact';
import Register from './pages/Register/Register';
import DashboardPage from './pages/Admin/DashboardPage';
import RegistrationsPage from './pages/Admin/RegistrationsPage';
import AdminAccountPage from './pages/Admin/AdminAccountPage';
import PostsPage from './pages/Admin/PostsPage';
import CategoriesPage from './pages/Admin/CategoriesPage';
import MediaPage from './pages/Admin/MediaPage';
import SEOPage from './pages/Admin/SEOPage';
import SettingsPage from './pages/Admin/SettingsPage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import NotFound from './pages/NotFound/NotFound';

function AdminRoutes() {
  return (
    <>
      <Route path='/admin/login' element={<AdminLoginPage />} />
      <Route path='/admin' element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path='registrations' element={<RegistrationsPage />} />
        <Route path='account' element={<AdminAccountPage />} />
        <Route path='posts' element={<PostsPage />} />
        <Route path='categories' element={<CategoriesPage />} />
        <Route path='media' element={<MediaPage />} />
        <Route path='seo' element={<SEOPage />} />
        <Route path='analytics' element={<Navigate to='/admin' replace />} />
        <Route path='settings' element={<SettingsPage />} />
      </Route>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hoc-lai-xe-o-to" element={<DrivingCar />} />
        <Route path="/hoc-lai-xe-may" element={<DrivingMotorbike />} />
        <Route path="/kinh-nghiem" element={<Blog />} />
        <Route path="/kinh-nghiem/:slug" element={<BlogDetail />} />
        <Route path="/cau-hoi" element={<FAQ />} />
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>

      {AdminRoutes()}
    </Routes>
  );
}

export default App;
