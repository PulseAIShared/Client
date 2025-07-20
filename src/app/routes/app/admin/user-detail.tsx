import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useGetUserById, useUpdateUser } from '@/features/admin/api/users';
import { UpdateUserRequest, formatPlatformRole, formatCompanyRole, PlatformRole, CompanyRole } from '@/types/api';
import { PlatformAuthorization, useAuthorization } from '@/lib/authorization';

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
  const { checkPlatformPolicy } = useAuthorization();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    platformRole: PlatformRole.User,
    companyRole: CompanyRole.Viewer,
  });

  const { data: user, isLoading, error } = useGetUserById(userId!);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        platformRole: user.platformRole,
        companyRole: user.companyRole,
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
        platformRole: user.platformRole,
        companyRole: user.companyRole,
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
            <p className="mt-4 text-text-secondary">Loading user details...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error || !user) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50">
            <div className="text-error-muted text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">User Not Found</h2>
            <p className="text-text-muted mb-4">
              {error instanceof Error ? error.message : 'The requested user could not be found.'}
            </p>
            <button
              onClick={() => navigate('/app/admin/users')}
              className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
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
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-primary/30 mb-4">
                  <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-accent-primary">Admin Panel</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                  User Details
                </h1>
                <p className="text-text-secondary">
                  View and edit user information
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/app/admin/users')}
                  className="px-4 py-2 bg-surface-primary/50 text-text-primary rounded-lg hover:bg-surface-primary transition-colors font-medium text-sm border border-border-primary/50"
                >
                  Back to Users
                </button>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
                  >
                    Edit User
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-surface-primary/50 text-text-primary rounded-lg hover:bg-surface-primary transition-colors font-medium text-sm border border-border-primary/50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateUserMutation.isPending}
                      className="px-4 py-2 bg-gradient-to-r from-accent-primary to-info text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-text-muted mb-4">{user.email}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-surface-primary/30 rounded-lg">
                  <span className="text-text-muted text-sm">Platform Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    user.platformRole === PlatformRole.Admin 
                      ? 'text-accent-secondary bg-accent-secondary/20 border-accent-secondary/50' 
                      : user.platformRole === PlatformRole.Moderator
                      ? 'text-accent-primary bg-accent-primary/20 border-accent-primary/50'
                      : 'text-text-muted bg-surface-primary/20 border-border-primary/50'
                  }`}>
                    {formatPlatformRole(user.platformRole)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-surface-primary/30 rounded-lg">
                  <span className="text-text-muted text-sm">Company Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    user.companyRole === CompanyRole.Owner 
                      ? 'text-success-muted bg-success/20 border-success/50' 
                      : user.companyRole === CompanyRole.Staff
                      ? 'text-warning-muted bg-warning/20 border-warning/50'
                      : 'text-info-muted bg-info/20 border-info/50'
                  }`}>
                    {formatCompanyRole(user.companyRole)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-surface-primary/30 rounded-lg">
                  <span className="text-text-muted text-sm">Created</span>
                  <span className="text-text-secondary text-sm">{formatDate(user.dateCreated)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              {isEditing ? 'Edit User Information' : 'User Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  />
                ) : (
                  <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-primary">
                    {user.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  />
                ) : (
                  <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-primary">
                    {user.lastName}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  />
                ) : (
                  <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-primary">
                    {user.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Platform Role
                </label>
                {isEditing ? (
                  <select
                    value={formData.platformRole}
                    onChange={(e) => handleInputChange('platformRole', e.target.value as PlatformRole)}
                    className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  >
                    <option value={PlatformRole.User}>User</option>
                    <option value={PlatformRole.Moderator}>Moderator</option>
                    <option value={PlatformRole.Admin}>Admin</option>
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-primary">
                    {formatPlatformRole(user.platformRole)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Company Role
                </label>
                {isEditing ? (
                  <select
                    value={formData.companyRole}
                    onChange={(e) => handleInputChange('companyRole', e.target.value as CompanyRole)}
                    className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                  >
                    <option value={CompanyRole.Viewer}>Viewer</option>
                    <option value={CompanyRole.Staff}>Staff</option>
                    <option value={CompanyRole.Owner}>Owner</option>
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-primary">
                    {formatCompanyRole(user.companyRole)}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  User ID
                </label>
                <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-muted font-mono text-sm">
                  {user.id}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Company ID
                </label>
                <div className="px-4 py-2 bg-surface-primary/30 rounded-lg text-text-muted font-mono text-sm">
                  {user.companyId}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </PlatformAuthorization>
    </ContentLayout>
  );
};