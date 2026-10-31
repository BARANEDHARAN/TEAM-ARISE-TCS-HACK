import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Three-Portal Platform Pages
import { PortalLoginPage } from './pages/portal/PortalLoginPage';

// Portal 1: Claimant / Customer
import { ClaimantDashboardPage } from './pages/portal/ClaimantDashboardPage';
import { ClaimantNewClaimPage } from './pages/portal/ClaimantNewClaimPage';
import { ClaimantClaimDetailPage } from './pages/portal/ClaimantClaimDetailPage';

// Portal 2: AI Insurance Investigator
import { AiInvestigatorDashboardPage } from './pages/portal/AiInvestigatorDashboardPage';
import { AiInvestigationWorkspacePage } from './pages/portal/AiInvestigationWorkspacePage';

// Portal 3: Human Insurance Investigator
import { HumanInvestigatorDashboardPage } from './pages/portal/HumanInvestigatorDashboardPage';
import { HumanReviewWorkspacePage } from './pages/portal/HumanReviewWorkspacePage';

// Focused Flow (Available for Direct Testing)
import { HomePage } from './pages/focused/HomePage';
import { NewInvestigationPage } from './pages/focused/NewInvestigationPage';
import { EvidenceUploadPage } from './pages/focused/EvidenceUploadPage';
import { ImageAnalysisPage } from './pages/focused/ImageAnalysisPage';
import { OCRResultsPage } from './pages/focused/OCRResultsPage';
import { InvestigationResultsPage } from './pages/focused/InvestigationResultsPage';
import { InvestigationHistoryPage } from './pages/focused/InvestigationHistoryPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main 3-Portal Login & Selector Gateway */}
          <Route path="/" element={<PortalLoginPage />} />
          <Route path="/login" element={<PortalLoginPage />} />

          {/* ======================================================== */}
          {/* LOGIN 1: CLAIMANT / CUSTOMER PORTAL */}
          {/* ======================================================== */}
          <Route path="/claimant/dashboard" element={<ClaimantDashboardPage />} />
          <Route path="/claimant/new-claim" element={<ClaimantNewClaimPage />} />
          <Route path="/claimant/claim/:claimId" element={<ClaimantClaimDetailPage />} />

          {/* ======================================================== */}
          {/* LOGIN 2: AI INSURANCE INVESTIGATOR PORTAL */}
          {/* ======================================================== */}
          <Route path="/ai-investigator/dashboard" element={<AiInvestigatorDashboardPage />} />
          <Route path="/ai-investigator/claim/:claimId" element={<AiInvestigationWorkspacePage />} />

          {/* ======================================================== */}
          {/* LOGIN 3: HUMAN INSURANCE INVESTIGATOR PORTAL */}
          {/* ======================================================== */}
          <Route path="/human-investigator/dashboard" element={<HumanInvestigatorDashboardPage />} />
          <Route path="/human-investigator/claim/:claimId" element={<HumanReviewWorkspacePage />} />

          {/* Focused Direct Testing Routes */}
          <Route path="/focused" element={<HomePage />} />
          <Route path="/new-investigation" element={<NewInvestigationPage />} />
          <Route path="/investigation/:accidentId/upload" element={<EvidenceUploadPage />} />
          <Route path="/investigation/:accidentId/image-analysis" element={<ImageAnalysisPage />} />
          <Route path="/investigation/:accidentId/ocr" element={<OCRResultsPage />} />
          <Route path="/investigation/:accidentId/results" element={<InvestigationResultsPage />} />
          <Route path="/history" element={<InvestigationHistoryPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
