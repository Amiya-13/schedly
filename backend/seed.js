import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Event from './models/Event.js';
import Category from './models/Category.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
};

const clearDatabase = async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('🗑️  Database cleared');
};

const seedUsers = async () => {
    const users = [
        // Super Admin
        {
            name: 'Super Admin',
            email: 'superadmin@schedly.com',
            password: 'admin123',
            role: 'Super Admin'
        },
        // College Admin
        {
            name: 'Dr. Sarah Johnson',
            email: 'admin@schedly.com',
            password: 'admin123',
            role: 'College Admin'
        },
        // Faculty Mentors
        {
            name: 'Prof. Michael Chen',
            email: 'faculty1@schedly.com',
            password: 'faculty123',
            role: 'Faculty Mentor',
            department: 'Computer Science'
        },
        {
            name: 'Dr. Emily Rodriguez',
            email: 'faculty2@schedly.com',
            password: 'faculty123',
            role: 'Faculty Mentor',
            department: 'Cultural Studies'
        },
        // Event Organizers
        {
            name: 'Alex Kumar',
            email: 'organizer1@schedly.com',
            password: 'organizer123',
            role: 'Event Organizer',
            department: 'Computer Science'
        },
        {
            name: 'Jessica Martinez',
            email: 'organizer2@schedly.com',
            password: 'organizer123',
            role: 'Event Organizer',
            department: 'Arts & Culture'
        },
        {
            name: 'Ryan Thompson',
            email: 'organizer3@schedly.com',
            password: 'organizer123',
            role: 'Event Organizer',
            department: 'Sports Department'
        },
        // Students
        {
            name: 'John Doe',
            email: 'student1@schedly.com',
            password: 'student123',
            role: 'Student',
            department: 'Computer Science',
            year: 3,
            interests: ['Technical', 'Workshop', 'Competition']
        },
        {
            name: 'Emma Wilson',
            email: 'student2@schedly.com',
            password: 'student123',
            role: 'Student',
            department: 'Arts',
            year: 2,
            interests: ['Cultural', 'Seminar', 'Workshop']
        },
        {
            name: 'David Lee',
            email: 'student3@schedly.com',
            password: 'student123',
            role: 'Student',
            department: 'Engineering',
            year: 4,
            interests: ['Technical', 'Competition', 'Sports']
        },
        {
            name: 'Sophia Brown',
            email: 'student4@schedly.com',
            password: 'student123',
            role: 'Student',
            department: 'Business',
            year: 1,
            interests: ['Seminar', 'Workshop', 'Social']
        }
    ];

    const createdUsers = await User.create(users);
    console.log('👥 Users created:', createdUsers.length);
    return createdUsers;
};

