import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "./db";
import User from "@/models/User";

export async function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return null;
  }

  await connectDB();
  const user = await User.findOne({ apiKey });

  return user;
}
