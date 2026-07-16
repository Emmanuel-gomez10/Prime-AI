import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MainWorkspace } from './MainWorkspace';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#05050A] text-primary-text flex overflow-hidden font-sans selection:bg-primary/30">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm"
          onClick={() => { setIsSidebarOpen(false); }}
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Subtle background glow for workspace */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-hidden relative">
           <MainWorkspace />
        </main>
      </div>


    </div>
  );
};
