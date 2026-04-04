import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import LearnPage from "./pages/LearnPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Lazy-loaded authenticated pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProjectListPage = lazy(() => import("./pages/ProjectListPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const IntakeFormPage = lazy(() => import("./pages/IntakeFormPage"));

// Lazy-loaded admin pages
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminClientsPage = lazy(() => import("./pages/AdminClientsPage"));
const AdminProjectsPage = lazy(() => import("./pages/AdminProjectsPage"));
const AdminInvoicesPage = lazy(() => import("./pages/AdminInvoicesPage"));

function LoadingFallback() {
  return (
    <div className="auth-guard-loading" role="status" aria-label="Loading page">
      <div className="auth-guard-spinner" />
      <p>Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected client routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="intake/:tierId" element={<IntakeFormPage />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboardPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <AdminGuard>
                <AdminClientsPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <AdminGuard>
                <AdminProjectsPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <AdminGuard>
                <AdminInvoicesPage />
              </AdminGuard>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
