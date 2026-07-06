import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { LinksTracking } from "./pages/LinksTracking";
import { Commissions } from "./pages/Commissions";
import { MarketingCenter } from "./pages/MarketingCenter";
import { Network } from "./pages/Network";
import { Reports } from "./pages/Reports";
import { Payouts } from "./pages/Payouts";
import { TeamManagement } from "./pages/TeamManagement";
import { Notifications } from "./pages/Notifications";
import { Support } from "./pages/Support";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/links" element={<LinksTracking />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/marketing" element={<MarketingCenter />} />
            <Route path="/network" element={<Network />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support" element={<Support />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
