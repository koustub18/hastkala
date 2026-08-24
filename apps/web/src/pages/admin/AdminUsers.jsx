import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@hastkala/core';
import { Search, User, Shield } from 'lucide-react';
import { getSafeDate } from '@hastkala/core';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-earth-900">System Users</h1>
          <p className="text-earth-500 text-sm mt-1">Comprehensive view of all authenticated accounts.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-earth-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="artisan">Artisan</option>
            <option value="customer">Customer</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-earth-50 text-earth-500 text-xs uppercase tracking-wider border-b border-earth-200">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-earth-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-earth-500">No users found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-earth-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center text-earth-600">
                          {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-earth-900">{user.name || 'Unnamed User'}</p>
                          <p className="text-xs text-earth-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'artisan' ? 'bg-terracotta-100 text-terracotta-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                        user.status === 'active' ? 'bg-forest-50 text-forest-700' :
                        user.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-earth-500">
                        {user.createdAt && getSafeDate(user.createdAt) ? getSafeDate(user.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
