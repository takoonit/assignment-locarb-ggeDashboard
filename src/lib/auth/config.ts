import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      await db.user.upsert({
        where: { email: user.email },
        update: {},
        create: { email: user.email },
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "VIEWER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};

export const auth = () => getServerSession(authOptions);
