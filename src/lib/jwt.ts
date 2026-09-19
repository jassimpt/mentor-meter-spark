import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "my-super-secret-key";

export function createAccessToken(userId: string) {
  return jwt.sign({ sub: userId, type: "access" }, SECRET, { expiresIn: "30d" });
}

export function createRefreshToken(userId: string) {
  return jwt.sign({ sub: userId, type: "refresh" }, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
}
