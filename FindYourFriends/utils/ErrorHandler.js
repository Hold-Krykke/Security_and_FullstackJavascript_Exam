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
          UNAUTHENTICATED: {
            message,
            title: "Unauthenticated",
          },
          FORBIDDEN: {
            message,
            title: "Unauthorized action",
          },
          BAD_USER_INPUT: {
            message: `Following fields were wrong: 
                  ${err.extensions.exception.invalidArgs}
                  \n${message}`,
            title: "Bad user input",
          },
        };
        return (
          _errorMap[code] || {
            title: "An Error Occurred",
            message,
          }
        );
      };
      errorMessage = errorMap(code);
    });
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
  return errorMessage;
};

export default handleError;
