import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "student" | "instructor";
    isAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "student" | "instructor";
      isAdmin: boolean;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "instructor";
    isAdmin: boolean;
  }
}
