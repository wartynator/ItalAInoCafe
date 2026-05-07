import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function summarizeCafe(
  ctx: { db: any },
  cafe: Doc<"cafes">,
) {
  const visits = await ctx.db
    .query("visits")
    .withIndex("by_cafe", (q: any) => q.eq("cafeId", cafe._id))
    .collect();
  const env = avg(visits.map((v: Doc<"visits">) => v.ratings.environment));
  const coffee = avg(visits.map((v: Doc<"visits">) => v.ratings.coffee));
  const location = avg(visits.map((v: Doc<"visits">) => v.ratings.location));
  const overall = (env + coffee + location) / 3;
  const tagCounts = new Map<string, number>();
  for (const v of visits) for (const t of v.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);
  return {
    _id: cafe._id,
    name: cafe.name,
    address: cafe.address,
    lat: cafe.lat,
    lng: cafe.lng,
    visitCount: visits.length,
    averages: { environment: env, coffee, location, overall },
    topTags,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cafes = await ctx.db.query("cafes").collect();
    return Promise.all(cafes.map((c) => summarizeCafe(ctx, c)));
  },
});

export const get = query({
  args: { id: v.id("cafes") },
  handler: async (ctx, { id }) => {
    const cafe = await ctx.db.get(id);
    if (!cafe) return null;
    const summary = await summarizeCafe(ctx, cafe);
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_cafe", (q) => q.eq("cafeId", id))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      visits.map(async (v) => {
        const user = await ctx.db.get(v.userId);
        const photoUrls = await Promise.all(
          v.photoIds.map((pid) => ctx.storage.getUrl(pid)),
        );
        return {
          _id: v._id,
          userId: v.userId,
          userName: user?.name ?? user?.email ?? "Anonymous",
          ratings: v.ratings,
          notes: v.notes,
          tags: v.tags,
          photoUrls: photoUrls.filter((u): u is string => !!u),
          visitedAt: v.visitedAt,
          createdAt: v._creationTime,
        };
      }),
    );

    return { ...summary, visits: enriched };
  },
});

export const getOrCreate = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const nameKey = normalize(`${args.name}|${args.address}`);
    const existing = await ctx.db
      .query("cafes")
      .withIndex("by_nameKey", (q) => q.eq("nameKey", nameKey))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("cafes", {
      name: args.name.trim(),
      address: args.address.trim(),
      lat: args.lat,
      lng: args.lng,
      nameKey,
      createdBy: userId,
    });
  },
});
