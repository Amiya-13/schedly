import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    attended: {
        type: Boolean,
        default: false
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

// Index for queries
registrationSchema.index({ event: 1 });
registrationSchema.index({ student: 1 });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
