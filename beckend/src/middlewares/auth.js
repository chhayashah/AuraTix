const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, please login" });
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Now req.user.id is available in all controllers!
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token failed, not authorized" });
  }
};
