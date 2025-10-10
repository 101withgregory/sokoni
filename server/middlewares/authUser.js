import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized - No Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.userId = decoded.id;
    next(); // call next ONCE, only after successful auth
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token verification failed" });
  }
};

export default authUser;
