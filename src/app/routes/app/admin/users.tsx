import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
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
      return 'text-accent-secondary bg-accent-secondary/20 border-accent-secondary/50';
    case PlatformRole.Moderator:
      return 'text-accent-primary bg-accent-primary/20 border-accent-primary/50';
    case PlatformRole.User:
      return 'text-text-muted bg-surface-primary/20 border-border-primary/50';
    default:
      return 'text-text-muted bg-surface-primary/20 border-border-primary/50';
  }
};

const getCompanyRoleBadgeColor = (role: CompanyRole) => {
  switch (role) {
    case CompanyRole.Owner:
      return 'text-success-muted bg-success/20 border-success/50';
    case CompanyRole.Staff:
      return 'text-warning-muted bg-warning/20 border-warning/50';
    case CompanyRole.Viewer:
      return 'text-info-muted bg-info/20 border-info/50';
    default:
      return 'text-text-muted bg-surface-primary/20 border-border-primary/50';
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
    <div className="bg-surface-secondary/90 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Delete User</h3>
      <p className="text-text-secondary mb-6">
        Are you sure you want to delete <span className="font-medium text-text-primary">{user.firstName} {user.lastName}</span>? 
        This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-surface-primary/50 text-text-primary rounded-lg hover:bg-surface-primary transition-colors font-medium text-sm border border-border-primary/50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-bg transition-colors font-medium text-sm"
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
            <p className="mt-4 text-text-secondary">Loading users...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50">
            <div className="text-error-muted text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Users</h2>
            <p className="text-text-muted">
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
          <div className="text-center bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50">
            <div className="text-error-muted text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
            <p className="text-text-muted">
              You need Admin or Moderator platform role to access user management.
            </p>
          </div>
        </div>
      }>
        <div className="space-y-8">
          <AppPageHeader
            title="User Management"
            description="Admin panel. Manage users, roles, and permissions."
          />

        {/* Filters */}
        <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
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
                className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Users ({usersData?.totalCount || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary/50">
                  <th className="text-left py-4 px-4 font-medium text-text-secondary uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-4 font-medium text-text-secondary uppercase tracking-wider">Platform Role</th>
                  <th className="text-left py-4 px-4 font-medium text-text-secondary uppercase tracking-wider">Company Role</th>
                  <th className="text-left py-4 px-4 font-medium text-text-secondary uppercase tracking-wider">Created</th>
                  <th className="text-left py-4 px-4 font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.items.map((user) => (
                  <tr key={user.id} className="border-b border-border-primary/30 hover:bg-surface-primary/20 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{user.firstName} {user.lastName}</p>
                          <p className="text-text-muted text-sm">{user.email}</p>
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
                    <td className="py-4 px-4 text-text-muted text-sm">
                      {formatDate(user.dateCreated)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-md hover:bg-accent-primary/30 transition-colors text-xs font-medium border border-accent-primary/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-3 py-1 bg-error/20 text-error-muted rounded-md hover:bg-error/30 transition-colors text-xs font-medium border border-error/30"
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
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-primary/50">
              <p className="text-text-muted text-sm">
                Showing {((usersData.page - 1) * usersData.pageSize) + 1} to {Math.min(usersData.page * usersData.pageSize, usersData.totalCount)} of {usersData.totalCount} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(usersData.page - 1)}
                  disabled={!usersData.hasPreviousPage}
                  className="px-3 py-1 bg-surface-primary/50 text-text-secondary rounded-md hover:bg-surface-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-text-secondary text-sm">
                  Page {usersData.page} of {usersData.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(usersData.page + 1)}
                  disabled={!usersData.hasNextPage}
                  className="px-3 py-1 bg-surface-primary/50 text-text-secondary rounded-md hover:bg-surface-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
