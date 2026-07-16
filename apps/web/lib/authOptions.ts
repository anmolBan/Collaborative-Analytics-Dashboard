import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserSigninSchema } from "@repo/validation";
import prisma from "@repo/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Extend user type so we can include the name and accessToken in the session object
declare module "next-auth" {
    interface User {
        id: string;
        name: string;
        email: string;
        accessToken: string;
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            accessToken: string;
        };
    }
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,

    pages: {
        signIn: "/signin"
    },

    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 1 hour
    },

    jwt: {
        maxAge: 60 * 60, // 1 hour
    },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) {
                    return null;
                }

                const body = {
                    email: credentials.email,
                    password: credentials.password
                }

                const parsedBody = UserSigninSchema.safeParse(body);

                if(!parsedBody.success){
                    throw new Error("Invalid input data for user signin.");
                }

                try{
                    const user = await prisma.user.findUnique({
                        where: {
                            email: parsedBody.data.email
                        }
                    });

                    if(!user){
                        throw new Error("User not found.");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

                    if(!isPasswordValid){
                        throw new Error("Invalid password.");
                    }

                    const token = jwt.sign({userId: user.id, email: user.email, name: user.name}, process.env.JWT_SECRET!, {expiresIn: "1h"});

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        accessToken: token
                    }
                } catch(error){
                    console.error("Error during user signin:", (error as Error).message);
                    return null;
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }){
            if(user){
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.accessToken = user.accessToken;
            }
            return token;
        },

        async session({ session, token }){
            if(token){
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                    accessToken: token.accessToken as string
                }
            }
            return session;
        }
    }
}
