const {
  createUser,
  findUserByEmail,
  clearUsers,
} = require('./mocks/inMemoryUser');

describe('Authentication tests', () => {
  beforeEach(() => {
    clearUsers();
  });

  test('should create a user', () => {
    const user = createUser({
      name: 'Vani',
      email: 'vani@example.com',
      passwordHash: 'hashed-password',
      role: 'STUDENT',
    });

    expect(user.name).toBe('Vani');
    expect(user.email).toBe('vani@example.com');
    expect(user.role).toBe('STUDENT');
  });

  test('should find user by email', () => {
    createUser({
      name: 'Vani',
      email: 'vani@example.com',
      passwordHash: 'hashed-password',
      role: 'STUDENT',
    });

    const user = findUserByEmail('vani@example.com');

    expect(user).toBeDefined();
    expect(user.name).toBe('Vani');
  });

  test('should return undefined for unknown email', () => {
    const user = findUserByEmail('unknown@example.com');

    expect(user).toBeUndefined();
  });
});