import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "sign-in",
    error: "sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (credentials === null) return null;

        // logic to verify if the user exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (user && user.password) {
          // params order is important;💯
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch)
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        token.role = user.role;

        // If user has no name, use email as their default name
        if (user.name === "NO_NAME") {
          // here "!" is non null operator💯💯
          token.name = user.email!.split("@")[0];

          // Update the user in the database with the new name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }

      // Handle session updates (e.g., name change)
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
    session({ session, trigger, token }) {
      // Set the user id from token
      session.user.id = token.sub as string;
      session.user.name = token.name; // 👈 Add this line
      session.user.role = token.role; // 👈 Add this line

      // Optionally handle session updates (like name change)
      if (trigger === "update" && token.name) {
        session.user.name = token.name;
      }

      // Return the updated session object
      return session;
    },
  },
});
