import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import dbConnect from "@/lib/mongodb";
import User from "@/database/user.model";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        // Find user and explicitly select password field
        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Compare password using the method we defined in the model
        const isPasswordValid = await user.comparePassword(
          credentials.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object (password will be excluded from session)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to JWT token on sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from JWT to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "instructor";
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
