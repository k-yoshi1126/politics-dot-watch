import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      createdAt?: Date;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    createdAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    createdAt?: Date;
  }
}

declare module "next-auth" {
  interface NextAuthConfig {
    providers: any[];
    callbacks?: {
      session?: (params: { session: Session; token: JWT }) => Promise<Session>;
    };
  }
} 