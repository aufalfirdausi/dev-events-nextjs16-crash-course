import mongoose, { Error as MongooseError } from 'mongoose';
import Event, { IEvent } from '../../database/event.model';

// Mock mongoose connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    models: {},
    model: jest.fn(),
  };
});

describe('Event Model', () => {
  let mockEvent: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      overview: 'Test Overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-31',
      time: '14:30',
      mode: 'online',
      audience: 'Developers',
      agenda: ['Item 1', 'Item 2'],
      organizer: 'Test Organizer',
      tags: ['tag1', 'tag2'],
      isModified: jest.fn(),
      save: jest.fn(),
    };
  });

  describe('Schema Validation - Required Fields', () => {
    test('should require title', () => {
      const event = new Event({
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.title).toBeDefined();
      expect(error?.errors?.title?.message).toContain('Title is required');
    });

    test('should require description', () => {
      const event = new Event({
        title: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.description).toBeDefined();
    });

    test('should require all mandatory fields', () => {
      const requiredFields = [
        'title', 'description', 'overview', 'image', 'venue',
        'location', 'date', 'time', 'mode', 'audience', 'agenda',
        'organizer', 'tags'
      ];

      requiredFields.forEach(field => {
        const data: any = {
          title: 'Test',
          description: 'Test',
          overview: 'Test',
          image: 'test.jpg',
          venue: 'Test',
          location: 'Test',
          date: '2024-12-31',
          time: '14:30',
          mode: 'online',
          audience: 'Test',
          agenda: ['Item'],
          organizer: 'Test',
          tags: ['tag'],
        };
        
        delete data[field];
        const event = new Event(data);
        const error = event.validateSync();
        expect(error?.errors?.[field]).toBeDefined();
      });
    });

    test('should pass with all required fields present', () => {
      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        overview: 'Test Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Developers',
        agenda: ['Item 1'],
        organizer: 'Test Organizer',
        tags: ['tag1'],
      });

      const error = event.validateSync();
      expect(error).toBeUndefined();
    });
  });

  describe('Mode Enum Validation', () => {
    test('should accept online mode', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.mode).toBeUndefined();
    });

    test('should accept offline mode', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'offline',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.mode).toBeUndefined();
    });

    test('should accept hybrid mode', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'hybrid',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.mode).toBeUndefined();
    });

    test('should reject invalid mode', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'invalid-mode' as any,
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.mode).toBeDefined();
    });
  });

  describe('Array Validation - Agenda', () => {
    test('should require at least one agenda item', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: [],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.agenda).toBeDefined();
      expect(error?.errors?.agenda?.message).toContain('at least one item');
    });

    test('should accept multiple agenda items', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item 1', 'Item 2', 'Item 3'],
        organizer: 'Test',
        tags: ['tag'],
      });

      const error = event.validateSync();
      expect(error?.errors?.agenda).toBeUndefined();
      expect(event.agenda).toHaveLength(3);
    });
  });

  describe('Array Validation - Tags', () => {
    test('should require at least one tag', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: [],
      });

      const error = event.validateSync();
      expect(error?.errors?.tags).toBeDefined();
      expect(error?.errors?.tags?.message).toContain('at least one item');
    });

    test('should accept multiple tags', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['javascript', 'typescript', 'react'],
      });

      const error = event.validateSync();
      expect(error?.errors?.tags).toBeUndefined();
      expect(event.tags).toHaveLength(3);
    });
  });

  describe('Slug Generation', () => {
    test('should generate slug from simple title', () => {
      const title = 'Test Event Title';
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(slug).toBe('test-event-title');
    });

    test('should handle title with special characters', () => {
      const title = 'Test @Event #2024: Special!';
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(slug).toBe('test-event-2024-special');
    });

    test('should handle title with multiple spaces', () => {
      const title = 'Test    Event    With    Spaces';
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(slug).toBe('test-event-with-spaces');
    });

    test('should remove leading and trailing hyphens', () => {
      const title = '---Test Event---';
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(slug).toBe('test-event');
    });
  });

  describe('Date Validation', () => {
    test('should accept valid ISO date', () => {
      const date = '2024-12-31';
      const parsedDate = new Date(date);
      expect(isNaN(parsedDate.getTime())).toBe(false);
    });

    test('should detect invalid date', () => {
      const date = 'invalid-date';
      const parsedDate = new Date(date);
      expect(isNaN(parsedDate.getTime())).toBe(true);
    });

    test('should handle leap year date', () => {
      const date = '2024-02-29';
      const parsedDate = new Date(date);
      expect(isNaN(parsedDate.getTime())).toBe(false);
    });
  });

  describe('Time Validation', () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    test('should accept valid 24-hour format', () => {
      expect(timeRegex.test('14:30')).toBe(true);
      expect(timeRegex.test('00:00')).toBe(true);
      expect(timeRegex.test('23:59')).toBe(true);
    });

    test('should reject invalid hours', () => {
      expect(timeRegex.test('24:00')).toBe(false);
      expect(timeRegex.test('25:30')).toBe(false);
    });

    test('should reject invalid minutes', () => {
      expect(timeRegex.test('14:60')).toBe(false);
    });

    test('should reject time without colon', () => {
      expect(timeRegex.test('1430')).toBe(false);
    });
  });

  describe('Schema Options', () => {
    test('should have timestamps enabled', () => {
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      expect(event.schema.options.timestamps).toBe(true);
    });

    test('should have unique index on slug', () => {
      const indexes = Event.schema.indexes();
      const slugIndex = indexes.find((idx) => idx[0]?.slug === 1);
      expect(slugIndex).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      const event = new Event({
        title: longString,
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: ['Item'],
        organizer: 'Test',
        tags: ['tag'],
      });

      expect(event.title).toBe(longString);
    });

    test('should handle large arrays', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const event = new Event({
        title: 'Test',
        description: 'Test',
        overview: 'Test',
        image: 'test.jpg',
        venue: 'Test',
        location: 'Test',
        date: '2024-12-31',
        time: '14:30',
        mode: 'online',
        audience: 'Test',
        agenda: largeArray,
        organizer: 'Test',
        tags: ['tag'],
      });

      expect(event.agenda).toHaveLength(100);
    });
  });
});