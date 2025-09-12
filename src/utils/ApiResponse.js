// -----------------------------------------------------------------------------
// Standard API Response Class
// -----------------------------------------------------------------------------
// Purpose:
//   Provide a single, consistent structure for successful (or informational)
//   HTTP responses across the entire project. Instead of each controller
//   returning slightly different objects, every endpoint can wrap its result
//   inside an ApiResponse, making it easier for front-end clients and other
//   services to consume.
//
// Benefits to the project:
//   • Uniform JSON output: { statusCode, message, data, success }
//   • Simplifies front-end logic—clients can always check `success` first.
//   • Encourages clear, predictable responses and easier maintenance.
// -----------------------------------------------------------------------------

class ApiResponse {
  constructor(statusCode, data, message = "Success", success) {
    // Numeric HTTP status code (e.g., 200, 201, 204).
    // Lets the global response handler set the proper HTTP status automatically.
    this.statusCode = statusCode;

    // Human-readable message describing the outcome
    // (default is "Success", but you can override per use case).
    this.message = message;

    // The actual payload to send back—could be an object, array, or primitive.
    this.data = data;

    // Boolean flag that indicates whether the request was successful.
    // We derive it directly from the status code: any code < 400 is a success.
    // This means callers don’t have to manually pass `success`.
    this.success = statusCode < 400;
  }
}

// Export so controllers can do:  return new ApiResponse(200, userData, "User fetched");
export { ApiResponse };
