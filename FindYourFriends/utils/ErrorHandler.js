/**
 * Takes A runtime error with graphQLErrors and networkError properties
 */
const handleError = ({ graphQLErrors, networkError }) => {
  let errorMessage = {
    title: "An Error Occurred",
    message: "",
  };
  if (graphQLErrors) {
    graphQLErrors.map((err) => {
      const { message, locations, path } = err;
      switch (err.extensions.code) {
        case "UNAUTHENTICATED":
          // Unauthenticated Error from backend.
          // Add logic here like "If not authenticated, send to login-page"
          // And set errorMessage to user via setError,
          // that they tried something that required login, but they weren't logged in
          errorMessage = {
            message: message + "\n",
            title: "Unauthenticated.",
          };
        case "FORBIDDEN":
          // ForbiddenError from backend.
          // Should probably also send to login.
          errorMessage = {
            message: message + "\n",
            title: "Unauthorized action.",
          };
        case "BAD_USER_INPUT":
          errorMessage = {
            message: `Following fields were wrong: 
                  ${err.extensions.exception.invalidArgs}
                  \n${message}\n`,
            title: "Bad user input.",
          };
        default:
          // Open Alert box with message.
          errorMessage.message = message + "\n";
      }
    });
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
  return errorMessage;
};

export default handleError;
