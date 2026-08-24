import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Users, Shield, Menu, X, LayoutDashboard, UserCheck, Store, Package, MessageSquare, BarChart, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@hastkala/core';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Admin logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Applications', path: '/admin/applications', icon: UserCheck },
    { name: 'Artisans', path: '/admin/artisans', icon: Store },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart },
    { name: 'Profile', path: '/admin/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-earth-900 text-earth-50 p-4 flex justify-between items-center z-20 shadow-md">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-earth-50 flex items-center justify-center text-earth-900 font-serif font-bold text-lg">H</div>
          <span className="font-serif font-bold text-xl tracking-widest text-earth-50">ADMIN</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-earth-900 text-earth-50 fixed md:sticky top-0 h-screen z-10 transition-transform duration-300 overflow-y-auto
      `}>
        <div className="p-6 hidden md:block border-b border-earth-800">
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-earth-50 flex items-center justify-center text-earth-900 font-serif font-bold text-xl shadow-lg">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-wider text-earth-50">HASTKALA</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-terracotta-400 font-bold">Admin Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 mt-16 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for overview, startsWith for others
            const isActive = item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-earth-800 text-terracotta-400 border-l-4 border-terracotta-500' 
                    : 'text-earth-300 hover:bg-earth-800 hover:text-earth-100'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-terracotta-500' : 'text-earth-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-earth-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-earth-200 px-8 py-4 flex justify-between items-center hidden md:flex">
          <h1 className="text-2xl font-serif font-bold text-earth-900 flex items-center gap-2">
            <Shield className="text-terracotta-600" size={24} />
            Command Center
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-earth-900">Administrator</p>
              <p className="text-xs text-earth-500">System Access</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-earth-200 flex items-center justify-center text-earth-600 font-bold">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-earth-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
