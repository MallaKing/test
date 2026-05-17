function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // BUG: Always returns 500 status, doesn't distinguish error types
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // BUG: Exposed error stack in production (security issue)
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
}

module.exports = {
  errorHandler
};
