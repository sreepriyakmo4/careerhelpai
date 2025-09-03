import { Inngest } from "inngest";
import { db } from "../lib/db.js";

export const generateIndustryInsights = inngest.createFunction(
    { name: "Generate Industry Insights" },
    { cron: "0 0 * * 0" }, 
    async ({ step}) => {
      const industries = await step.run("Fetch Industries", async () => {
        return await db.industryInsight.findMany({
            select: { industry: true, nextUpdate: true },
        });
    });
    
}
);