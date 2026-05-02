import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import { validateEnv } from "./lib/envValidation";
import HomePage from "./pages/HomePage";
import PackagesPage from "./pages/PackagesPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import LearnPage from "./pages/LearnPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import BasicAuthGate from "./components/BasicAuthGate";
import AgentLayout from "./components/agents/AgentLayout";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Lazy-loaded public pages
const PackageDetailPage = lazy(() => import("./pages/PackageDetailPage"));

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

// Lazy-loaded agent pages
const AgentChatPage = lazy(() => import("./pages/AgentChatPage"));
const AgentRegistryPage = lazy(() => import("./pages/AgentRegistryPage"));
const ArtifactBrowserPage = lazy(() => import("./pages/ArtifactBrowserPage"));

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

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

export default function App() {
  const location = useLocation();

  useEffect(() => {
    validateEnv();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Group dashboard and packages routes under one key so layout doesn't remount on sub-navigation
  const animationKey = location.pathname.startsWith("/dashboard")
    ? "/dashboard"
    : location.pathname.startsWith("/admin")
      ? "/admin"
      : location.pathname.startsWith("/packages")
        ? "/packages"
        : location.pathname.startsWith("/agents")
          ? "/agents"
          : location.pathname;

  const isAgentRoute = location.pathname.startsWith("/agents");

  return (
    <ThemeProvider>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      {!isAgentRoute && <Navbar />}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={animationKey}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
              id="main-content"
            >
              <Routes location={location}>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/packages/:slug" element={<PackageDetailPage />} />
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

                {/* Agent console — own layout, no site Navbar/Footer */}
                <Route
                  path="/agents"
                  element={
                    <BasicAuthGate>
                      <AgentLayout />
                    </BasicAuthGate>
                  }
                >
                  <Route index element={<AgentChatPage />} />
                  <Route path="registry" element={<AgentRegistryPage />} />
                  <Route path="artifacts" element={<ArtifactBrowserPage />} />
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
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      {!isAgentRoute && <Footer />}
    </ThemeProvider>
  );
}
