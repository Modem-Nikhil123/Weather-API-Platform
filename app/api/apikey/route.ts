import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateApiKey } from "@/lib/generateApiKey";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const apiKey = generateApiKey();

  await User.findOneAndUpdate(
    { email: session.user.email },
    { apiKey },
    { new: true }
  );

  return NextResponse.json({ apiKey });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  await User.findOneAndUpdate(
    { email: session.user.email },
    { $unset: { apiKey: 1 } },
    { new: true }
  );

  return NextResponse.json({ message: "API key disabled" });
}
