// -----------------------------------------------------------------------------
// Custom API Error Class
// -----------------------------------------------------------------------------
// Node.js provides a built-in Error class, but in a real project you often need
// a consistent error shape for the entire application (status code, success flag,
// optional extra details, etc.).  By extending the native Error, we can enforce
// a single pattern for every API error—so whether an error is thrown from a
// controller, a service, or a middleware, the HTTP response can be uniform.
//
// Why this is valuable in a project:
//   • Centralizes error formatting: the frontend always receives the same keys
//     (statusCode, message, errors, etc.).
//   • Easier logging and debugging because the stack trace is preserved.
//   • Prevents situations where some parts of the code only send a message while
//     others send different fields.
// -----------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something Went Wrong!",
    errors = [],
    stack = ""
  ) {
    // Call the parent Error constructor so that the standard `message` property
    // and built-in error behavior are correctly initialized.
    super(message);

    // HTTP status code to send back in the response (e.g., 400, 404, 500).
    this.statusCode = statusCode;

    // Optional additional data; null by default to signal “no payload”.
    this.data = null;

    // Reassign message so it’s accessible even if code inspects this.message directly.
    this.message = message;

    // Indicates the API request failed; useful for JSON responses like { success: false }.
    this.success = false;

    // Array of extra error details (field validation errors, etc.).
    this.errors = errors;

    if (stack) {
      // If a custom stack trace string was passed, use that instead of the default.
      this.stack = stack;
    } else {
      // Otherwise capture the stack trace starting from this constructor,
      // which keeps the trace clean by skipping the constructor call itself.
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export so other parts of the application can throw new ApiError(...)
export { ApiError };
