import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Home, 
  Users, 
  Building, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useEntityStore } from '../stores/entityStore';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { entities, fetchEntities } = useEntityStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'users':
        return <Users size={20} />;
      case 'building':
        return <Building size={20} />;
      default:
        return <Building size={20} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-indigo-700 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } hidden lg:block`}
      >
        <div className="flex h-20 items-center justify-center border-b border-indigo-600">
          <h1 className="text-2xl font-bold text-white">ModernCRM</h1>
        </div>
        <nav className="mt-5 space-y-2 px-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className={`flex items-center rounded-md px-4 py-2.5 transition-all ${
              location.pathname === '/'
                ? 'bg-indigo-800 text-white'
                : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            <Home size={20} className="mr-3" />
            <span className="font-medium">Dashboard</span>
          </a>

          {entities.map((entity) => (
            <a
              key={entity.id}
              href={`/${entity.name}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${entity.name}`);
              }}
              className={`flex items-center rounded-md px-4 py-2.5 transition-all ${
                location.pathname.startsWith(`/${entity.name}`)
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              {getIconComponent(entity.icon)}
              <span className="ml-3 font-medium">{entity.label}</span>
            </a>
          ))}

          <div className="py-3">
            <div className="h-px bg-indigo-600"></div>
          </div>

          <a
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              navigate('/settings');
            }}
            className={`flex items-center rounded-md px-4 py-2.5 transition-all ${
              location.pathname.startsWith('/settings')
                ? 'bg-indigo-800 text-white'
                : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span className="font-medium">Settings</span>
          </a>

          <a
            href="#"
            onClick={handleSignOut}
            className="flex items-center rounded-md px-4 py-2.5 text-indigo-100 transition-all hover:bg-indigo-600"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Sign Out</span>
          </a>
        </nav>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed left-4 top-4 z-20 rounded-md bg-indigo-600 p-2 text-white shadow-md lg:hidden"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside className="absolute left-0 top-0 h-full w-64 transform bg-indigo-700 transition-transform duration-300 ease-in-out">
            <div className="flex h-20 items-center justify-center border-b border-indigo-600">
              <h1 className="text-2xl font-bold text-white">ModernCRM</h1>
            </div>
            <nav className="mt-5 space-y-2 px-2">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-md px-4 py-2.5 transition-all ${
                  location.pathname === '/'
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <Home size={20} className="mr-3" />
                <span className="font-medium">Dashboard</span>
              </a>

              {entities.map((entity) => (
                <a
                  key={entity.id}
                  href={`/${entity.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${entity.name}`);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center rounded-md px-4 py-2.5 transition-all ${
                    location.pathname.startsWith(`/${entity.name}`)
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600'
                  }`}
                >
                  {getIconComponent(entity.icon)}
                  <span className="ml-3 font-medium">{entity.label}</span>
                </a>
              ))}

              <div className="py-3">
                <div className="h-px bg-indigo-600"></div>
              </div>

              <a
                href="/settings"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-md px-4 py-2.5 transition-all ${
                  location.pathname.startsWith('/settings')
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <Settings size={20} className="mr-3" />
                <span className="font-medium">Settings</span>
              </a>

              <a
                href="#"
                onClick={handleSignOut}
                className="flex items-center rounded-md px-4 py-2.5 text-indigo-100 transition-all hover:bg-indigo-600"
              >
                <LogOut size={20} className="mr-3" />
                <span className="font-medium">Sign Out</span>
              </a>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex-1 lg:hidden"></div>
          <div className="text-xl font-semibold text-gray-800 lg:flex-1">
            {location.pathname === '/' && 'Dashboard'}
            {entities.find(e => location.pathname.startsWith(`/${e.name}`))?.label}
            {location.pathname.startsWith('/settings') && 'Settings'}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="flex items-center rounded-full bg-gray-100 p-1 pr-2 text-sm text-gray-700 focus:outline-none"
            >
              <span className="h-8 w-8 rounded-full bg-indigo-500 text-center text-white">
                <span className="inline-block pt-1.5">U</span>
              </span>
              <span className="mx-2">User</span>
              <ChevronDown size={16} />
            </button>
            
            {settingsDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                onBlur={() => setSettingsDropdownOpen(false)}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/settings');
                    setSettingsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;