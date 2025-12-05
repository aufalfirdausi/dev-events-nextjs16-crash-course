import mongoose from 'mongoose';
import connectDB from '../../lib/mongodb';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 0,
  },
}));

describe('MongoDB Connection Utility', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    (mongoose.connect as jest.Mock).mockClear();
    
    if (global.mongoose) {
      global.mongoose = { conn: null, promise: null };
    }
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleLogSpy.mockRestore();
  });

  describe('Environment Variable Validation', () => {
    test('should throw error when MONGODB_URI is undefined', () => {
      delete process.env.MONGODB_URI;
      
      expect(() => {
        jest.isolateModules(() => {
          require('../../lib/mongodb');
        });
      }).toThrow('Please define the MONGODB_URI environment variable');
    });

    test('should not throw when MONGODB_URI is defined', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      
      expect(() => {
        jest.isolateModules(() => {
          require('../../lib/mongodb');
        });
      }).not.toThrow();
    });
  });

  describe('Connection Caching', () => {
    beforeEach(() => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    });

    test('should return cached connection if available', async () => {
      const mockConnection = {} as typeof mongoose;
      global.mongoose = { conn: mockConnection, promise: null };

      const result = await connectDB();
      
      expect(result).toBe(mockConnection);
      expect(mongoose.connect).not.toHaveBeenCalled();
    });

    test('should create new connection when cache is empty', async () => {
      global.mongoose = { conn: null, promise: null };
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);

      await connectDB();
      
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test',
        { bufferCommands: false }
      );
    });

    test('should cache connection after successful connect', async () => {
      global.mongoose = { conn: null, promise: null };
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);

      await connectDB();
      
      expect(global.mongoose.conn).toBe(mongoose);
    });
  });

  describe('Connection Options', () => {
    beforeEach(() => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      global.mongoose = { conn: null, promise: null };
    });

    test('should disable bufferCommands', async () => {
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);

      await connectDB();
      
      expect(mongoose.connect).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ bufferCommands: false })
      );
    });

    test('should use correct MongoDB URI', async () => {
      const testUri = 'mongodb://testhost:27017/testdb';
      process.env.MONGODB_URI = testUri;
      
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);

      await connectDB();
      
      expect(mongoose.connect).toHaveBeenCalledWith(testUri, expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      global.mongoose = { conn: null, promise: null };
    });

    test('should reset promise on connection failure', async () => {
      const error = new Error('Connection failed');
      (mongoose.connect as jest.Mock).mockRejectedValue(error);

      await expect(connectDB()).rejects.toThrow('Connection failed');
      expect(global.mongoose.promise).toBeNull();
    });

    test('should propagate connection errors', async () => {
      const error = new Error('Network timeout');
      (mongoose.connect as jest.Mock).mockRejectedValue(error);

      await expect(connectDB()).rejects.toThrow('Network timeout');
    });

    test('should allow retry after failed connection', async () => {
      (mongoose.connect as jest.Mock).mockRejectedValueOnce(new Error('First failure'));
      await expect(connectDB()).rejects.toThrow('First failure');
      expect(global.mongoose.promise).toBeNull();

      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);
      await expect(connectDB()).resolves.toBe(mongoose);
    });
  });

  describe('Console Logging', () => {
    beforeEach(() => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      global.mongoose = { conn: null, promise: null };
    });

    test('should log success message on connection', async () => {
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);

      await connectDB();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ MongoDB connected successfully');
    });

    test('should not log when using cached connection', async () => {
      global.mongoose = { conn: mongoose, promise: null };

      await connectDB();
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Concurrent Connection Attempts', () => {
    beforeEach(() => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      global.mongoose = { conn: null, promise: null };
    });

    test('should handle multiple simultaneous requests', async () => {
      let resolveConnect: (value: typeof mongoose) => void;
      const connectPromise = new Promise<typeof mongoose>((resolve) => {
        resolveConnect = resolve;
      });

      (mongoose.connect as jest.Mock).mockReturnValue(connectPromise);

      const promise1 = connectDB();
      const promise2 = connectDB();
      const promise3 = connectDB();

      resolveConnect!(mongoose);

      const results = await Promise.all([promise1, promise2, promise3]);
      
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
      expect(results[0]).toBe(mongoose);
      expect(results[1]).toBe(mongoose);
      expect(results[2]).toBe(mongoose);
    });
  });

  describe('Connection String Formats', () => {
    beforeEach(() => {
      global.mongoose = { conn: null, promise: null };
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);
    });

    test('should handle standard MongoDB URI', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalled();
    });

    test('should handle MongoDB Atlas URI', async () => {
      process.env.MONGODB_URI = 
        'mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true';
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalled();
    });

    test('should handle URI with authentication', async () => {
      process.env.MONGODB_URI = 'mongodb://user:password@localhost:27017/testdb';
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string MONGODB_URI', () => {
      process.env.MONGODB_URI = '';
      
      expect(() => {
        jest.isolateModules(() => {
          require('../../lib/mongodb');
        });
      }).toThrow();
    });

    test('should handle very long connection URI', async () => {
      const longUri = 'mongodb://localhost:27017/' + 'a'.repeat(500);
      process.env.MONGODB_URI = longUri;
      
      global.mongoose = { conn: null, promise: null };
      (mongoose.connect as jest.Mock).mockResolvedValue(mongoose);

      await connectDB();
      
      expect(mongoose.connect).toHaveBeenCalledWith(longUri, expect.any(Object));
    });
  });
});