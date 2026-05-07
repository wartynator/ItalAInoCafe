import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // user-editable profile data, kept separate from the auth users table
  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  }).index("by_user", ["userId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followeeId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_followee", ["followeeId"])
    .index("by_pair", ["followerId", "followeeId"]),

  cafes: defineTable({
    name: v.string(),
    address: v.string(),
    lat: v.number(),
    lng: v.number(),
    nameKey: v.string(),
    createdBy: v.id("users"),
  }).index("by_nameKey", ["nameKey"]),

  visits: defineTable({
    cafeId: v.id("cafes"),
    userId: v.id("users"),
    // single overall rating (1..5). Required for new rows; optional in the
    // schema so legacy three-axis rows still validate during migration.
    overall: v.optional(v.number()),
    // optional detailed facets — only set when the user expands "details"
    ratings: v.optional(
      v.object({
        environment: v.number(),
        coffee: v.number(),
        location: v.number(),
      }),
    ),
    notes: v.string(),
    tags: v.array(v.string()),
    photoIds: v.array(v.id("_storage")),
    visitedAt: v.number(),
  })
    .index("by_cafe", ["cafeId"])
    .index("by_user", ["userId"])
    .index("by_visitedAt", ["visitedAt"]),
});
