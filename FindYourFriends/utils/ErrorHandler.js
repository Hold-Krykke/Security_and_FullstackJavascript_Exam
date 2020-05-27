/**
 * Takes A runtime error with graphQLErrors and networkError properties
 */
const handleError = ({ graphQLErrors, networkError }) => {
  let errorMessage = {
    title: "An Error Occurred",
    message: "",
  };
  if (graphQLErrors) {
    // console.log("HANDLE ERROR:", JSON.stringify({ graphQLErrors }, null, 4));
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
          // Unauthenticated Error from backend.
          // Add logic here like "If not authenticated, send to login-page"
          // And set errorMessage to user via setError,
          // that they tried something that required login, but they weren't logged in
          errorMessage = {
            message,
            title: "Unauthenticated",
          };
          break;
        case "FORBIDDEN":
          // ForbiddenError from backend.
          // Should probably also send to login.
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
          // Open Alert box with message.
          errorMessage.message = message + "\n";
          break;
      }
    });
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
  return errorMessage;
};

export default handleError;
