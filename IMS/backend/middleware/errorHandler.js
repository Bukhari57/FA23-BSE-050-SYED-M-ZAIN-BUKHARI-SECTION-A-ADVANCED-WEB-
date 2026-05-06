function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.status || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
