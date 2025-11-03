import { NuxtAuthHandler } from "#auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "~/server/models/User";

async function getUser(id: string) {
  const user = await User.findById(id);

  return user?.toJSON();
}

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    // @ts-expect-error
    CredentialsProvider.default({
      name: "credentials",
      origin: useRuntimeConfig().auth.origin,
      async authorize(credential: { email: string; password: string }) {
        // Authorize the user

        const email = credential.email?.trim().toLowerCase();
        const password = credential.password;

        if (!email || !password) {
          return null;
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          return null;
        }

        const isValid = await user.comparePassword(password);

        if (!isValid) {
          return null;
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const { password: _password, ...sanitizedUser } = user.toObject();

        return sanitizedUser;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }

      return token;
    },

    async session({ session, token }) {
      // @ts-expect-error
      const refreshedUser = await getUser(token._id);

      session.user = {
        ...token,
        ...session.user,
        ...refreshedUser,
      };

      return session;
    },
  },
});
