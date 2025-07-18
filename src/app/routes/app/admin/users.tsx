import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useGetAllUsers, useDeleteUser } from '@/features/admin/api/users';
import { AdminUserResponse, AdminUsersQueryParams, formatPlatformRole, formatCompanyRole, PlatformRole, CompanyRole } from '@/types/api';
import { PlatformAuthorization, useAuthorization } from '@/lib/authorization';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPlatformRoleBadgeColor = (role: PlatformRole) => {
  switch (role) {
    case PlatformRole.Admin:
      return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
    case PlatformRole.Moderator:
      return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
    case PlatformRole.User:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
  }
};

const getCompanyRoleBadgeColor = (role: CompanyRole) => {
  switch (role) {
    case CompanyRole.Owner:
      return 'text-green-400 bg-green-500/20 border-green-500/50';
    case CompanyRole.Staff:
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    case CompanyRole.Viewer:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
  }
};

const DeleteUserModal = ({ 
  user, 
  onClose, 
  onConfirm 
}: { 
  user: AdminUserResponse; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-slate-800/90 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-white mb-4">Delete User</h3>
      <p className="text-slate-300 mb-6">
        Are you sure you want to delete <span className="font-medium text-white">{user.firstName} {user.lastName}</span>? 
        This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          Delete User
        </button>
      </div>
    </div>
  </div>
);

export const AdminUsersRoute = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { checkPlatformPolicy } = useAuthorization();
  
  const [queryParams, setQueryParams] = useState<AdminUsersQueryParams>({
    page: 1,
    pageSize: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userToDelete, setUserToDelete] = useState<AdminUserResponse | null>(null);

  const { data: usersData, isLoading, error } = useGetAllUsers(queryParams);
  
  const deleteUserMutation = useDeleteUser({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'User deleted',
          message: 'User has been successfully deleted.'
        });
        setUserToDelete(null);
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Delete failed',
          message: error instanceof Error ? error.message : 'Failed to delete user'
        });
      }
    }
  });

  const handleSearch = () => {
    setQueryParams(prev => ({
      ...prev,
      page: 1,
      searchTerm: searchTerm || undefined,
      role: selectedRole || undefined,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const handleDeleteUser = (user: AdminUserResponse) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const handleEditUser = (user: AdminUserResponse) => {
    navigate(`/app/admin/users/${user.id}`);
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-slate-300">Loading users...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Users</h2>
            <p className="text-slate-400">
              {error instanceof Error ? error.message : 'Failed to load users'}
            </p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <PlatformAuthorization policyCheck={checkPlatformPolicy('admin:users')} forbiddenFallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50">
            <div className="text-red-400 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">
              You need Admin or Moderator platform role to access user management.
            </p>
          </div>
        </div>
      }>
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
                  User Management
                </h1>
                <p className="text-slate-300">
                  Manage users, roles, and permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              >
                <option value="">All Platform Roles</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="User">User</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Users ({usersData?.totalCount || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600/50">
                  <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Platform Role</th>
                  <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Company Role</th>
                  <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Created</th>
                  <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.items.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlatformRoleBadgeColor(user.platformRole)}`}>
                        {formatPlatformRole(user.platformRole)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCompanyRoleBadgeColor(user.companyRole)}`}>
                        {formatCompanyRole(user.companyRole)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm">
                      {formatDate(user.dateCreated)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors text-xs font-medium border border-blue-500/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors text-xs font-medium border border-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                Showing {((usersData.page - 1) * usersData.pageSize) + 1} to {Math.min(usersData.page * usersData.pageSize, usersData.totalCount)} of {usersData.totalCount} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(usersData.page - 1)}
                  disabled={!usersData.hasPreviousPage}
                  className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-md hover:bg-slate-600/50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-slate-300 text-sm">
                  Page {usersData.page} of {usersData.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(usersData.page + 1)}
                  disabled={!usersData.hasNextPage}
                  className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-md hover:bg-slate-600/50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <DeleteUserModal
            user={userToDelete}
            onClose={() => setUserToDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
        </div>
      </PlatformAuthorization>
    </ContentLayout>
  );
};