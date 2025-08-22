/**
 * Role-Based Access Control (RBAC) utilities
 * Defines user roles, permissions, and access control functions
 */

// Define available roles in the system
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  AUDITOR = 'auditor',
  VIEWER = 'viewer',
}

// Define available permissions
export enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  // Order management
  VIEW_ORDERS = 'view_orders',
  CANCEL_ORDER = 'cancel_order',
  REFUND_ORDER = 'refund_order',
  
  // Market management
  VIEW_MARKETS = 'view_markets',
  CREATE_MARKET = 'create_market',
  UPDATE_MARKET = 'update_market',
  DELETE_MARKET = 'delete_market',
  MANAGE_FEES = 'manage_fees',
  
  // Risk management
  VIEW_RISK_DATA = 'view_risk_data',
  FREEZE_ACCOUNT = 'freeze_account',
  UNFREEZE_ACCOUNT = 'unfreeze_account',
  APPROVE_KYC = 'approve_kyc',
  REJECT_KYC = 'reject_kyc',
  
  // System settings
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',
  MANAGE_ANNOUNCEMENTS = 'manage_announcements',
  
  // Reports and analytics
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  
  // System administration
  MANAGE_SYSTEM = 'manage_system',
  VIEW_LOGS = 'view_logs',
  BACKUP_SYSTEM = 'backup_system',
}

// Role-permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(Permission),
  ],
  
  [UserRole.ADMIN]: [
    // User management (except role management)
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    
    // Order management
    Permission.VIEW_ORDERS,
    Permission.CANCEL_ORDER,
    Permission.REFUND_ORDER,
    
    // Market management
    Permission.VIEW_MARKETS,
    Permission.CREATE_MARKET,
    Permission.UPDATE_MARKET,
    Permission.DELETE_MARKET,
    Permission.MANAGE_FEES,
    
    // Risk management
    Permission.VIEW_RISK_DATA,
    Permission.FREEZE_ACCOUNT,
    Permission.UNFREEZE_ACCOUNT,
    Permission.APPROVE_KYC,
    Permission.REJECT_KYC,
    
    // Settings
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.MANAGE_ANNOUNCEMENTS,
    
    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    
    // System logs
    Permission.VIEW_LOGS,
  ],
  
  [UserRole.OPERATOR]: [
    // User management (view and update only)
    Permission.VIEW_USERS,
    Permission.UPDATE_USER,
    
    // Order management
    Permission.VIEW_ORDERS,
    Permission.CANCEL_ORDER,
    
    // Market management (view and update)
    Permission.VIEW_MARKETS,
    Permission.UPDATE_MARKET,
    Permission.MANAGE_FEES,
    
    // Risk management (limited)
    Permission.VIEW_RISK_DATA,
    Permission.APPROVE_KYC,
    Permission.REJECT_KYC,
    
    // Settings (view only)
    Permission.VIEW_SETTINGS,
    
    // Reports
    Permission.VIEW_REPORTS,
  ],
  
  [UserRole.AUDITOR]: [
    // Read-only access for auditing purposes
    Permission.VIEW_USERS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_MARKETS,
    Permission.VIEW_RISK_DATA,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_LOGS,
  ],
  
  [UserRole.VIEWER]: [
    // Minimal read-only access
    Permission.VIEW_USERS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_MARKETS,
    Permission.VIEW_REPORTS,
  ],
};

// User interface for RBAC
export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  if (!user.isActive) return false;
  
  return user.roles.some(role => 
    rolePermissions[role]?.includes(permission)
  );
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User, role: UserRole): boolean {
  return user.isActive && user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User, roles: UserRole[]): boolean {
  return user.isActive && roles.some(role => user.roles.includes(role));
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: User): Permission[] {
  if (!user.isActive) return [];
  
  const permissions = new Set<Permission>();
  
  user.roles.forEach(role => {
    rolePermissions[role]?.forEach(permission => {
      permissions.add(permission);
    });
  });
  
  return Array.from(permissions);
}

/**
 * Check if a user is an admin (super admin or admin)
 */
export function isAdmin(user: User): boolean {
  return hasAnyRole(user, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
}

/**
 * Check if a user is a super admin
 */
export function isSuperAdmin(user: User): boolean {
  return hasRole(user, UserRole.SUPER_ADMIN);
}

/**
 * Check if a user can manage other users
 */
export function canManageUsers(user: User): boolean {
  return hasAnyPermission(user, [
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_USER_ROLES,
  ]);
}

/**
 * Check if a user can manage system settings
 */
export function canManageSystem(user: User): boolean {
  return hasPermission(user, Permission.MANAGE_SYSTEM);
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Administrator',
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.OPERATOR]: 'Operator',
    [UserRole.AUDITOR]: 'Auditor',
    [UserRole.VIEWER]: 'Viewer',
  };
  
  return roleNames[role] || role;
}

/**
 * Get permission display name for UI
 */
export function getPermissionDisplayName(permission: Permission): string {
  return permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validate if a user can access a specific resource
 */
export function canAccessResource(
  user: User,
  resource: string,
  action: 'view' | 'create' | 'update' | 'delete'
): boolean {
  const resourcePermissions: Record<string, Record<string, Permission>> = {
    users: {
      view: Permission.VIEW_USERS,
      create: Permission.CREATE_USER,
      update: Permission.UPDATE_USER,
      delete: Permission.DELETE_USER,
    },
    orders: {
      view: Permission.VIEW_ORDERS,
      create: Permission.CANCEL_ORDER, // No create for orders in admin
      update: Permission.CANCEL_ORDER,
      delete: Permission.REFUND_ORDER,
    },
    markets: {
      view: Permission.VIEW_MARKETS,
      create: Permission.CREATE_MARKET,
      update: Permission.UPDATE_MARKET,
      delete: Permission.DELETE_MARKET,
    },
    settings: {
      view: Permission.VIEW_SETTINGS,
      create: Permission.UPDATE_SETTINGS,
      update: Permission.UPDATE_SETTINGS,
      delete: Permission.UPDATE_SETTINGS,
    },
  };
  
  const permission = resourcePermissions[resource]?.[action];
  return permission ? hasPermission(user, permission) : false;
}
