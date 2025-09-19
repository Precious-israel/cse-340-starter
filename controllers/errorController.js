exports.throwError = (req, res, next) => {
  try {
    throw new Error("This is an intentional 500 error.");
  } catch (error) {
    error.status = 500;
    next(error);
  }
};