const seedEvents = async (users) => {
    // Get organizers
    const organizers = users.filter(u => u.role === 'Event Organizer');
    const faculty = users.filter(u => u.role === 'Faculty Mentor');
    const admin = users.find(u => u.role === 'College Admin');

    const events = [
        // Published Events
        {
            title: 'AI & Machine Learning Workshop 2026',
            description: 'Dive deep into the world of AI and ML! Learn about neural networks, deep learning, and practical applications. This hands-on workshop will cover TensorFlow, PyTorch, and real-world case studies. Perfect for students interested in cutting-edge technology.',
            category: 'Technical',
            tags: ['AI', 'Machine Learning', 'Workshop', 'Programming', 'Technology'],
            organizer: organizers[0]._id,
            status: 'Published',
            startDate: new Date('2026-02-15T10:00:00'),
            endDate: new Date('2026-02-15T16:00:00'),
            venue: 'Computer Lab 301',
            capacity: 60,
            registrationCount: 35,
            bannerImage: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80',
            facultyReview: {
                reviewer: faculty[0]._id,
                reviewedAt: new Date('2026-01-10'),
                remarks: 'Excellent technical workshop. Approved for publication.'
            },
            adminApproval: {
                approver: admin._id,
                approvedAt: new Date('2026-01-12'),
                remarks: 'Great initiative for students.'
            }
        },
        {
            title: 'Annual Cultural Fest - Rang De 2026',
            description: 'Experience the vibrant celebration of diversity! Join us for music, dance, drama, and art exhibitions. Featuring performances from talented students across all departments. Food stalls, live music, and cultural showcases from around the world.',
            category: 'Cultural',
            tags: ['Cultural', 'Music', 'Dance', 'Performance', 'Festival'],
            organizer: organizers[1]._id,
            status: 'Published',
            startDate: new Date('2026-03-20T14:00:00'),
            endDate: new Date('2026-03-22T22:00:00'),
            venue: 'Main Auditorium & Outdoor Arena',
            capacity: 500,
            registrationCount: 287,
            bannerImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
            facultyReview: {
                reviewer: faculty[1]._id,
                reviewedAt: new Date('2026-01-05'),
                remarks: 'Outstanding cultural event. Fully supported.'
            },
            adminApproval: {
                approver: admin._id,
                approvedAt: new Date('2026-01-08'),
                remarks: 'Approved with full budget allocation.'
            }
        },
        {
            title: 'Inter-College Hackathon 2026',
            description: '48-hour coding marathon! Build innovative solutions to real-world problems. Teams of 3-4 students will compete for prizes worth $10,000. Mentorship from industry experts, free food, and swag. Categories: Web Dev, Mobile Apps, AI/ML, Blockchain.',
            category: 'Competition',
            tags: ['Hackathon', 'Competition', 'Programming', 'Technical', 'Coding'],
            organizer: organizers[0]._id,
            status: 'Published',
            startDate: new Date('2026-02-28T18:00:00'),
            endDate: new Date('2026-03-02T18:00:00'),
            venue: 'Innovation Hub - Building B',
            capacity: 120,
            registrationCount: 98,
            bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
            facultyReview: {
                reviewer: faculty[0]._id,
                reviewedAt: new Date('2026-01-08'),
                remarks: 'Great opportunity for skill development.'
            },
            adminApproval: {
                approver: admin._id,
                approvedAt: new Date('2026-01-10'),
                remarks: 'Approved. Exciting event!'
            }
        },
        {
            title: 'Startup Pitch Competition',
            description: 'Got a billion-dollar idea? Present your startup concept to real investors and VCs! Top 3 teams win seed funding, mentorship, and incubation support. Learn about entrepreneurship, business models, and pitching techniques. Guest speakers from successful startups.',
            category: 'Seminar',
            tags: ['Startup', 'Entrepreneurship', 'Business', 'Competition', 'Seminar'],
            organizer: organizers[0]._id,
            status: 'Published',
            startDate: new Date('2026-03-10T09:00:00'),
            endDate: new Date('2026-03-10T17:00:00'),
            venue: 'Business School Auditorium',
            capacity: 80,
            registrationCount: 45,
            bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
            facultyReview: {
                reviewer: faculty[0]._id,
                reviewedAt: new Date('2026-01-15'),
                remarks: 'Valuable for aspiring entrepreneurs.'
            },
            adminApproval: {
                approver: admin._id,
                approvedAt: new Date('2026-01-16'),
                remarks: 'Approved with full support.'
            }
        },
        {
            title: 'Annual Sports Meet 2026',
            description: 'Unleash your athletic spirit! Compete in cricket, basketball, football, athletics, and more. Inter-departmental competition with trophies and medals. Cheerleading performances, DJ music, and food trucks. All fitness levels welcome!',
            category: 'Sports',
            tags: ['Sports', 'Competition', 'Athletics', 'Tournament'],
            organizer: organizers[2]._id,
            status: 'Published',
            startDate: new Date('2026-04-05T08:00:00'),
            endDate: new Date('2026-04-07T18:00:00'),
            venue: 'College Sports Complex',
            capacity: 300,
            registrationCount: 156,
            bannerImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
            facultyReview: {
                reviewer: faculty[0]._id,
                reviewedAt: new Date('2026-01-12'),
                remarks: 'Promotes physical fitness and team spirit.'
            },
            adminApproval: {
                approver: admin._id,
                approvedAt: new Date('2026-01-14'),
                remarks: 'Approved. Great for student wellness.'
            }
        },
        {
            title: 'Web Development Bootcamp',
            description: 'Master modern web development in 3 days! Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build a full-stack application from scratch. Industry experts as trainers. Certificate of completion provided. Limited seats!',
            category: 'Workshop',
            tags: ['Web Development', 'Workshop', 'Programming', 'Technical', 'Full Stack'],
            organizer: organizers[0]._id,
            status: 'Published',
            startDate: new Date('2026-03-15T10:00:00'),
            endDate: new Date('2026-03-17T17:00:00'),
            venue: 'Computer Lab 201',
            capacity: 50,
            registrationCount: 42,
            bannerImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
            facultyReview: {
                reviewer: faculty[0]._id,
                reviewedAt: new Date('2026-01-11'),
                remarks: 'Highly relevant technical workshop.'
            },
            adminApproval: {
                approver: admin._id,
                approvedAt: new Date('2026-01-13'),
                remarks: 'Approved.'
            }
        },
        // Faculty Approved (Awaiting Admin)
        {
            title: 'Cybersecurity Awareness Seminar',
            description: 'Learn to protect yourself online! Expert talks on data privacy, ethical hacking, malware protection, and safe browsing. Live demonstrations of common attacks and defenses. Free for all students.',
            category: 'Seminar',
            tags: ['Cybersecurity', 'Seminar', 'Technical', 'Security', 'Privacy'],
            organizer: organizers[0]._id,
            status: 'Faculty Approved',
            startDate: new Date('2026-04-10T14:00:00'),
            endDate: new Date('2026-04-10T17:00:00'),
            venue: 'Seminar Hall A',
            capacity: 100,
            registrationCount: 0,
            bannerImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
            facultyReview: {
                reviewer: faculty[0]._id,
                reviewedAt: new Date(),
                remarks: 'Important topic for digital age students.'
            }
        },
        // Submitted (Awaiting Faculty Review)
        {
            title: 'Photography Workshop - Capture the Moment',
            description: 'Professional photography masterclass covering composition, lighting, editing, and storytelling. Bring your cameras (DSLR/smartphone). Outdoor practical session included. Learn from award-winning photographers.',
            category: 'Workshop',
            tags: ['Photography', 'Workshop', 'Creative', 'Arts'],
            organizer: organizers[1]._id,
            status: 'Submitted',
            startDate: new Date('2026-04-20T09:00:00'),
            endDate: new Date('2026-04-20T16:00:00'),
            venue: 'Arts Building & Campus Grounds',
            capacity: 40,
            registrationCount: 0,
            bannerImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80'
        },
        // Draft
        {
            title: 'Blockchain & Cryptocurrency Summit',
            description: 'Understand the future of finance! Sessions on Bitcoin, Ethereum, DeFi, NFTs, and Web3. Industry experts, live trading demos, and networking opportunities.',
            category: 'Seminar',
            tags: ['Blockchain', 'Cryptocurrency', 'Technical', 'Seminar', 'Finance'],
            organizer: organizers[0]._id,
            status: 'Draft',
            startDate: new Date('2026-05-01T10:00:00'),
            endDate: new Date('2026-05-01T18:00:00'),
            venue: 'Conference Hall',
            capacity: 150,
            registrationCount: 0,
            bannerImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80'
        }
    ];

    const createdEvents = await Event.create(events);
    console.log('🎉 Events created:', createdEvents.length);
    return createdEvents;
};

