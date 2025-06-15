const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });

  // Capture original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info(`${req.method} ${req.url} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      statusCode: res.statusCode
    });

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = {
  requestLogger
};
