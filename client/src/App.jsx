import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// COMPONENTS
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import ChatBotButton from "@/components/ChatBotButton";
import { Toaster } from "sonner";

// PAGES
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import GitHubInsights from "@/pages/GitHubInsights";
import CompareUsers from "@/pages/CompareUsers";
import RepositoryDeepDive from "@/pages/RepositoryDeepDive";
import AuthCallback from "@/pages/AuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ContactUs from "@/pages/ContactUs";
import ReviewSession from "@/pages/ReviewSession";
import Challenges from "@/pages/Challenges";

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
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<GitHubInsights />} />
          <Route path="/stats/:username" element={<GitHubInsights />} />
          <Route path="/compare" element={<CompareUsers />} />
          <Route path="/compare/:user1/:user2" element={<CompareUsers />} />
          <Route path="/repo" element={<RepositoryDeepDive />} />
          <Route path="/repo/:owner/:repo" element={<RepositoryDeepDive />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/review/:sessionId" element={<ReviewSession />} />
          <Route path="/challenges" element={<Challenges />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