const createAuditLogs = async (events, users) => {
    const logs = [];
    const admin = users.find(u => u.role === 'College Admin');
    const faculty = users.filter(u => u.role === 'Faculty Mentor');

    events.forEach(event => {
        // Create log
        logs.push({
            event: event._id,
            actor: event.organizer,
            action: 'Create',
            fromStatus: null,
            toStatus: 'Draft',
            timestamp: new Date(event.createdAt)
        });

        if (['Submitted', 'Faculty Approved', 'Published'].includes(event.status)) {
            logs.push({
                event: event._id,
                actor: event.organizer,
                action: 'Submit',
                fromStatus: 'Draft',
                toStatus: 'Submitted',
                timestamp: new Date(event.createdAt.getTime() + 86400000) // +1 day
            });
        }

        if (['Faculty Approved', 'Published'].includes(event.status)) {
            logs.push({
                event: event._id,
                actor: event.facultyReview.reviewer,
                action: 'Approve',
                fromStatus: 'Submitted',
                toStatus: 'Faculty Approved',
                remarks: event.facultyReview.remarks,
                timestamp: event.facultyReview.reviewedAt
            });
        }

        if (event.status === 'Published') {
            logs.push({
                event: event._id,
                actor: admin._id,
                action: 'Approve',
                fromStatus: 'Faculty Approved',
                toStatus: 'Published',
                remarks: event.adminApproval.remarks,
                timestamp: event.adminApproval.approvedAt
            });
        }
    });

    await AuditLog.create(logs);
    console.log('📝 Audit logs created:', logs.length);
};

const main = async () => {
    try {
        await connectDB();
        await clearDatabase();

        const users = await seedUsers();
        const events = await seedEvents(users);
        await createAuditLogs(events, users);

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📧 Login Credentials:\n');
        console.log('Super Admin:');
        console.log('  Email: superadmin@schedly.com | Password: admin123\n');
        console.log('College Admin:');
        console.log('  Email: admin@schedly.com | Password: admin123\n');
        console.log('Faculty Mentor:');
        console.log('  Email: faculty1@schedly.com | Password: faculty123');
        console.log('  Email: faculty2@schedly.com | Password: faculty123\n');
        console.log('Event Organizer:');
        console.log('  Email: organizer1@schedly.com | Password: organizer123');
        console.log('  Email: organizer2@schedly.com | Password: organizer123');
        console.log('  Email: organizer3@schedly.com | Password: organizer123\n');
        console.log('Students:');
        console.log('  Email: student1@schedly.com | Password: student123');
        console.log('  Email: student2@schedly.com | Password: student123');
        console.log('  Email: student3@schedly.com | Password: student123');
        console.log('  Email: student4@schedly.com | Password: student123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

main();
