import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['Create', 'Update', 'Submit', 'Approve', 'Reject', 'Publish', 'Complete', 'Archive'],
        required: true
    },
    fromStatus: {
        type: String
    },
    toStatus: {
        type: String
    },
    remarks: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for queries
auditLogSchema.index({ event: 1, timestamp: -1 });
auditLogSchema.index({ actor: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
