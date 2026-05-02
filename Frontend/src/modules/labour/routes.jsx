import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LabourLogin from './pages/LabourLogin';
import LabourRegister from './pages/LabourRegister';
import LabourDashboard from './pages/LabourDashboard';
import LabourHistory from './pages/LabourHistory';
import LabourProfile from './pages/LabourProfile';
import LabourList from './pages/LabourList';
import BottomNav from './components/layout/BottomNav';

const LabourRoutes = () => {
  const location = useLocation();
  const hideNavRoutes = ['/labour/login', '/labour/register'];
  const shouldShowNav = !hideNavRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className={`min-h-screen bg-slate-50 ${shouldShowNav ? 'pb-24' : ''}`}>
      <Routes>
        <Route path="/" element={<Navigate to="/labour/login" replace />} />
        <Route path="/login" element={<LabourLogin />} />
        <Route path="/register" element={<LabourRegister />} />
        <Route path="/dashboard" element={<LabourDashboard />} />
        <Route path="/history" element={<LabourHistory />} />
        <Route path="/profile" element={<LabourProfile />} />
        <Route path="/list" element={<LabourList />} />
      </Routes>

      {shouldShowNav && <BottomNav />}
    </div>
  );
};

export default LabourRoutes;
