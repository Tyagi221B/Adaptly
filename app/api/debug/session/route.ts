import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    authenticated: !!session,
    session: session
      ? {
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            isAdmin: session.user.isAdmin,
          },
        }
      : null,
  });
}
