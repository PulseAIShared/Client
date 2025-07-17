import * as React from 'react';

import { User, PlatformRole, CompanyRole } from '@/types/api';

import { useUser } from './auth';

// Platform-based authorization policies
export const PLATFORM_POLICIES = {
  'admin:system': (user: User) => user.platformRole === PlatformRole.Admin,
  'admin:users': (user: User) => user.platformRole === PlatformRole.Admin || user.platformRole === PlatformRole.Moderator,
  'admin:support': (user: User) => user.platformRole === PlatformRole.Admin || user.platformRole === PlatformRole.Moderator,
  'admin:platform': (user: User) => user.platformRole === PlatformRole.Admin || user.platformRole === PlatformRole.Moderator,
};

const COMPANY_ROLE_HIERARCHY: Record<CompanyRole, number> = {
  [CompanyRole.Viewer]: 0,
  [CompanyRole.Staff]: 1,
  [CompanyRole.Owner]: 2,
};
// Company-based authorization policies  
export const COMPANY_POLICIES = {
  'company:read': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Viewer],
  'company:write': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Staff],
  'company:manage': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Owner],
  'company:invite': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Owner],
  'company:billing': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Owner],
  'customers:read': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Viewer],
  'customers:write': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Staff],
  'integrations:read': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Viewer],
  'integrations:write': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Staff],
  'analytics:read': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Viewer],
  'segments:read': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Viewer],
  'segments:write': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Staff],
  'settings:read': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Viewer],
  'settings:write': (user: User) => COMPANY_ROLE_HIERARCHY[user.companyRole] >= COMPANY_ROLE_HIERARCHY[CompanyRole.Staff],
};
// Combined authorization hook
export const useAuthorization = () => {
  const user = useUser();
  
  if (!user.data) {
    throw Error('User does not exist!');
  }

  const checkPlatformAccess = React.useCallback(
    (requiredRoles: PlatformRole[]) => {

      if (!user.data) return false;
      return requiredRoles.includes(user.data.platformRole);
    },
    [user.data],
  );

  const checkCompanyAccess = React.useCallback(
    (requiredRoles: CompanyRole[]) => {

      if (!user.data) return false;
      return requiredRoles.includes(user.data.companyRole);
    },
    [user.data],
  );

  const checkPlatformPolicy = React.useCallback(
    (policyName: keyof typeof PLATFORM_POLICIES) => {
      if (!user.data) return false;
      return PLATFORM_POLICIES[policyName](user.data);
    },
    [user.data],
  );

  const checkCompanyPolicy = React.useCallback(
    (policyName: keyof typeof COMPANY_POLICIES) => {
      if (!user.data) return false;
      console.log(COMPANY_POLICIES[policyName](user.data))
      return COMPANY_POLICIES[policyName](user.data);
    },
    [user.data],
  );

  const canAccessAdminPanel = React.useCallback(
    () => {
      if (!user.data) return false;
      return user.data.platformRole === PlatformRole.Admin || user.data.platformRole === PlatformRole.Moderator;
    },
    [user.data],
  );

  const canManageUsers = React.useCallback(
    () => {
      if (!user.data) return false;
      return user.data.platformRole === PlatformRole.Admin || user.data.platformRole === PlatformRole.Moderator;
    },
    [user.data],
  );

  const canManageCompany = React.useCallback(
    () => {
      if (!user.data) return false;
      return user.data.companyRole === CompanyRole.Owner;
    },
    [user.data],
  );

  const canEditCompanyData = React.useCallback(
    () => {
      if (!user.data) return false;
      return user.data.companyRole >= CompanyRole.Staff;
    },
    [user.data],
  );

  const hasReadAccess = React.useCallback(
    () => {
      if (!user.data) return false;
      return user.data.companyRole >= CompanyRole.Viewer;
    },
    [user.data],
  );

  return {
    checkPlatformAccess,
    checkCompanyAccess,
    checkPlatformPolicy,
    checkCompanyPolicy,
    canAccessAdminPanel,
    canManageUsers,
    canManageCompany,
    canEditCompanyData,
    hasReadAccess,
    platformRole: user.data.platformRole,
    companyRole: user.data.companyRole,
  };
};

// Authorization component for platform-based access
type PlatformAuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedPlatformRoles: PlatformRole[];
      policyCheck?: never;
    }
  | {
      allowedPlatformRoles?: never;
      policyCheck: boolean;
    }
);

export const PlatformAuthorization = ({
  policyCheck,
  allowedPlatformRoles,
  forbiddenFallback = null,
  children,
}: PlatformAuthorizationProps) => {
  const { checkPlatformAccess } = useAuthorization();

  let canAccess = false;

  if (allowedPlatformRoles) {
    canAccess = checkPlatformAccess(allowedPlatformRoles);
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck;
  }

  return <>{canAccess ? children : forbiddenFallback}</>;
};

// Authorization component for company-based access
type CompanyAuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedCompanyRoles: CompanyRole[];
      policyCheck?: never;
    }
  | {
      allowedCompanyRoles?: never;
      policyCheck: boolean;
    }
);

export const CompanyAuthorization = ({
  policyCheck,
  allowedCompanyRoles,
  forbiddenFallback = null,
  children,
}: CompanyAuthorizationProps) => {
  const { checkCompanyAccess } = useAuthorization();

  let canAccess = false;

  if (allowedCompanyRoles) {
    canAccess = checkCompanyAccess(allowedCompanyRoles);
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck;
  }

  return <>{canAccess ? children : forbiddenFallback}</>;
};

// Legacy Authorization component (deprecated, use PlatformAuthorization or CompanyAuthorization)
export enum ROLES {
  Admin = 'Admin',
  User = 'User',
}

type RoleTypes = keyof typeof ROLES;

// Legacy authorization component for backward compatibility
type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedRoles: RoleTypes[];
      policyCheck?: never;
    }
  | {
      allowedRoles?: never;
      policyCheck: boolean;
    }
);

export const Authorization = ({
  policyCheck,
  allowedRoles,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) => {
  const { canAccessAdminPanel } = useAuthorization();

  let canAccess = false;

  if (allowedRoles) {
    // Map legacy roles to new platform roles
    if (allowedRoles.includes('Admin')) {
      canAccess = canAccessAdminPanel();
    } else {
      canAccess = true; // User role maps to any authenticated user
    }
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck;
  }

  return <>{canAccess ? children : forbiddenFallback}</>;
};