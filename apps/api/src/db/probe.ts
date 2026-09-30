import { probeDatabase } from "@repo/db";

export const dbHealth = {
  async probe(): Promise<boolean> {
    return probeDatabase();
  },
};

export async function probeDb(): Promise<boolean> {
  return dbHealth.probe();
}
