import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { connectDB } from "./db";
import User from "@/models/User";

// Extend NextAuth types to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
        });
      }
      return true;
    },

    async jwt({ token }) {
      await connectDB();
      const dbUser = await User.findOne({ email: token.email });
      if (dbUser) {
        token.plan = dbUser.plan;
        token.id = dbUser._id.toString();
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.plan = token.plan || "FREE";
        session.user.id = token.id || "";
      }
      return session;
    },
  },
};
