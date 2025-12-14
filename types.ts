export interface SheetRow {
  [key: string]: string | number;
}

export interface ProcessingStatus {
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

export interface ColumnDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  password?: string; // Optional when listing users (security)
  fullName: string;
  role: UserRole;
  createdAt: string;
  mustChangePassword?: boolean;
}