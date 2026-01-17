import Event from '../models/Event.js';
import User from '../models/User.js';

// Calculate similarity score between two arrays (Jaccard similarity)
const calculateSimilarity = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
        return 0;
    }

    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
};

// @desc    Get recommended events for student
// @route   GET /api/recommendations
// @access  Private (Student only)
export const getRecommendedEvents = async (req, res) => {
    try {
        // Get student's interests
        const student = await User.findById(req.user._id);

        if (!student || student.role !== 'Student') {
            return res.status(403).json({
                status: 'error',
                message: 'Only students can get recommendations'
            });
        }

        const interests = student.interests || [];

        if (interests.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Please update your interests to get personalized recommendations',
                data: { recommendations: [] }
            });
        }

        // Get all published events
        const events = await Event.find({ status: 'Published' })
            .populate('organizer', 'name department');

        // Calculate similarity score for each event
        const scoredEvents = events.map(event => {
            // Combine category and tags for matching
            const eventKeywords = [event.category, ...event.tags];

            const score = calculateSimilarity(interests, eventKeywords);

            return {
                event,
                score,
                matchedInterests: interests.filter(interest =>
                    eventKeywords.some(keyword => keyword.toLowerCase().includes(interest.toLowerCase()))
                )
            };
        });

        // Sort by score (highest first) and filter events with score > 0
        const recommendations = scoredEvents
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10) // Top 10 recommendations
            .map(item => ({
                ...item.event.toObject(),
                recommendationScore: Math.round(item.score),
                matchedInterests: item.matchedInterests
            }));

        res.status(200).json({
            status: 'success',
            results: recommendations.length,
            data: {
                recommendations,
                studentInterests: interests
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get all published events (for browsing)
// @route   GET /api/recommendations/browse
// @access  Private (Student only)
export const browseEvents = async (req, res) => {
    try {
        const { category, search, sortBy = 'startDate', order = 'asc' } = req.query;

        let query = { status: 'Published' };

        // Filter by category if provided
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search by title, description, or tags
        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Determine sort order
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = {};

        if (sortBy === 'registrations') {
            sortOptions.registrationCount = sortOrder;
        } else if (sortBy === 'capacity') {
            sortOptions.capacity = sortOrder;
        } else {
            sortOptions.startDate = sortOrder;
        }

        const events = await Event.find(query)
            .populate('organizer', 'name department')
            .sort(sortOptions);

        res.status(200).json({
            status: 'success',
            results: events.length,
            data: { events }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
