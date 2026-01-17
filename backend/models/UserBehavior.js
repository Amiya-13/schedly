import mongoose from 'mongoose';

const userBehaviorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    action: {
        type: String,
        enum: ['view', 'click', 'register', 'cancel', 'rate'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for analytics queries
userBehaviorSchema.index({ user: 1, event: 1 });
userBehaviorSchema.index({ action: 1, timestamp: -1 });
userBehaviorSchema.index({ event: 1, action: 1 });

const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);

export default UserBehavior;
