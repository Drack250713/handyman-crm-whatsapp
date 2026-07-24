import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const navLinkClass = ({ isActive }) => {
    const baseClass = "flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all group overflow-hidden whitespace-nowrap";
    const activeClass = "bg-primary-container text-on-primary-container";
    const inactiveClass = "text-on-surface-variant hover:bg-surface-container-high transition-colors";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex min-h-screen">
      {/* NavigationDrawer (Sidebar) */}
      <aside 
        className={`sidebar-transition bg-surface border-r border-outline-variant flex flex-col h-full fixed left-0 top-0 z-50 ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-outline-variant overflow-hidden shrink-0">
          <span 
            className="material-symbols-outlined text-primary cursor-pointer shrink-0" 
            onClick={toggleSidebar}
          >
            menu
          </span>
          <span 
            className={`font-headline-md text-headline-md font-bold text-primary ml-4 transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'nav-label-hidden'}`}
          >
            Artisan Admin
          </span>
        </div>
        
        <div className="flex-grow py-6 flex flex-col gap-2 overflow-x-hidden">
          <NavLink to="/" end className={navLinkClass}>
            <span className="material-symbols-outlined shrink-0" data-icon="dashboard">dashboard</span>
            <span className={`font-label-md text-label-md transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'nav-label-hidden'}`}>
              Dashboard
            </span>
          </NavLink>
          
          <NavLink to="/inbox" className={navLinkClass}>
            <span className="material-symbols-outlined shrink-0" data-icon="chat_bubble">chat_bubble</span>
            <span className={`font-label-md text-label-md transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'nav-label-hidden'}`}>
              Chats
            </span>
          </NavLink>
          
          <NavLink to="/ai-settings" className={navLinkClass}>
            <span className="material-symbols-outlined shrink-0" data-icon="smart_toy">smart_toy</span>
            <span className={`font-label-md text-label-md transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'nav-label-hidden'}`}>
              AI Config
            </span>
          </NavLink>
          
          <NavLink to="/leads" className={navLinkClass}>
            <span className="material-symbols-outlined shrink-0" data-icon="group">group</span>
            <span className={`font-label-md text-label-md transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'nav-label-hidden'}`}>
              Leads
            </span>
          </NavLink>
        </div>
        
        <div className="p-4 border-t border-outline-variant flex items-center gap-4 overflow-hidden shrink-0">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
            <img 
              className="w-full h-full rounded-full object-cover" 
              alt="Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiIslBu0EHtCcOj2oybiWnC_8R2IsbCi0Yq3OBJHdomc_TWwN_ndqQkIaGAlj9ZVtoXkSWxql2MbIJRIQ3zCzSU499t51F4KozHJ96sDSzs0n4X9RGj0hvZiyhrsJXsaXtNs5jER2WIghQn8TrFHpwzBgCs-OqZev8OgR0fuP_J1XG3FbNdHR-PgUIWV0x0iKseN9gJiZcchObcyRIUIoIMwaTjMk9c5WUHln0ZD_29GrEx1fmn513dSlUDHa-X2q6m6mikTQKhSr8" 
            />
          </div>
          <div className={`overflow-hidden transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'nav-label-hidden'}`}>
            <p className="font-label-md text-on-surface truncate">Artisan Admin</p>
            <p className="text-[12px] text-on-surface-variant truncate">Lead Technician</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-grow transition-all duration-300 flex flex-col min-h-screen min-w-0 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}
      >
        {/* TopAppBar */}
        <header className="h-20 bg-surface border-b border-outline-variant flex justify-between items-center px-margin-desktop sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-md text-headline-md text-primary">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-fixed rounded-full">
              <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
              <span className="font-label-md text-on-tertiary-fixed-variant">AI Online</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Canvas / Content */}
        <div className="flex-1 overflow-y-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
