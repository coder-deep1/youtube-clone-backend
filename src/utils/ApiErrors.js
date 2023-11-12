class ApiError extends Error {
  constructor(
    statuscode,
    massage = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(massage);
    this.statuscode = statuscode;
    this.data = null;
    this.message = massage;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
