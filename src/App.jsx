import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layouts/MainLayout';
import SellerLayout from './components/layouts/SellerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';


// --- Modern Concept: Lazy Loading (Code Splitting) ---
// This drastically reduces the initial Javascript bundle size, making the app scale better and load faster.
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));
const ArtisanOnboarding = lazy(() => import('./pages/ArtisanOnboarding'));
const ArtisanDashboard = lazy(() => import('./pages/ArtisanDashboard'));

// Admin pages
import AdminLayout from './components/layouts/AdminLayout';
const AdminVerify = lazy(() => import('./pages/admin/AdminVerify'));

// Customer pages
const Home = lazy(() => import('./pages/customer/Home'));
const Explore = lazy(() => import('./pages/customer/Explore'));
const ProductDetails = lazy(() => import('./pages/customer/ProductDetails'));
const ArtisanProfile = lazy(() => import('./pages/customer/ArtisanProfile'));

// Loading Spinner for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-earth-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        {/* Global Toast Notification System */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#4a7c59', secondary: '#fff' },
              style: { background: '#f0f7f2', color: '#2d4a38', border: '1px solid #d1e8da' },
            },
            error: {
              iconTheme: { primary: '#c0392b', secondary: '#fff' },
              style: { background: '#fdf2f0', color: '#7b2a20', border: '1px solid #f0c4bc' },
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/artisan/:artisanId" element={<ArtisanProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pending" element={<PendingApproval />} />
            </Route>

            {/* Dedicated Seller Portal Routes */}
            <Route path="/seller" element={<SellerLayout />}>
              {/* Onboarding doesn't require active status so unapproved can fill profiles */}
              <Route path="onboarding" element={
                <ProtectedRoute allowedRoles={['artisan']}>
                  <ArtisanOnboarding />
                </ProtectedRoute>
              } />
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['artisan']} requireActiveStatus={true}>
                  <ArtisanDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Legacy fallback path handling */}
            <Route path="/onboarding" element={<Navigate to="/seller/onboarding" />} />
            <Route path="/artisan-dashboard" element={<Navigate to="/seller/dashboard" />} />

            {/* Admin Portal Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminVerify />} />
            </Route>

          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
