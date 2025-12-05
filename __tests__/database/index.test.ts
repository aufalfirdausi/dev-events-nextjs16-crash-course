import * as databaseExports from '../../database/index';

describe('Database Index Exports', () => {
  describe('Model Exports', () => {
    test('should export Event model', () => {
      expect(databaseExports.Event).toBeDefined();
      expect(typeof databaseExports.Event).toBe('function');
    });

    test('should export Booking model', () => {
      expect(databaseExports.Booking).toBeDefined();
      expect(typeof databaseExports.Booking).toBe('function');
    });
  });

  describe('Named Exports', () => {
    test('should support destructured imports', () => {
      const { Event, Booking } = databaseExports;
      expect(Event).toBeDefined();
      expect(Booking).toBeDefined();
    });

    test('should not have default export', () => {
      expect(databaseExports).not.toHaveProperty('default');
    });
  });

  describe('Model Integrity', () => {
    test('Event model should have schema', () => {
      expect(databaseExports.Event.schema).toBeDefined();
    });

    test('Booking model should have schema', () => {
      expect(databaseExports.Booking.schema).toBeDefined();
    });

    test('models should be distinct', () => {
      expect(databaseExports.Event).not.toBe(databaseExports.Booking);
    });
  });
});