export enum Role {
  ADMIN = 'admin',
  CLIENT = 'client',
  READ_ONLY = 'read_only'
}

export enum Permission {
  // Notification permissions
  READ_NOTIFICATIONS = 'read:notifications',
  READ_NOTIFICATION = 'read:notification',
  REPLAY_NOTIFICATION = 'replay:notification',
  
  // Subscription permissions
  MANAGE_SUBSCRIPTIONS = 'manage:subscriptions',
  
  // Admin permissions
  MANAGE_CLIENTS = 'manage:clients',
  VIEW_LOGS = 'view:logs'
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.READ_NOTIFICATIONS,
    Permission.READ_NOTIFICATION,
    Permission.REPLAY_NOTIFICATION,
    Permission.MANAGE_SUBSCRIPTIONS,
    Permission.MANAGE_CLIENTS,
    Permission.VIEW_LOGS
  ],
  [Role.CLIENT]: [
    Permission.READ_NOTIFICATIONS,
    Permission.READ_NOTIFICATION,
    Permission.REPLAY_NOTIFICATION,
    Permission.MANAGE_SUBSCRIPTIONS
  ],
  [Role.READ_ONLY]: [
    Permission.READ_NOTIFICATIONS,
    Permission.READ_NOTIFICATION
  ]
}; 