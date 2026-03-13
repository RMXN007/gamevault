
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}

// const asyncHandler = (requestHandler) => {
//     return async (req, res, next) => {
//         try {
//             await requestHandler(req, res, next)
//         }
//         catch (error) {
//             console.log(error);
//             res.status(error.statusCode || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
// }



export { asyncHandler }