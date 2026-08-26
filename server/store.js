import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const memorySubmissions = [];
let databaseAvailable = true;

function rememberSubmission(data) {
  memorySubmissions.push({
    ...data,
    timestamp: new Date(),
  });
}

export async function logSubmission({ category, riskLevel, flagIds, alreadyInteracted }) {
  const data = { category, riskLevel, flagIds, alreadyInteracted: !!alreadyInteracted };

  if (!databaseAvailable) {
    rememberSubmission(data);
    return data;
  }

  try {
    return await prisma.submission.create({ data });
  } catch (error) {
    databaseAvailable = false;
    console.warn(`Database unavailable; using in-memory storage: ${error.message}`);
    rememberSubmission(data);
    return data;
  }
}

export async function getAllSubmissions() {
  if (!databaseAvailable) return memorySubmissions;

  try {
    return await prisma.submission.findMany();
  } catch (error) {
    databaseAvailable = false;
    console.warn(`Database unavailable; using in-memory storage: ${error.message}`);
    return memorySubmissions;
  }
}

export async function getAggregateStats() {
  const submissions = await getAllSubmissions();

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