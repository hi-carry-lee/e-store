import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/sign-in", // *it's a url, so it must start with "/"
    error: "/sign-in",
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
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              /*
                ?why?
               *Reasons for this approach:
               *1. Conflict resolution: Prevents multiple carts per user, simplifying data model
               *2. Priority policy: Guest cart takes precedence over existing user cart
               *3. UX continuity: User expects to see items added before login
               *4. Data integrity: Prevents checkout and inventory management issues
               */
              // Overwrite any existing user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // ?why?
              // *Assign guest cart to authenticated user
              // *This approach is standard e-commerce practice because:
              // *- Recent shopping intent better reflects current user needs
              // *- Simplifies implementation vs complex merge strategies
              // *- Provides predictable user experience
              // Assign the guest cart to the logged-in user
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
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
