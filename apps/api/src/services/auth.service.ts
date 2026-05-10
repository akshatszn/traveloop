import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validator.js";
import { AppError, unauthorized } from "../utils/errors.js";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  createdAt: true
} as const;

const signToken = (user: { id: string; email: string }) => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: "traveloop-api",
    audience: "traveloop-web"
  };

  return jwt.sign({ email: user.email }, env.JWT_SECRET, {
    ...options,
    subject: user.id
  });
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });

    if (existing) {
      throw new AppError(409, "EMAIL_TAKEN", "An account already exists for this email");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(input.name)}`
      },
      select: publicUserSelect
    });

    return {
      user,
      token: signToken(user)
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw unauthorized("Invalid email or password");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw unauthorized("Invalid email or password");
    }

    const publicUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: publicUserSelect
    });

    return {
      user: publicUser,
      token: signToken(user)
    };
  },

  async me(userId: string) {
    return prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: publicUserSelect
    });
  }
};
