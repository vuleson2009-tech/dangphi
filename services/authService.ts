import { User } from '../types';

const USERS_KEY = 'smartsheet_users';
const CURRENT_USER_KEY = 'smartsheet_current_user';

// Default admin account
const DEFAULT_ADMIN: User = {
  username: 'admin',
  password: 'ChangeMe@123456', // Placeholder secure password
  fullName: 'System Administrator',
  role: 'admin',
  createdAt: new Date().toISOString(),
  mustChangePassword: true
};

export const authService = {
  // Initialize users if empty
  init: () => {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }
  },

  login: (username: string, password: string): User | null => {
    authService.init();
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...safeUser } = user; // Remove password from session
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  changePassword: (username: string, newPass: string): boolean => {
    authService.init();
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex(u => u.username === username);
    
    if (index === -1) return false;

    users[index].password = newPass;
    delete users[index].mustChangePassword; // Remove the flag
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current session if it matches
    const currentUserRaw = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserRaw) {
        const currentUser = JSON.parse(currentUserRaw);
        if (currentUser.username === username) {
            const { password, ...safeUser } = users[index];
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
        }
    }
    return true;
  },

  // User Management (Admin only)
  getUsers: (): User[] => {
    authService.init();
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Return users without passwords for display
    return users.map(({ password, ...u }) => u as User);
  },

  addUser: (newUser: User): boolean => {
    authService.init();
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.some(u => u.username === newUser.username)) {
      return false; // User exists
    }

    users.push({ ...newUser, createdAt: new Date().toISOString() });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  updateUser: (username: string, updates: Partial<User>): boolean => {
    authService.init();
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex(u => u.username === username);
    
    if (index === -1) return false;
    
    // Safety check: Prevent removing admin role from the last admin
    if (users[index].role === 'admin' && updates.role === 'user') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error("Không thể gỡ quyền Admin của tài khoản quản trị cuối cùng.");
      }
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  deleteUser: (username: string): boolean => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const newUsers = users.filter(u => u.username !== username);
    
    if (newUsers.length === users.length) return false;

    // Prevent deleting the last admin
    if (!newUsers.some(u => u.role === 'admin')) {
      throw new Error("Không thể xóa tài khoản Admin cuối cùng.");
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    return true;
  }
};