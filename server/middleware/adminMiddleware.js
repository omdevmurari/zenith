const admin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "owner")) {
    next();
  } else {
    res.status(403).json({ message: "Admin only" });
  }
};

export default admin;
