import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ptitTheme } from './theme/ptitTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SLinkLayout } from './layouts/SLinkLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { OutlinesPage } from './pages/OutlinesPage';
import { ProgressPage } from './pages/ProgressPage';
import { AcceptancePage } from './pages/AcceptancePage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AwardsPage } from './pages/AwardsPage';
import { PeriodsPage } from './pages/PeriodsPage';
import { FormsPage } from './pages/FormsPage';
import { RegulationsPage } from './pages/RegulationsPage';
import { SchedulePage } from './pages/SchedulePage';
import { GwduViewerPage } from './pages/GwduViewerPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <SLinkLayout>{children}</SLinkLayout>;
};

export const App: React.FC = () => {
  return (
    <ConfigProvider theme={ptitTheme} locale={viVN}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/outlines"
              element={
                <ProtectedRoute>
                  <OutlinesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/acceptance"
              element={
                <ProtectedRoute>
                  <AcceptancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <BudgetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/awards"
              element={
                <ProtectedRoute>
                  <AwardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/periods"
              element={
                <ProtectedRoute>
                  <PeriodsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <ProtectedRoute>
                  <FormsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/regulations"
              element={
                <ProtectedRoute>
                  <RegulationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gwdu"
              element={
                <ProtectedRoute>
                  <GwduViewerPage />
                </ProtectedRoute>
              }
            />
            {/* Cổng tra cứu xác thực Giấy chứng nhận số NCKH điện tử (Công khai cho camera điện thoại quét) */}
            <Route path="/verify-cert" element={<VerifyCertificatePage />} />
            <Route path="/gwdu/verify-cert" element={<VerifyCertificatePage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
