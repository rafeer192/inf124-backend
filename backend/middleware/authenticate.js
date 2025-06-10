function authenticate(req, res, next) {
  if (req.session && req.session.user && req.session.user.id) {
    // Attach user id to req for convenience
    req.user = { id: req.session.user.id };
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Please log in." });
  }
}

module.exports = authenticate;