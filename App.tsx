import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogGrid from './components/BlogGrid';
import BlogPostDetail from './components/BlogPostDetail';
import ContactForm from './components/ContactForm';
import { ARTICLES } from './articles';

const Home = () => {
  // Posts reversed to show latest first
  const posts = [...ARTICLES].reverse();

  const handleReadStories = () => {
    const gridElement = document.getElementById('blog-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Hero onReadStories={handleReadStories} />
      <BlogGrid posts={posts} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark text-light font-sans selection:bg-primary selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<BlogPostDetail />} />
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
            <a href="https://www.instagram.com/whatifnetwork" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">Instagram</a>
            <a href="https://www.youtube.com/@what.if.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;