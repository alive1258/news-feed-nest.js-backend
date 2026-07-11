import { Permission } from 'src/auth/enums/permission-type.enum';
import { Role } from 'src/auth/enums/role-type.enum';

export const RoleHierarchy: Record<Role, readonly Role[]> = {
  [Role.ADMIN]: [Role.USER],
  [Role.USER]: [],
} as const;

export const RoleBasedPermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [],
  [Role.USER]: [
    Permission.POSTS_CREATE,
    Permission.POSTS_VIEW,
    Permission.POSTS_UPDATE,
    Permission.POSTS_DELETE,

    Permission.COMMENTS_CREATE,
    Permission.COMMENTS_VIEW,
    Permission.COMMENTS_UPDATE,
    Permission.COMMENTS_DELETE,

    Permission.LIKES_CREATE,
    Permission.LIKES_VIEW,
    Permission.LIKES_DELETE,

    Permission.POSTS_LIKE,
    Permission.POSTS_COMMENT,
    Permission.POSTS_REPLY,
  ],
};
