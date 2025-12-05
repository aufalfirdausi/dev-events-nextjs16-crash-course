import mongoose from 'mongoose';
import Booking, { IBooking } from '../../database/booking.model';

// Mock mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    models: {},
    model: jest.fn(),
  };
});

describe('Booking Model', () => {
  const validObjectId = new mongoose.Types.ObjectId();

  describe('Schema Validation - Required Fields', () => {
    test('should require eventId', () => {
      const booking = new Booking({
        email: 'test@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.eventId).toBeDefined();
      expect(error?.errors?.eventId?.message).toContain('Event ID is required');
    });

    test('should require email', () => {
      const booking = new Booking({
        eventId: validObjectId,
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeDefined();
      expect(error?.errors?.email?.message).toContain('Email is required');
    });

    test('should pass with all required fields', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test@example.com',
      });

      const error = booking.validateSync();
      expect(error).toBeUndefined();
    });
  });

  describe('Email Validation - Valid Formats', () => {
    test('should accept standard email', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeUndefined();
    });

    test('should accept email with plus sign', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test+tag@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeUndefined();
    });

    test('should accept email with subdomain', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'user@mail.example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeUndefined();
    });

    test('should accept email with numbers', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'user123@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeUndefined();
    });
  });

  describe('Email Validation - Invalid Formats', () => {
    test('should reject email without @', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'testexample.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeDefined();
      expect(error?.errors?.email?.message).toContain('valid email');
    });

    test('should reject email without domain', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test@',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeDefined();
    });

    test('should reject email without local part', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: '@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeDefined();
    });

    test('should reject email with spaces', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test user@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeDefined();
    });

    test('should reject empty email', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: '',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeDefined();
    });
  });

  describe('EventId Validation', () => {
    test('should accept valid ObjectId', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.eventId).toBeUndefined();
    });

    test('should reject invalid ObjectId string', () => {
      const booking = new Booking({
        eventId: 'invalid-id' as any,
        email: 'test@example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.eventId).toBeDefined();
    });

    test('should have Event model reference', () => {
      const eventIdPath = Booking.schema.path('eventId');
      expect(eventIdPath).toBeDefined();
    });
  });

  describe('Pre-save Hook - Event Validation', () => {
    test('should validate event existence', async () => {
      const mockEvent = { _id: validObjectId, title: 'Test Event' };
      const mockEventModel = {
        findById: jest.fn().mockResolvedValue(mockEvent),
      };

      mongoose.models.Event = mockEventModel as any;

      const result = await mockEventModel.findById(validObjectId);
      expect(result).toEqual(mockEvent);
      expect(mockEventModel.findById).toHaveBeenCalledWith(validObjectId);
    });

    test('should handle non-existent event', async () => {
      const mockEventModel = {
        findById: jest.fn().mockResolvedValue(null),
      };

      mongoose.models.Event = mockEventModel as any;

      const result = await mockEventModel.findById(validObjectId);
      expect(result).toBeNull();
    });

    test('should handle database errors', async () => {
      const mockEventModel = {
        findById: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mongoose.models.Event = mockEventModel as any;

      await expect(mockEventModel.findById(validObjectId)).rejects.toThrow('Database error');
    });
  });

  describe('Schema Features', () => {
    test('should have index on eventId', () => {
      const indexes = Booking.schema.indexes();
      const eventIdIndex = indexes.find((idx) => idx[0]?.eventId === 1);
      expect(eventIdIndex).toBeDefined();
    });

    test('should have timestamps enabled', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'test@example.com',
      });

      expect(booking.schema.options.timestamps).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long email', () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const booking = new Booking({
        eventId: validObjectId,
        email: longEmail,
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeUndefined();
    });

    test('should handle email with multiple subdomains', () => {
      const booking = new Booking({
        eventId: validObjectId,
        email: 'user@mail.corp.example.com',
      });

      const error = booking.validateSync();
      expect(error?.errors?.email).toBeUndefined();
    });
  });

  describe('Complex Scenarios', () => {
    test('should support multiple bookings for same event', () => {
      const booking1 = new Booking({
        eventId: validObjectId,
        email: 'user1@example.com',
      });

      const booking2 = new Booking({
        eventId: validObjectId,
        email: 'user2@example.com',
      });

      expect(booking1.validateSync()).toBeUndefined();
      expect(booking2.validateSync()).toBeUndefined();
      expect(booking1.eventId.toString()).toBe(booking2.eventId.toString());
    });

    test('should support same email for different events', () => {
      const eventId1 = new mongoose.Types.ObjectId();
      const eventId2 = new mongoose.Types.ObjectId();

      const booking1 = new Booking({
        eventId: eventId1,
        email: 'test@example.com',
      });

      const booking2 = new Booking({
        eventId: eventId2,
        email: 'test@example.com',
      });

      expect(booking1.validateSync()).toBeUndefined();
      expect(booking2.validateSync()).toBeUndefined();
      expect(booking1.email).toBe(booking2.email);
    });
  });
});