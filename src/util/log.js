export const makeError = (klass, message) => {
  throw new Error(`ERROR - drishti:${klass} - ${message}`);
};
