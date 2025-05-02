import { User } from '../types';

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    // In a real application, this would be an API call
    const storedUsers = localStorage.getItem('ojtUsers');
    const allUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Remove passwords for security
    return allUsers.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Create a default admin user if none exists
export const initializeAdminUser = (): void => {
  try {
    const storedUsers = localStorage.getItem('ojtUsers');
    const allUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if admin exists
    const adminExists = allUsers.some(user => user.isAdmin && user.email === 'admin@example.com');
    
    if (!adminExists) {
      // Create default admin user
      const adminUser: User = {
        id: 'admin-' + Date.now(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // In a real app, this would be hashed
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      allUsers.push(adminUser);
      localStorage.setItem('ojtUsers', JSON.stringify(allUsers));
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Check if user is main admin
export const isMainAdmin = (user: User): boolean => {
  return user.isAdmin && user.email === 'admin@example.com';
};