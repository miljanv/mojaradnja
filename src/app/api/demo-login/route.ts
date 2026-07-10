import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@mojshop.app";
const DEMO_USERNAME = process.env.DEMO_USERNAME ?? "atelier-luna-demo";

export async function POST() {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "CLERK_SECRET_KEY nije podešen" },
        { status: 500 }
      );
    }

    const clerk = createClerkClient({ secretKey });

    let user =
      (await clerk.users.getUserList({ emailAddress: [DEMO_EMAIL], limit: 1 }))
        .data[0] ?? null;

    if (!user) {
      user =
        (
          await clerk.users.getUserList({
            username: [DEMO_USERNAME],
            limit: 1,
          })
        ).data[0] ?? null;
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Demo nalog ne postoji u ovom Clerk okruženju. Pokreni: npm run db:seed:demo",
        },
        { status: 404 }
      );
    }

    const token = await clerk.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 60 * 5,
    });

    return NextResponse.json({ token: token.token });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Demo prijava nije uspela",
      },
      { status: 500 }
    );
  }
}
