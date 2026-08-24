import React from 'react';
import { auth } from '@hastkala/core';
import { Shield, Mail, Key } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Admin logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-earth-900">Admin Profile</h1>
        <p className="text-earth-500 text-sm mt-1">Manage your administrator account.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
        <div className="bg-earth-900 p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-earth-50 flex items-center justify-center text-earth-900 font-serif font-bold text-3xl shadow-lg">
            A
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Administrator</h2>
            <div className="flex items-center gap-2 text-earth-300 mt-1">
              <Shield size={16} />
              <span>Full System Access</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-earth-400 uppercase tracking-wider">Email Address</p>
              <p className="font-medium text-earth-900 flex items-center gap-2">
                <Mail size={16} className="text-earth-400" />
                {user?.email || 'admin@hastkala.in'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-bold text-earth-400 uppercase tracking-wider">Account Role</p>
              <p className="font-medium text-earth-900 flex items-center gap-2">
                <Shield size={16} className="text-earth-400" />
                admin
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-earth-400 uppercase tracking-wider">Authentication</p>
              <p className="font-medium text-earth-900 flex items-center gap-2">
                <Key size={16} className="text-earth-400" />
                Firebase Auth
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-earth-400 uppercase tracking-wider">Status</p>
              <span className="inline-block px-2 py-1 bg-forest-50 text-forest-700 text-xs font-bold uppercase tracking-wider rounded border border-forest-200">
                Active
              </span>
            </div>
          </div>

          <div className="pt-8 border-t border-earth-200">
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
