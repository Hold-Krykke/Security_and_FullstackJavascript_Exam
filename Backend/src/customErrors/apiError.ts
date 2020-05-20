// Apollo Predefined Errors:
// https://www.apollographql.com/docs/apollo-server/data/errors/

class ApiError extends Error {
  constructor(msg: string, public errorCode?: number) {
    super(msg);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
    this.name = "ApiError";
    this.errorCode = errorCode || 500;
  }
}

export { ApiError };
