// Rate limiting to prevent brute force attacks and handle concurrent requests
const rateLimitMap = new Map();

// Clean up old entries every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.resetTime > 900000) { // 15 minutes
            rateLimitMap.delete(key);
        }
    }
}, 900000);

export const loginRateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + 900000 // 15 minutes
        });
        return next();
    }

    const record = rateLimitMap.get(ip);

    // Reset if time window expired
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + 900000;
        return next();
    }

    // Allow max 10 login attempts per 15 minutes
    if (record.count >= 10) {
        return res.status(429).json({
            status: 'error',
            message: 'Too many login attempts. Please try again after 15 minutes.'
        });
    }

    record.count++;
    next();
};

// General API rate limiter - 100 requests per minute
export const apiRateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `api_${ip}`;
    const now = Date.now();

    if (!rateLimitMap.has(key)) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + 60000 // 1 minute
        });
        return next();
    }

    const record = rateLimitMap.get(key);

    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + 60000;
        return next();
    }

    if (record.count >= 100) {
        return res.status(429).json({
            status: 'error',
            message: 'Too many requests. Please slow down.'
        });
    }

    record.count++;
    next();
};
