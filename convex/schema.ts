import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  cafes: defineTable({
    name: v.string(),
    address: v.string(),
    lat: v.number(),
    lng: v.number(),
    nameKey: v.string(), // normalized name+address for dedup
    createdBy: v.id("users"),
  }).index("by_nameKey", ["nameKey"]),

  visits: defineTable({
    cafeId: v.id("cafes"),
    userId: v.id("users"),
    ratings: v.object({
      environment: v.number(),
      coffee: v.number(),
      location: v.number(),
    }),
    notes: v.string(),
    tags: v.array(v.string()),
    photoIds: v.array(v.id("_storage")),
    visitedAt: v.number(),
  })
    .index("by_cafe", ["cafeId"])
    .index("by_user", ["userId"])
    .index("by_visitedAt", ["visitedAt"]),
});
