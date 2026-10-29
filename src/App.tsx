/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default";
import AuthCallback from "./pages/auth/Callback";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./pages/app/layout";
import DashboardPage from "./pages/app/dashboard/page";
import RhkPage from "./pages/app/rhk/page";
import DrivePage from "./pages/app/drive/page";
import DriveCallbackPage from "./pages/app/drive/callback/page";
import LaporanPage from "./pages/app/laporan/page";
import RekapPage from "./pages/app/rekap/page";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="rhk" element={<RhkPage />} />
            <Route path="drive" element={<DrivePage />} />
            <Route path="drive/callback" element={<DriveCallbackPage />} />
            <Route path="laporan" element={<LaporanPage />} />
            <Route path="rekap" element={<RekapPage />} />
          </Route>
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
