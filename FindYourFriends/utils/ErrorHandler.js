/**
 * Takes A runtime error with graphQLErrors and networkError properties
 */
const handleError = ({ graphQLErrors, networkError }) => {
  let errorMessage = {
    title: "An Error Occurred",
    message: "",
  };
  if (graphQLErrors) {
    graphQLErrors.map((err, index) => {
      console.log(
        "ERROR IN HANDLE-ERROR",
        `\nERROR NUMBER ${index}\n`,
        JSON.stringify({ err }, null, 4)
      );
      const { message, locations, path } = err;
      const code = err.extensions.code;
      switch (code) {
        case "UNAUTHENTICATED":
          errorMessage = {
            message,
            title: "Unauthenticated",
          };
          break;
        case "FORBIDDEN":
          errorMessage = {
            message,
            title: "Unauthorized action",
          };
          break;
        case "BAD_USER_INPUT":
          errorMessage = {
            message: `Following fields were wrong: 
                  ${err.extensions.exception.invalidArgs}
                  \n${message}\n`,
            title: "Bad user input",
          };
          break;
        default:
          errorMessage.message = message + "\n";
          break;
      }
    });
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
  return errorMessage;
};

export default handleError;
