// Create a request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Override end method to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
    originalEnd.apply(res, args);
  };
  
  next();
};

module.exports = requestLogger;
