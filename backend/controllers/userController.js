import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Super Admin)
export const getAllUsers = async (req, res) => {
    try {
        const { role, department, search } = req.query;

        let query = {};

        if (role) query.role = role;
        if (department) query.department = department;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Super Admin)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, year, interests } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department,
            year,
            interests
        });

        res.status(201).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Super Admin)
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, year, interests, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (year) user.year = year;
        if (interests) user.interests = interests;
        if (typeof isActive !== 'undefined') user.isActive = isActive;

        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
