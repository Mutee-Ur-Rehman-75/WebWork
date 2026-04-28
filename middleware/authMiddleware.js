import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // Log cookies for debugging
    console.log("Cookies:", req.cookies);

    // ✅ Fix: use bracket syntax for cookie with hyphen
    const cookieToken = req.cookies?.["jwt-token"];
    const headerAuth = req.headers.authorization;

    let token;

    // ✅ Priority: Authorization header → cookie
    if (headerAuth && headerAuth.startsWith("Bearer ")) {
      token = headerAuth.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded payload

    console.log("Decoded user:", decoded);
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};