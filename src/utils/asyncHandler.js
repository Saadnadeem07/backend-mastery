//aik async handler naam ka funciton hay jis ky paramter main aik function araha hay

const asyncHandler = (requestHandler) => {
  return (err, req, res, next) => {
    Promise.resolve(requestHandler(err, req, res, next)).catch((err) =>
      next(err)
    );
  };
};

export { asyncHandler };
//promises wala
//try cach bhi hoakta hay

// const asyncHandler = () => {};
// const asyncHandler = (func) => {
//   () => {};
// };
// // we remove brackets
// const asyncHandler = (func) => () => {};
// const asyncHandler = (func) => async () => {};

//ASYNC TRY CATCH WRAPPER

// const asyncHandler = (fn) => async (err, req, res, next) => {
//   try {
//     //jo function aya hay us ko async await ka wrapper lagaya hay bas
//     await fn(err, req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
