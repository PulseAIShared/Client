


export type BaseEntity = {
  id: string;
  createdAt: number;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};

export type User = Entity<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'User';
  dateCreated: string;
}>;

export type UserProfile = Entity<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: string;
  friendCode: string;
}>;

export type AuthResponse = {
  token: string;
  user: User;
};


export interface ChurnRiskData {
  week: string;
  risk: number;
}

export interface CustomerInsight {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

export interface AtRiskCustomer {
  name: string;
  daysSince: number;
  score: number;
}

export interface DashboardStats {
  totalUsers: string;
  churnRisk: string;
  recoveredRevenue: string;
  avgLTV: string;
}

