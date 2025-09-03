"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Ask Gemini to return ONLY Prisma-valid enums (uppercase).
 */
export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "MEDIUM" | "LOW",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    
    IMPORTANT RULES:
    - Return ONLY the JSON (no markdown, no text).
    - Enums MUST be UPPERCASE (HIGH/MEDIUM/LOW, POSITIVE/NEUTRAL/NEGATIVE).
    - Include at least 5 common roles for salaryRanges.
    - Growth rate should be a percentage (number).
    - Include at least 5 skills and 5 trends.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  const insights = JSON.parse(cleanedText);

  // 🔒 Safety net: normalize enums in case Gemini still slips
  const normalizeEnum = (value, allowed) => {
    if (!value) return null;
    const upper = value.toUpperCase();
    return allowed.includes(upper) ? upper : null;
  };

  return {
    ...insights,
    demandLevel: normalizeEnum(insights.demandLevel, ["HIGH", "MEDIUM", "LOW"]),
    marketOutlook: normalizeEnum(insights.marketOutlook, [
      "POSITIVE",
      "NEUTRAL",
      "NEGATIVE",
    ]),
  };
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
