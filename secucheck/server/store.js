import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function logSubmission({ category, riskLevel, flagIds, alreadyInteracted }) {
  return prisma.submission.create({
    data: { category, riskLevel, flagIds, alreadyInteracted: !!alreadyInteracted },
  });
}

export async function getAllSubmissions() {
  return prisma.submission.findMany();
}

export async function getAggregateStats() {
  const submissions = await prisma.submission.findMany();

  const byCategory = {};
  const byRisk = { low: 0, medium: 0, high: 0 };
  const flagCounts = {};

  for (const s of submissions) {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
    byRisk[s.riskLevel] = (byRisk[s.riskLevel] || 0) + 1;
    for (const flagId of s.flagIds) {
      flagCounts[flagId] = (flagCounts[flagId] || 0) + 1;
    }
  }

  return { total: submissions.length, byCategory, byRisk, flagCounts };
}