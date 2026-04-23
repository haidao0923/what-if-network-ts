import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogGrid from './components/BlogGrid';
import BlogPostDetail from './components/BlogPostDetail';
import ContactForm from './components/ContactForm';
import About from './components/About';
import ForumHome from './components/ForumHome';
import QuestionDetail from './components/QuestionDetail';
import ErrorBoundary from './components/ErrorBoundary';
import { ARTICLES } from './articles';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const Home = () => {
  // Posts reversed to show latest first
  const posts = [...ARTICLES].reverse();

  return (
    <>
      <Hero />
      <BlogGrid posts={posts} />
    </>
  );
};

const App: React.FC = () => {
  const location = useLocation();

  // Track page views on route change and scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.gtag) {
      window.gtag('config', 'G-MEASUREMENT_ID', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-dark text-light font-sans selection:bg-primary selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<BlogPostDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/forum" element={<ForumHome />} />
            <Route path="/forum/question/:id" element={<QuestionDetail />} />
            <Route path="/contact" element={<ContactForm />} />
          </Routes>
        </main>

        <footer className="bg-[#151625] text-white py-12 mt-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-serif font-bold text-xl text-primary">What If Network</span>
              <p className="text-gray-400 text-sm mt-2">Embracing the unexpected, one adventure at a time.</p>
            </div>
            <div className="flex space-x-6">
              <a
                href="https://chat.whatsapp.com/Jp1YDfHCYBm8OBpvsNFzP4?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/whatifnetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@what.if.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-primary transition-colors"
              >
                <Youtube className="w-5 h-5 mr-2" />
                YouTube
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;