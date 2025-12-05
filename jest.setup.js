// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';

// Suppress console output during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};