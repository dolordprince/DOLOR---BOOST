import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#00c9a7]/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {children}
      </main>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00c9a7]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00c9a7]/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
