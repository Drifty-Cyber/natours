//GOAL: CATCH ASYNCHRONOUS ERRORS
// module.exports = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next); /*SAME AS: (err) => next(err)*/
//   };
// };

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
