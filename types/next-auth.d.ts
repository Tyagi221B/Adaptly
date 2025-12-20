import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "student" | "instructor";
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "student" | "instructor";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "instructor";
  }
}
