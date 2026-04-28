import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./pages/AdminSetup";
import PendingApproval from "./pages/PendingApproval";
import { RequireStaff } from "./components/admin/RequireStaff";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin/pending" element={<PendingApproval />} />
          <Route path="/admin" element={<RequireStaff><Admin /></RequireStaff>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
