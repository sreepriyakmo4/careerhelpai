"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

/**     
 * Update onboarding/profile data for the current user
 */
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await db.$transaction(
      async (tx) => {
        // Check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: { industry: data.industry },
        });

        // If industry doesn't exist, create it
        if (!industryInsight) {
           const insights = await generateAIInsights(data.industry);
          
              industryInsight = await db.industryInsight.create({
                data: {
                  industry: data.industry,
                  ...insights,
                  nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
              });
          
        }

        // ✅ Ensure experience is number and skills is array
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry: data.industry,
            experience: data.experience ? Number(data.experience) : null,
            bio: data.bio,
            skills: Array.isArray(data.skills)
              ? data.skills
              : data.skills
              ? data.skills.split(",").map((s) => s.trim())
              : [],
          },
        });

        return { updatedUser, industryInsight };
      },
      { timeout: 10000 }
    );

    revalidatePath("/dashboard");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error(error.message || "Failed to update profile");
  }
}
   
/**
 * Check if current user has completed onboarding
 */
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    return !!user?.industry; // ✅ return a simple boolean
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

