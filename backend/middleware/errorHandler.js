const errorHandler = (err, req, res, next) => {
    // If headers are already sent, delegate to the default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Use err.statusCode if available, otherwise default to 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;

    // Log the full error details for debugging purposes, regardless of environment
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Error (${statusCode}):`, err);

    const errorResponse = {
        message: err.message || 'An unexpected error occurred.',
    };

    // Only include the stack trace in the response during development for easier debugging
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
    } else {
        // In production, provide generic messages for server errors to avoid leaking implementation details
        if (statusCode === 500) {
            errorResponse.message = 'A server error occurred. Please try again later.';
        }
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
