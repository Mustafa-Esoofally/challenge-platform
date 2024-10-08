import { createRedisClient } from "@/app/api/utils";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { ChallengeStatus } from "@/app/types";
import { checkAdminAuth } from "@/app/api/utils/auth";

export interface CreateChallengeRequest {
  email: string;
  duration: number; // Duration in seconds
  challengeDescription: string;
}

export async function POST(req: Request) {
  // Requires admin key to be set in the cookie
  const { email, duration, challengeDescription } =
    (await req.json()) as CreateChallengeRequest; // The user's email for the challenge

  const redisClient = createRedisClient();

  // Auth by checking the redis key 'admin' and see if the token in the cookie matches
  const adminAuthKey = cookies().get("adminAuthKey")?.value;
  if (!(await checkAdminAuth(adminAuthKey, redisClient))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  // Check if a challenge status already exists for this email
  const existingStatus = await redisClient.get(`challenge:${email}`);
  if (existingStatus) {
    return new Response(
      JSON.stringify({ error: "Challenge already exists for this email" }),
      { status: 400 },
    );
  }

  // Generate a new token
  const token = crypto.randomBytes(16).toString("hex");
  const hashedToken = await bcrypt.hash(token, 10);

  // Generate a new challenge status
  const newChallengeStatus: ChallengeStatus = {
    emailAddress: email,
    hashedAuthToken: hashedToken,
    duration, // Duration should be in seconds
    challengeDescription,
    isStarted: false,
    startTime: null,
    endTime: null,
    submissions: [],
    latestSubmission: null,
  };

  // Set the challenge status in Redis
  await redisClient.set(
    `challenge:${email}`,
    JSON.stringify(newChallengeStatus),
  );

  return NextResponse.json({ token }, { status: 200 });
}
