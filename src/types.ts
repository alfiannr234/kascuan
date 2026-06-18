/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string; // Format: YYYY-MM-DD or YYYY-MM-DD
  type: 'income' | 'expense';
  category: string;
  note: string;
  amount: number;
  status: 'completed' | 'pending';
}

export interface BusinessProfile {
  name: string;
  type: string;
  address: string;
  phone: string;
  logoUrl: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface Preferences {
  emailNotification: boolean;
  weeklyReport: boolean;
  twoFactorAuth: boolean;
}

export type ActiveTab = 'landing' | 'dashboard' | 'income' | 'expenses' | 'reports' | 'settings' | 'auth' | 'help' | 'terms' | 'privacy' | 'reset-password';
