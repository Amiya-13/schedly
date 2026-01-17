import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social', 'Other']
    },
    tags: {
        type: [String],
        default: []
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Faculty Approved', 'Faculty Rejected', 'Admin Approved', 'Published', 'Completed', 'Archived'],
        default: 'Draft'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    venue: {
        type: String,
        required: [true, 'Venue is required']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: 1
    },
    registrationCount: {
        type: Number,
        default: 0
    },
    bannerImage: {
        type: String,
        default: ''
    },
    // Faculty approval workflow
    facultyReview: {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        remarks: String
    },
    // Admin approval workflow
    adminApproval: {
        approver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        remarks: String
    },
    // Completion tracking
    completedAt: Date,
    archivedAt: Date
}, {
    timestamps: true
});

// Index for better query performance
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
    return this.registrationCount >= this.capacity;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
