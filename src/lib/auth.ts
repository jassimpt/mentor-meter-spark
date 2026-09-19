import { verifyToken } from "./jwt";
import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const headersList = await headers();
  const authorization = headersList.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload || payload.type !== "access" || !payload.sub) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  return user;
}
