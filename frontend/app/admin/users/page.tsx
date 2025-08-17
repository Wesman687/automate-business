'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Shield, User, Crown } from 'lucide-react';
import { api } from '@/lib/https';

interface Admin {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  is_super_admin: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export default function AdminUsers() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showMessage, setShowMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; is_super_admin: boolean; admin_id: number } | null>(null);

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.ok) {
        const data = await response.json();
        // Map the response to match our interface expectations
        setCurrentUser({
          email: data.user.email,
          is_super_admin: data.user.is_super_admin,
          admin_id: data.user.id
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/auth/admins');

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      } else {
        console.error('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessageToUser = (text: string, type: 'success' | 'error') => {
    setShowMessage({ text, type });
    setTimeout(() => setShowMessage(null), 5000);
  };

  const createAdmin = async (formData: { email: string; password: string; full_name: string; phone: string; address: string }) => {
    try {
const response = await api.post('/auth/create-admin', formData);
const result = await response.json();

      if (response.ok) {
        showMessageToUser('Admin created successfully!', 'success');
        setShowAddModal(false);
        fetchAdmins();
      } else {
        showMessageToUser(result.detail || 'Error creating admin', 'error');
      }
    } catch (error) {
      showMessageToUser('Network error: ' + (error as Error).message, 'error');
    }
  };

  const updateAdmin = async (formData: { email?: string; full_name?: string; phone?: string; address?: string; password?: string }) => {
    if (!editingAdmin) return;

    try {
      const response = await api.put(`/auth/admins/${editingAdmin.id}`, formData)


      const result = await response.json();

      if (response.ok) {
        showMessageToUser('Admin updated successfully!', 'success');
        setShowEditModal(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        showMessageToUser(result.detail || 'Error updating admin', 'error');
      }
    } catch (error) {
      showMessageToUser('Network error: ' + (error as Error).message, 'error');
    }
  };

  const deleteAdmin = async (adminId: number) => {
    if (!window.confirm('Are you sure you want to deactivate this admin?')) {
      return;
    }

    try {
      const response = await api.del(`/auth/admins/${adminId}`);

      const result = await response.json();

      if (response.ok) {
        showMessageToUser('Admin deactivated successfully', 'success');
        fetchAdmins();
      } else {
        showMessageToUser(result.detail || 'Error deactivating admin', 'error');
      }
    } catch (error) {
      showMessageToUser('Network error: ' + (error as Error).message, 'error');
    }
  };

const removeSuperAdmin = async (adminId: number) => {
  if (!window.confirm('Are you sure you want to remove super admin status from this admin?')) {
    return;
  }

  try {
    // HITS: /api/auth/admins/:id/remove-super-admin (Next proxy)
    // FORWARDS TO: https://server.stream-lineai.com/auth/admins/:id/remove-super-admin
    await api.post(`/auth/admins/${adminId}/remove-super-admin`);

    showMessageToUser('Super admin status removed successfully!', 'success');
    fetchAdmins();
  } catch (err: any) {
    // http() in lib/https.ts throws with message like "401 Unauthorized" or "404 Not Found"
    const msg = err?.message || 'Error removing super admin status';
    showMessageToUser(msg, 'error');

    // Optional: handle auth expiry
    if (msg.startsWith('401')) {
      // e.g. refresh auth context or kick to login
      // router.replace('/portal');
    }
  }
};
const makeSuperAdmin = async (adminId: number) => {
  if (!window.confirm('Are you sure you want to make this admin a super admin?')) {
    return;
  }
  try {
    // HITS: /api/auth/admins/:id/make-super-admin (Next proxy)
    // FORWARDS TO: https://server.stream-lineai.com/auth/admins/:id/make-super-admin
    await api.post(`/auth/admins/${adminId}/make-super-admin`);

    showMessageToUser('Admin promoted to super admin successfully!', 'success');
    fetchAdmins();
  } catch (err: any) {
    // http() in lib/https.ts throws with message like "401 Unauthorized" or "404 Not Found"
    const msg = err?.message || 'Error promoting admin to super admin';
    showMessageToUser(msg, 'error');


  }
}



  const handleCreateAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };
    
    createAdmin(data);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Check if current user has any admin access
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <div className="text-red-400 text-lg font-semibold">Access Denied</div>
        <div className="text-gray-400 mt-2">Only administrators can access this page.</div>
      </div>
    );
  }

  // Filter admins based on user permissions
  const visibleAdmins = currentUser?.is_super_admin 
    ? admins 
    : admins.filter(admin => admin.id === currentUser?.admin_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {currentUser?.is_super_admin ? 'Admin Management' : 'My Profile'}
          </h1>
          <p className="text-gray-400 mt-1">
            {currentUser?.is_super_admin 
              ? 'Manage administrative users and permissions' 
              : 'Manage your admin profile information'
            }
          </p>
        </div>
        {currentUser?.is_super_admin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        )}
      </div>

      {/* Message */}
      {showMessage && (
        <div className={`p-4 rounded-lg border ${
          showMessage.type === 'success' 
            ? 'bg-green-900/20 border-green-400/30 text-green-400' 
            : 'bg-red-900/20 border-red-400/30 text-red-400'
        }`}>
          {showMessage.text}
        </div>
      )}

      {/* Stats Cards - Only show for super admins */}
      {currentUser?.is_super_admin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-sm font-medium text-cyan-400">Total Admins</h3>
            <div className="text-2xl font-bold text-white">{admins.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-sm font-medium text-cyan-400">Super Admins</h3>
            <div className="text-2xl font-bold text-white">
              {admins.filter(admin => admin.is_super_admin).length}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-sm font-medium text-cyan-400">Active Admins</h3>
            <div className="text-2xl font-bold text-white">
              {admins.filter(admin => admin.is_active).length}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-sm font-medium text-cyan-400">Regular Admins</h3>
            <div className="text-2xl font-bold text-white">
              {admins.filter(admin => !admin.is_super_admin && admin.is_active).length}
            </div>
          </div>
        </div>
      )}

      {/* Admin Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-cyan-600/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-cyan-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {admin.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {admin.phone || 'No phone'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {admin.address ? admin.address.slice(0, 30) + (admin.address.length > 30 ? '...' : '') : 'No address'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.is_super_admin 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.is_super_admin && <Crown className="h-3 w-3 mr-1" />}
                      {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {admin.last_login 
                        ? new Date(admin.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Edit button */}
                      {(currentUser?.is_super_admin || currentUser?.admin_id === admin.id) && (
                        <button
                          onClick={() => {
                            setEditingAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 p-1 rounded"
                          title="Edit Admin"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}

                      {/* Super admin actions - only super admins can promote/demote */}
                      {currentUser?.is_super_admin && !admin.is_super_admin && admin.is_active && (
                        <button
                          onClick={() => makeSuperAdmin(admin.id)}
                          className="text-yellow-400 hover:text-yellow-300 p-1 rounded"
                          title="Make Super Admin"
                        >
                          <Crown className="h-4 w-4" />
                        </button>
                      )}

                      {/* Remove super admin (only for owner) */}
                      {currentUser?.is_super_admin && admin.is_super_admin && 
                       currentUser?.email.toLowerCase() === 'wesman687@gmail.com' && 
                       admin.email.toLowerCase() !== 'wesman687@gmail.com' && (
                        <button
                          onClick={() => removeSuperAdmin(admin.id)}
                          className="text-orange-400 hover:text-orange-300 p-1 rounded"
                          title="Remove Super Admin"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete button - only super admins can delete other admins (not super admins) */}
                      {currentUser?.is_super_admin && !admin.is_super_admin && (
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded"
                          title="Deactivate Admin"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onSave={updateAdmin}
          onClose={() => {
            setShowEditModal(false);
            setEditingAdmin(null);
          }}
          canEditPassword={currentUser?.is_super_admin || false}
        />
      )}
    </div>
  );
}

// Edit Admin Modal Component
function EditAdminModal({ 
  admin, 
  onSave, 
  onClose,
  canEditPassword 
}: { 
  admin: Admin; 
  onSave: (data: { email?: string; full_name?: string; phone?: string; address?: string; password?: string }) => void; 
  onClose: () => void;
  canEditPassword: boolean;
}) {
  const [formData, setFormData] = useState({
    email: admin.email || '',
    full_name: admin.full_name || '',
    phone: admin.phone || '',
    address: admin.address || '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include fields that have changed or have values
    const updateData: any = {};
    
    if (formData.email && formData.email !== admin.email) {
      updateData.email = formData.email;
    }
    if (formData.full_name !== admin.full_name) {
      updateData.full_name = formData.full_name;
    }
    if (formData.phone !== admin.phone) {
      updateData.phone = formData.phone;
    }
    if (formData.address !== admin.address) {
      updateData.address = formData.address;
    }
    if (canEditPassword && formData.password) {
      updateData.password = formData.password;
    }
    
    onSave(updateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Edit Admin</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="(555) 123-4567"
              />
            </div>
            
            {canEditPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Leave blank to keep current password"
                  minLength={8}
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
