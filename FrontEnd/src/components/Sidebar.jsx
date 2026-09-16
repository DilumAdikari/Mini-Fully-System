import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  ClipboardList, 
  Users, 
  LogOut,
  Settings,
  PlusCircle,
  Package, 
  UserCheck,
  FilePlus,
  FileText,
  Boxes,
  ChevronDown,
  Truck,
  Layers,
  BarChart3,
  Ticket,
  Contact2
} from 'lucide-react';

const Sidebar = ({ user, logout, onAddNew }) => {
  const systemColor = "#A47148";
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // 💡 PERMISSION CHECK LOGIC
  // Admin නම් සියල්ල පෙනේ. අනිත් අයට Matrix එකේ view === true නම් පමණක් පෙනේ.
  const hasPermission = (moduleKey) => {
    if (user?.role === 'admin' || user?.userType === 'Admin') return true;
    if (!user?.permissionMatrix) return false;
    const perm = user.permissionMatrix[moduleKey];
    return perm?.view === true || perm?.view === "true";
  };

  // 'New Job' button permission (Maintenance Create permission එක තිබිය යුතුය)
  const canCreateJob = 
    user?.role === 'admin' || 
    user?.userType === 'Admin' || 
    user?.permissionMatrix?.['maintenance']?.create === true ||
    user?.permissionMatrix?.['maintenance']?.create === "true";

  // --- MAIN NAVIGATION LINKS ---
  const navItems = [
    { id: 'dashboard', path: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'maintenance', path: 'maintenance', name: 'Maintenance', icon: ClipboardList },
    { id: 'grn_create', path: 'grn-create', name: 'Stock Entry (GRN)', icon: FilePlus },
    { id: 'inventory', path: 'inventory', name: 'Tool Inventory', icon: Package },
    { id: 'allocation', path: 'allocation', name: 'Staff Allocation', icon: UserCheck },
  ];

  // --- REPORTS SUB-ITEMS ---
  const reportSubItems = [
    { id: 'inventory_report', path: 'reports', name: 'Inventory Report', icon: FileText },
    { id: 'ticket_report', path: 'ticket-reports', name: 'Ticket Report', icon: Ticket },
  ];

  // --- ⚙️ SETTINGS SUB-ITEMS (Service Providers ඇතුළත්ව) ---
  const settingsSubItems = [
    { id: 'workflow_setup', path: 'workflow-setup', name: 'Workflow Setup', icon: Layers }, 
    { id: 'supplier_register', path: 'supplier-register', name: 'Supplier Registration', icon: Truck }, 
    { id: 'service_providers', path: 'service-providers', name: 'Service Providers', icon: Contact2 }, // 💡 මෙතැනට එක් කරන ලදී
    { id: 'materials', path: 'materials', name: 'Materials Registry', icon: Boxes },
    { id: 'users', path: 'users', name: 'User Management', icon: Users },
    { id: 'department', path: 'settings', name: 'Department', icon: Settings },
  ];

  // Permission පවතින sub-items පමණක් filter කරගැනීම
  const visibleReports = reportSubItems.filter(item => hasPermission(item.id));
  const visibleSettings = settingsSubItems.filter(item => hasPermission(item.id));

  const isReportActive = visibleReports.some(sub => location.pathname === `/${sub.path}`);
  const isSettingsActive = visibleSettings.some(sub => location.pathname === `/${sub.path}`);

  return (
    <>
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
          display: none;
        }

        .group:hover .custom-sidebar-scroll::-webkit-scrollbar {
          display: block;
        }

        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.45);
        }
      `}</style>

      <aside 
        className="group h-screen transition-all duration-300 ease-in-out flex flex-col w-20 hover:w-64 z-50 shadow-2xl shrink-0 overflow-hidden font-sans antialiased text-slate-200"
        style={{ backgroundColor: systemColor }}
      >
        {/* 1. BRAND LOGO */}
        <div className="flex items-center h-20 px-6 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm backdrop-blur-md">
            <Wrench size={16} strokeWidth={2} />
          </div>
          <span className="ml-4 font-semibold text-sm tracking-wide text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap uppercase">
            MMS Core
          </span>
        </div>
        
        {/* 2. NAVIGATION ITEMS */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-sidebar-scroll">
          
          {/* ADD NEW JOB ACTION BUTTON */}
          {canCreateJob && (
            <button
              onClick={onAddNew}
              className="w-full flex items-center h-12 rounded-xl transition-all relative group/add overflow-hidden mb-6 bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer"
            >
              <div className="w-[54px] min-w-[54px] flex items-center justify-center shrink-0">
                <PlusCircle size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-[10px] uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                New Job
              </span>
            </button>
          )}

          {/* Standard Navigation Rendering */}
          {navItems.map((item) => {
            if (!hasPermission(item.id)) return null;

            return (
              <NavLink
                key={item.id}
                to={`/${item.path}`}
                className={({ isActive }) => `
                  w-full flex items-center h-12 rounded-xl transition-all relative group/btn overflow-hidden
                  ${isActive ? 'bg-white/15' : 'hover:bg-white/5'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full z-20" />
                    )}
                    
                    <div className="w-[54px] min-w-[54px] flex items-center justify-center shrink-0">
                      <item.icon 
                        size={20} 
                        strokeWidth={isActive ? 2 : 1.5}
                        className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-white/60 group-hover/btn:text-white'}`}
                      />
                    </div>
                    
                    <span className={`font-medium text-[11px] tracking-wide whitespace-nowrap transition-all duration-300 ml-2 ${
                      isActive ? 'text-white' : 'text-white/60 group-hover/btn:text-white'
                    } opacity-0 group-hover:opacity-100`}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* ================================================== */}
          {/* 📊 Reports Dropdown Accordion                       */}
          {/* ================================================== */}
          {visibleReports.length > 0 && (
            <div className="space-y-1 block relative">
              <button
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className={`w-full flex items-center h-12 rounded-xl transition-all relative overflow-hidden outline-none cursor-pointer ${
                  isReportActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="w-[54px] min-w-[54px] flex items-center justify-center shrink-0">
                  <BarChart3 
                    size={20} 
                    strokeWidth={isReportActive ? 2 : 1.5}
                    className={`transition-all duration-300 ${isReportActive ? 'text-white' : 'text-white/60'}`}
                  />
                </div>
                
                <span className="font-medium text-[11px] tracking-wide ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-1 text-left whitespace-nowrap">
                  Reports
                </span>

                <div className="pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform duration-200 ${isReportsOpen ? 'rotate-180' : 'rotate-0'}`} 
                  />
                </div>
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden space-y-1 pl-4 ${
                  isReportsOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                {visibleReports.map((sub) => (
                  <NavLink
                    key={sub.id}
                    to={`/${sub.path}`}
                    className={({ isActive }) => `
                      w-full flex items-center h-10 rounded-lg transition-all relative overflow-hidden
                      ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="w-10 min-w-10 flex items-center justify-center shrink-0">
                          <sub.icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                        </div>
                        <span className="font-medium text-[11px] tracking-wide ml-2 whitespace-nowrap transition-opacity duration-300">
                          {sub.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* ⚙️ Settings Dropdown Accordion (Service Providers සමඟ) */}
          {/* ================================================== */}
          {visibleSettings.length > 0 && (
            <div className="space-y-1 block relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-full flex items-center h-12 rounded-xl transition-all relative overflow-hidden outline-none cursor-pointer ${
                  isSettingsActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="w-[54px] min-w-[54px] flex items-center justify-center shrink-0">
                  <Settings 
                    size={20} 
                    strokeWidth={isSettingsActive ? 2 : 1.5}
                    className={`transition-all duration-300 ${isSettingsActive ? 'text-white' : 'text-white/60'}`}
                  />
                </div>
                
                <span className="font-medium text-[11px] tracking-wide ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-1 text-left whitespace-nowrap">
                  Settings Menu
                </span>

                <div className="pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : 'rotate-0'}`} 
                  />
                </div>
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden space-y-1 pl-4 ${
                  isSettingsOpen ? 'max-h-72 opacity-100 mt-1' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                {visibleSettings.map((sub) => (
                  <NavLink
                    key={sub.id}
                    to={`/${sub.path}`}
                    className={({ isActive }) => `
                      w-full flex items-center h-10 rounded-lg transition-all relative overflow-hidden
                      ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="w-10 min-w-10 flex items-center justify-center shrink-0">
                          <sub.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                        </div>
                        <span className="font-medium text-[11px] tracking-wide ml-2 whitespace-nowrap transition-opacity duration-300">
                          {sub.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

        </nav>

        {/* 3. LOGOUT FOOTER */}
        <div className="p-3 border-t border-white/10 mb-2 shrink-0">
          <button 
            onClick={logout}
            className="w-full flex items-center h-12 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-white group/logout cursor-pointer"
          >
            <div className="w-[54px] min-w-[54px] flex items-center justify-center shrink-0">
              <LogOut size={18} strokeWidth={1.5} />
            </div>
            <span className="font-medium text-[11px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ml-2">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;