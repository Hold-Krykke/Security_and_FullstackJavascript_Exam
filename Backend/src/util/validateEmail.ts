const validateEmail = (email: string): string | Boolean => {
  // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
  return /^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );
};
export default validateEmail;
