// middleware/auth.js
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers["authorization"];
  console.log("DEBUG AUTH HEADER:", header); // prints incoming Authorization header

  if (!header) return res.status(401).send({ message: "No token provided" });

  const parts = header.split(" ");
  if (parts.length !== 2) return res.status(401).send({ message: "Token error" });

  const scheme = parts[0];
  const token = parts[1];

  if (!/^Bearer$/i.test(scheme)) return res.status(401).send({ message: "Token malformatted" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("DEBUG JWT VERIFY ERROR:", err);
      return res.status(401).send({ message: "Token invalid" });
    }
    console.log("DEBUG DECODED TOKEN:", decoded);
    req.user = decoded;
    next();
  });
}

module.exports = auth;
