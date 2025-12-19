import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onReadStories: () => void;
}

const Hero: React.FC<HeroProps> = ({ onReadStories }) => {
  return (
    <div className="relative overflow-hidden bg-dark pt-16 pb-4 sm:pt-24 sm:pb-8">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        
        {/* WIN Header */}
        <h1 className="flex flex-col items-start font-black text-6xl sm:text-7xl md:text-8xl leading-[0.9] transform hover:scale-105 transition-transform duration-300 ease-in-out mb-8 select-none text-[#e0e0e0]">
          <span className="tracking-tight">
            <span 
              className="bg-gradient-to-r from-[#FFA500] to-[#FF6347] bg-clip-text text-transparent"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)' }}
            >
              W
            </span>hat
          </span>
          <span className="ml-8 tracking-tight">
            <span 
              className="bg-gradient-to-r from-[#FFA500] to-[#FF6347] bg-clip-text text-transparent"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)' }}
            >
              I
            </span>f
          </span>
          <span className="ml-3 tracking-tight">
            <span 
              className="bg-gradient-to-r from-[#FFA500] to-[#FF6347] bg-clip-text text-transparent"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)' }}
            >
              N
            </span>etwork
          </span>
        </h1>
        
        <p className="mt-2 max-w-2xl mx-auto text-xl text-yellow-600 font-sans">
          A collection of experiments, misadventures, and discoveries made when I stopped saying "no" and started asking "what if?".
        </p>
        
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={onReadStories}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-yellow-700 transition-all shadow-lg shadow-yellow-900/20 hover:-translate-y-1"
          >
            Start Reading
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;