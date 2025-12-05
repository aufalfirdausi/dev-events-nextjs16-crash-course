import { Schema, model, models, Document, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to validate event existence
BookingSchema.pre('save', async function (next) {
  // Only validate if eventId is new or modified
  if (this.isModified('eventId')) {
    try {
      // Import Event model dynamically to avoid circular dependency
      const Event = models.Event || (await import('./event.model')).default;
      
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        return next(new Error('Referenced event does not exist'));
      }
    } catch (error) {
      return next(
        error instanceof Error ? error : new Error('Event validation failed')
      );
    }
  }

  next();
});

// Create index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

// Use existing model if it exists (prevents recompilation issues in development)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
