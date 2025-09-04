/**
 * API management
 */

export * from './types';
export { ApiClient } from './client';

// export all services
export { AuthService } from './services/auth';
export { UserService } from './services/users';
export { OrderService } from './services/orders';
export { SystemService } from './services/system';
export { MarketService } from './services/markets';

// import all services
import { AuthService } from './services/auth';
import { UserService } from './services/users';
import { OrderService } from './services/orders';
import { SystemService } from './services/system';
import { MarketService } from './services/markets';

export const API = {
  auth: AuthService,
  users: UserService,
  orders: OrderService,
  system: SystemService,
  markets: MarketService,
} as const;

// Usage example:
// import { API } from '@/lib/api';
// 
// const response = await API.auth.login({ email, password });
// if (response.status === 'success') {
//   console.log('User:', response.body.user);
// } else {
//   console.error('Error:', response.error.message);
// }
//
// const users = await API.users.getUsers({ page: 1, limit: 10 });
// const orders = await API.orders.getOrders({ status: 'pending' });
