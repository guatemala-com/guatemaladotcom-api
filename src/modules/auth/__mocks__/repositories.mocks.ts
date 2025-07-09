export const mockClientRepository = {
  findByClientId: jest.fn(),
};

export const mockTokenRepository = {
  generateToken: jest.fn(),
  validateToken: jest.fn(),
};
