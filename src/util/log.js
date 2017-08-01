export const makeError = (klass, message) => {
  throw new Error(`drishti:${klass} - ${message}`);
};
