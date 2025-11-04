import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// COMPONENTS
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import ChatBotButton from "@/components/ChatBotButton";
import { Toaster } from "sonner";
import { ChatbotProvider } from "@/context/ChatbotContext";

// PAGES

import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import GitHubInsights from "@/pages/GitHubInsights";
import CompareUsers from "@/pages/CompareUsers";
import RepositoryDeepDive from "@/pages/RepositoryDeepDive";
import AuthCallback from "@/pages/AuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ContactUs from "@/pages/ContactUs";
import Leaderboard from "@/pages/Leaderboard";
import WidgetGenerator from "@/pages/WidgetGenerator";
import UserProfile from "@/pages/UserProfile";
import ChallengesPage from "@/pages/ChallengesPage";
import AchievementsPage from "@/pages/AchievementsPage";

const hiddenLayoutRoutes = ["/login", "/signup", "/dashboard", "/auth/callback"];

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = hiddenLayoutRoutes.includes(location.pathname);

  const noPaddingRoutes = [];
  const addPadding = !hideLayout && !noPaddingRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {!hideLayout && <Navbar />}
      <main className={`flex-1 ${addPadding ? "pt-24" : ""}`}>{children}</main>
      {!hideLayout && <Footer />}
      {!hideLayout && <ChatBotButton />}
    </div>
  );
};

function App() {
  return (
    <ChatbotProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<GitHubInsights />} />
            <Route path="/stats/:username" element={<GitHubInsights />} />
            <Route path="/compare" element={<CompareUsers />} />
            <Route path="/compare/:user1/:user2" element={<CompareUsers />} />
            <Route path="/repo" element={<RepositoryDeepDive />} />
            <Route path="/repo/:owner/:repo" element={<RepositoryDeepDive />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/widgets" element={<WidgetGenerator />} />
            <Route path="/user-profile/:id" element={<UserProfile />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
          <SpeedInsights />
          <Analytics />
        </Layout>
      </Router>
    </ChatbotProvider>
  );
}

export default App;
