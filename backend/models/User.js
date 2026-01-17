import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['Super Admin', 'College Admin', 'Faculty Mentor', 'Event Organizer', 'Student'],
        required: [true, 'Role is required']
    },
    department: {
        type: String,
        required: function () {
            return ['Faculty Mentor', 'Event Organizer', 'Student'].includes(this.role);
        }
    },
    year: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
            return this.role === 'Student';
        }
    },
    interests: {
        type: [String],
        default: [],
        required: function () {
            return this.role === 'Student';
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
