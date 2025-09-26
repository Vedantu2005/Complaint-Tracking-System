import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
// Pages
import LandingPage from "./pages/LandingPage";
import SubmitComplaint from "./pages/SubmitComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintDetails from "./pages/ComplaintDetails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
 import TrafficDashboard from "./pages/TrafficDashboard"; 
import CyberCrimeDashboard from "./pages/CybercrimeDashboard";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* 👇 THIS IS THE LINE YOU NEED TO ADD THE 'future' PROP TO */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public-facing routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/my/:id" element={<TrackComplaint />} />

          {/* Main admin dashboard */}
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* Specific route for the Traffic department */}
          { <Route path="/dashboard/traffic" element={<TrafficDashboard />} /> }
          <Route path="/dashboard/cybercrime" element={<CyberCrimeDashboard />} />

          {/* Route for viewing a single complaint's details */}
          <Route path="/dashboard/complaint/:id" element={<ComplaintDetails />} />

          {/* Other application routes */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all route for any undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
