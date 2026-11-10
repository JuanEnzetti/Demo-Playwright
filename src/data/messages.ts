export const loginErrors = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  invalidCredentials:
    'Epic sadface: Username and password do not match any user in this service',
} as const;

export const accessErrors = {
  notLoggedIn: (path: string) =>
    `Epic sadface: You can only access '${path}' when you are logged in.`,
};
