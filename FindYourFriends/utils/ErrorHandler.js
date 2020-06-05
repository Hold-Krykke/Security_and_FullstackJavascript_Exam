/**
 * Takes A runtime error with graphQLErrors and networkError properties
 */
const handleError = ({ graphQLErrors, networkError }) => {
  let errorMessage;
  if (graphQLErrors) {
    graphQLErrors.map((err, index) => {
      console.log(
        "ERROR IN HANDLE-ERROR",
        `\nERROR NUMBER ${index}\n`,
        JSON.stringify({ err }, null, 4)
      );
      const { message, locations, path } = err;
      const code = err.extensions.code;
      const errorMap = (code) => {
        const _errorMap = {
          UNAUTHENTICATED: () => {
            return {
              message,
              title: "Unauthenticated",
            };
          },
          FORBIDDEN: () => {
            return {
              message,
              title: "Unauthorized action",
            };
          },
          BAD_USER_INPUT: () => {
            return {
              message,
              title: "Bad user input",
            };
          },
          DEFAULT: () => {
            return {
              title: "An Error Occurred",
              message,
            };
          },
        };
        return (_errorMap[code] || _errorMap["DEFAULT"])();
      };
      errorMessage = errorMap(code);
    });
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
  return errorMessage;
};

export default handleError;
