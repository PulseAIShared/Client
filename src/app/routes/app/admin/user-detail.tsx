import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useGetUserById, useUpdateUser } from '@/features/admin/api/users';
import { UpdateUserRequest } from '@/types/api';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const AdminUserDetailRoute = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isCompanyOwner: false,
  });

  const { data: user, isLoading, error } = useGetUserById(userId!);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isCompanyOwner: user.isCompanyOwner,
      });
    }
  }, [user]);

  const updateUserMutation = useUpdateUser({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'User updated',
          message: 'User information has been successfully updated.'
        });
        setIsEditing(false);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Update failed',
          message: error instanceof Error ? error.message : 'Failed to update user'
        });
      }
    }
  });

  const handleInputChange = (field: keyof UpdateUserRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (userId) {
      updateUserMutation.mutate({
        id: userId,
        user: formData
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isCompanyOwner: user.isCompanyOwner,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-slate-300">Loading user details...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error || !user) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">User Not Found</h2>
            <p className="text-slate-400 mb-4">
              {error instanceof Error ? error.message : 'The requested user could not be found.'}
            </p>
            <button
              onClick={() => navigate('/app/admin/users')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              Back to Users
            </button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-200">Admin Panel</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  User Details
                </h1>
                <p className="text-slate-300">
                  View and edit user information
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/app/admin/users')}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50"
                >
                  Back to Users
                </button>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
                  >
                    Edit User
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateUserMutation.isPending}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updateUserMutation.isPending && <Spinner size="sm" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-slate-400 mb-4">{user.email}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    user.role === 'Admin' 
                      ? 'text-purple-400 bg-purple-500/20 border-purple-500/50' 
                      : 'text-blue-400 bg-blue-500/20 border-blue-500/50'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Company Owner</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    user.isCompanyOwner 
                      ? 'text-green-400 bg-green-500/20 border-green-500/50' 
                      : 'text-slate-400 bg-slate-500/20 border-slate-500/50'
                  }`}>
                    {user.isCompanyOwner ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Created</span>
                  <span className="text-slate-300 text-sm">{formatDate(user.dateCreated)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">
              {isEditing ? 'Edit User Information' : 'User Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                ) : (
                  <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-white">
                    {user.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                ) : (
                  <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-white">
                    {user.lastName}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                ) : (
                  <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-white">
                    {user.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                {isEditing ? (
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-white">
                    {user.role}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Owner
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="radio"
                        name="isCompanyOwner"
                        checked={formData.isCompanyOwner === true}
                        onChange={() => handleInputChange('isCompanyOwner', true)}
                        className="text-purple-500 focus:ring-purple-500/50"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="radio"
                        name="isCompanyOwner"
                        checked={formData.isCompanyOwner === false}
                        onChange={() => handleInputChange('isCompanyOwner', false)}
                        className="text-purple-500 focus:ring-purple-500/50"
                      />
                      No
                    </label>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-white">
                    {user.isCompanyOwner ? 'Yes' : 'No'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User ID
                </label>
                <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-slate-400 font-mono text-sm">
                  {user.id}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company ID
                </label>
                <div className="px-4 py-2 bg-slate-700/30 rounded-lg text-slate-400 font-mono text-sm">
                  {user.companyId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};