export enum Permission {
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  POSTS_CREATE = 'posts:create',
  POSTS_VIEW = 'posts:view',
  POSTS_UPDATE = 'posts:update',
  POSTS_DELETE = 'posts:delete',

  POSTS_LIKE = 'posts:like',
  POSTS_COMMENT = 'posts:comment',
  POSTS_REPLY = 'posts:reply',

  COMMENTS_CREATE = 'comments.create',
  COMMENTS_VIEW = 'comments.view',
  COMMENTS_UPDATE = 'comments.update',
  COMMENTS_DELETE = 'comments.delete',

  LIKES_CREATE = 'likes.create',
  LIKES_VIEW = 'likes.view',
  LIKES_DELETE = 'likes.delete',

  PROFILE_READ = 'profile:read',
  PROFILE_UPDATE = 'profile:update',
}
