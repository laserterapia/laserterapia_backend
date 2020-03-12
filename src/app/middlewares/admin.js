function admin(roles = []) {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return function(req, res, next) {
    if (roles.length && (!roles.includes(req.body.role) || !req.body.role)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
}

module.exports = admin;
