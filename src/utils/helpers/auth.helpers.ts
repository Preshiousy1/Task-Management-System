import { AuthUser } from '@/domains/auth/dto/auth-user.dto';
import { ContextProvider } from '@/providers';

/**
 * Returns the authenticated user
 * @returns AuthUser
 */
export const authUser = () => ContextProvider.getAuthUser() as AuthUser;

/**
 * Check if the authenticated user an admin
 * @returns boolean
 */
export const isAdmin = () => AuthUser.isAdmin(authUser());

/**
 * Compares authenticated user ID with resource owner ID
 * @param ownerId
 * @returns boolean
 */
export const isAdminOrResourceOwner = (ownerId: string) =>
  AuthUser.isAdminOrResourceOwner(authUser(), ownerId);
