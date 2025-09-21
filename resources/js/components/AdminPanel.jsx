import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserStateManagement from './ACL/UserStateManagement';
import RoleManagement from './pages/RoleManagement';
import PermissionManagement from './pages/PermissionManagement';
import PromoterManagement from './ACL/PromoterManagement';
import PromoterCreate from './pages/PromoterCreate';
import PromoterEdit from './pages/PromoterEdit';
import PromoterView from './pages/PromoterView';
import PromoterImport from './pages/PromoterImport';
import RoutePlanManagement from './ACL/RoutePlanManagement';
import RoutePlanEdit from './pages/RoutePlanEdit';
import RoutePlanDetails from './pages/RoutePlanDetails';
import RoutePlanImport from './pages/RoutePlanImport';
import RoutePlanImportTest from './pages/RoutePlanImportTest';
import RoutePlanImportMinimal from './pages/RoutePlanImportMinimal';
import AllActivity from './pages/AllActivity';
import ApprovedActivity from './pages/ApprovedActivity';
import PendingActivity from './pages/PendingActivity';
import RejectedActivity from './pages/RejectedActivity';
import ActivityRecceCreate from './pages/ActivityRecceCreate';
import ActivityRecceEdit from './pages/ActivityRecceEdit';
import ActivityRecceView from './pages/ActivityRecceView';
import ActivityRecceImport from './pages/ActivityRecceImport';
import FeedbackApp from './pages/FeedbackApp';
import PhotoGallery from './pages/PhotoGallery';
import PromoterActivityDashboard from './pages/PromoterActivityDashboard';
import PromoterActivityDetails from './pages/PromoterActivityDetails';
import Settings from './pages/Settings';
import Login from './auth/Login';
import Register from './auth/Register';
import ProtectedRoute from './auth/ProtectedRoute';
import Material3Showcase from './examples/Material3Showcase';
import { cn } from '../lib/utils';

const AdminPanelContent = () => {
  const { isCollapsed } = useSidebar();
  const { isAuthenticated, loading } = useAuth();

  console.log('AdminPanelContent: isAuthenticated:', isAuthenticated, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, only show login/register routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, show protected routes
  return (
    <Routes>
      {/* Redirect authenticated users away from login/register */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes with layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredPermission="dashboard.view">
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports Routes */}
      <Route
        path="/reports/all-activity"
        element={
          <ProtectedRoute requiredPermission="activity_recces.view">
            <AppLayout>
              <AllActivity />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/pending-activity"
        element={
          <ProtectedRoute requiredPermission="activity_recces.view">
            <AppLayout>
              <PendingActivity />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/approved-activity"
        element={
          <ProtectedRoute requiredPermission="activity_recces.view">
            <AppLayout>
              <ApprovedActivity />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/rejected-activity"
        element={
          <ProtectedRoute requiredPermission="activity_recces.view">
            <AppLayout>
              <RejectedActivity />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Activity Management Routes */}
      <Route
        path="/admin/activities"
        element={
          <ProtectedRoute requiredPermission="activity_recces.view">
            <AppLayout>
              <AllActivity />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activities/create"
        element={
          <ProtectedRoute requiredPermission="activity_recces.create">
            <AppLayout>
              <ActivityRecceCreate />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activities/edit/:id"
        element={
          <ProtectedRoute requiredPermission="activity_recces.update">
            <AppLayout>
              <ActivityRecceEdit />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activities/view/:id"
        element={
          <ProtectedRoute requiredPermission="activity_recces.view">
            <AppLayout>
              <ActivityRecceView />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activities/import"
        element={
          <ProtectedRoute requiredPermission="activity_recces.create">
            <AppLayout>
              <ActivityRecceImport />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Feedback Management Routes */}
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FeedbackApp />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Photo Gallery Routes */}
      <Route
        path="/photos/gallery"
        element={
          <ProtectedRoute requiredPermission="photos.view">
            <AppLayout>
              <PhotoGallery />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/route-plan"
        element={
          <ProtectedRoute requiredPermission="route_plans.view">
            <AppLayout>
              <RoutePlanManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-plans/new"
        element={
          <ProtectedRoute requiredPermission="route_plans.create">
            <AppLayout>
              <RoutePlanEdit />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-plans/:id"
        element={
          <ProtectedRoute requiredPermission="route_plans.view">
            <AppLayout>
              <RoutePlanDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-plans/:id/edit"
        element={
          <ProtectedRoute requiredPermission="route_plans.update">
            <AppLayout>
              <RoutePlanEdit />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-plans/import"
        element={
          <ProtectedRoute requiredPermission="route_plans.import">
            <AppLayout>
              <RoutePlanImport />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Photos Routes */}
      <Route
        path="/photos/gallery"
        element={
          <ProtectedRoute requiredPermission="photos.view">
            <AppLayout>
              <PhotoGallery />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* User Management Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermission="users.view">
            <AppLayout>
              <UserManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* User State Management Routes */}
      <Route
        path="/acl/user-states"
        element={
          <ProtectedRoute requiredPermission="users.view">
            <AppLayout>
              <UserStateManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Promoter Management Routes */}
      <Route
        path="/promoters"
        element={
          <ProtectedRoute requiredPermission="promoters.view">
            <AppLayout>
              <PromoterManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/acl/promoters"
        element={
          <ProtectedRoute requiredPermission="promoters.view">
            <AppLayout>
              <PromoterManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/acl/promoters/create"
        element={
          <ProtectedRoute requiredPermission="promoters.create">
            <AppLayout>
              <PromoterCreate />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/acl/promoters/:id/edit"
        element={
          <ProtectedRoute requiredPermission="promoters.update">
            <AppLayout>
              <PromoterEdit />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/acl/promoters/:id/view"
        element={
          <ProtectedRoute requiredPermission="promoters.view">
            <AppLayout>
              <PromoterView />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/acl/promoters/import"
        element={
          <ProtectedRoute requiredPermission="promoters.import">
            <AppLayout>
              <PromoterImport />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Promoter Activity Dashboard */}
      <Route
        path="/admin/promoter-activity"
        element={
          <ProtectedRoute requiredPermission="promoters.view">
            <AppLayout>
              <PromoterActivityDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Promoter Activity Details */}
      <Route
        path="/admin/promoter-activity/:id"
        element={
          <ProtectedRoute requiredPermission="promoters.view">
            <AppLayout>
              <PromoterActivityDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Role & Permission Management Routes */}
      <Route
        path="/roles"
        element={
          <ProtectedRoute requiredPermission="roles.view">
            <AppLayout>
              <RoleManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/permissions"
        element={
          <ProtectedRoute requiredPermission="permissions.view">
            <AppLayout>
              <PermissionManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings Route */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredPermission="settings.view" requiredRole="super_admin">
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Material 3 Showcase Route */}
      <Route
        path="/material3-showcase"
        element={
          <Material3Showcase />
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Layout component for authenticated pages
const AppLayout = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 overflow-hidden bg-background",
        "lg:ml-64", // Default sidebar width for desktop
        isCollapsed && "lg:ml-16" // Collapsed sidebar width for desktop
      )}>
        <Header />
        <main className="flex-1 overflow-auto bg-background relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AdminPanelContent />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
};

export default AdminPanel;
