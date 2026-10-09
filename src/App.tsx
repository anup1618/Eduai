import React, { useState } from 'react';
import { CampusDataProvider, useCampusData } from './context/CampusDataContext';
import { Sidebar, NavigationPage } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';

// Admin Portal Pages
import { OverviewPage } from './pages/OverviewPage';
import { StudentIntelligencePage } from './pages/StudentIntelligencePage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { StudentSegmentsPage } from './pages/StudentSegmentsPage';
import { InterventionCentrePage } from './pages/InterventionCentrePage';
import { DataIntegrationPage } from './pages/DataIntegrationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  AdminUsersPage,
  AdminDepartmentsPage,
  AdminAssignmentsPage,
  AdminPermissionsPage,
} from './pages/AdminSupplementalPages';

// Global Overlays
import { StudentDrawer } from './components/student/StudentDrawer';
import { CampusAnalystModal } from './components/analyst/CampusAnalystModal';

// Entry & Other Portals
import { LoginPage } from './pages/LoginPage';
import { FacultyPortal } from './pages/FacultyPortal';
import { StudentShell, StudentPage } from './components/portal/StudentShell';
import {
  StudentDashboardPage,
  StudentAnalyticsPage,
  StudentPerformancePage,
} from './pages/student/StudentAcademicPages';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentProgressTrackerPage } from './pages/student/StudentProgressTrackerPage';
import {
  StudentMyProblemPage,
  StudentProfilePage,
  StudentSettingsPage,
} from './pages/student/StudentMiscPages';
import { PortalRole } from './data/portalData';

// ─── ADMIN PORTAL CONTENT ─────────────────────────────────────────────────────

const AdminPortalContent: React.FC<{ onSwitchPortal: () => void }> = ({ onSwitchPortal }) => {
  const { selectedStudent, setSelectedStudent } = useCampusData();

  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAnalystOpen, setIsAnalystOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'student-intelligence':
        return <StudentIntelligencePage />;
      case 'risk-analysis':
        return <RiskAnalysisPage />;
      case 'student-segments':
        return <StudentSegmentsPage />;
      case 'intervention-centre':
        return <InterventionCentrePage />;
      case 'data-integration':
        return <DataIntegrationPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <AdminUsersPage />;
      case 'departments':
        return <AdminDepartmentsPage />;
      case 'assignments':
        return <AdminAssignmentsPage />;
      case 'permissions':
        return <AdminPermissionsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex">
      {/* Persistent Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
        onOpenAnalyst={() => setIsAnalystOpen(true)}
        onLogout={onSwitchPortal}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          currentPage={currentPage}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenAnalyst={() => setIsAnalystOpen(true)}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {/* Global Filter Bar (Collapsible) */}
        {showFilters && <FilterBar />}

        {/* Main Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Student Drawer (Global) */}
      <StudentDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* AI Campus Analyst Modal (Global) */}
      <CampusAnalystModal
        isOpen={isAnalystOpen}
        onClose={() => setIsAnalystOpen(false)}
        onNavigate={setCurrentPage}
      />
    </div>
  );
};

// ─── STUDENT PORTAL CONTENT ───────────────────────────────────────────────────

const StudentPortalContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [studentPage, setStudentPage] = useState<StudentPage>('dashboard');

  const renderStudentPage = () => {
    switch (studentPage) {
      case 'dashboard':
        return <StudentDashboardPage />;
      case 'analytics':
        return <StudentAnalyticsPage />;
      case 'performance':
        return <StudentPerformancePage />;
      case 'attendance':
        return <StudentAttendancePage />;
      case 'ai-progress':
        return <StudentProgressTrackerPage />;
      case 'my-problem':
        return <StudentMyProblemPage />;
      case 'profile':
        return <StudentProfilePage />;
      case 'settings':
        return <StudentSettingsPage />;
      default:
        return <StudentDashboardPage />;
    }
  };

  return (
    <StudentShell currentPage={studentPage} onNavigate={setStudentPage} onLogout={onLogout}>
      {renderStudentPage()}
    </StudentShell>
  );
};

// ─── MAIN APP ROUTER ──────────────────────────────────────────────────────────

export function App() {
  const [activeRole, setActiveRole] = useState<PortalRole>('login');

  return (
    <CampusDataProvider>
      {activeRole === 'login' && (
        <LoginPage onSelectRole={role => setActiveRole(role)} />
      )}

      {activeRole === 'student' && (
        <StudentPortalContent onLogout={() => setActiveRole('login')} />
      )}

      {activeRole === 'faculty' && (
        <FacultyPortal onLogout={() => setActiveRole('login')} />
      )}

      {activeRole === 'admin' && (
        <AdminPortalContent onSwitchPortal={() => setActiveRole('login')} />
      )}
    </CampusDataProvider>
  );
}

export default App;
