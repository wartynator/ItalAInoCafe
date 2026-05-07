import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function mean(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function visitOverall(v: Doc<"visits">): number {
  if (typeof v.overall === "number") return v.overall;
  if (v.ratings) {
    const r = v.ratings;
    return (r.environment + r.coffee + r.location) / 3;
  }
  return 0;
}

async function summarizeCafe(ctx: QueryCtx, cafe: Doc<"cafes">) {
  const visits = await ctx.db
    .query("visits")
    .withIndex("by_cafe", (q) => q.eq("cafeId", cafe._id))
    .collect();
  const overalls = visits.map(visitOverall).filter((n) => n > 0);
  const overall = mean(overalls);
  const facets = visits.map((v) => v.ratings).filter((r): r is NonNullable<typeof r> => !!r);
  const env = mean(facets.map((r) => r.environment));
  const coffee = mean(facets.map((r) => r.coffee));
  const location = mean(facets.map((r) => r.location));
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
    averages: {
      overall,
      environment: env,
      coffee,
      location,
      hasFacets: facets.length > 0,
    },
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

    const allTagCounts = new Map<string, number>();
    const allPhotos: string[] = [];

    const enriched = await Promise.all(
      visits.map(async (v) => {
        const user = await ctx.db.get(v.userId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", v.userId))
          .unique();
        const avatarUrl = profile?.avatarStorageId
          ? await ctx.storage.getUrl(profile.avatarStorageId)
          : null;
        const photoUrls = (
          await Promise.all(v.photoIds.map((pid) => ctx.storage.getUrl(pid)))
        ).filter((u): u is string => !!u);
        for (const url of photoUrls) allPhotos.push(url);
        for (const t of v.tags) allTagCounts.set(t, (allTagCounts.get(t) ?? 0) + 1);
        return {
          _id: v._id,
          userId: v.userId,
          userName: profile?.name ?? user?.name ?? user?.email ?? "Anonymous",
          userAvatarUrl: avatarUrl,
          overall: visitOverall(v),
          ratings: v.ratings ?? null,
          notes: v.notes,
          tags: v.tags,
          photoUrls,
          visitedAt: v.visitedAt,
          createdAt: v._creationTime,
        };
      }),
    );

    const tagCloud = [...allTagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    return {
      ...summary,
      visits: enriched,
      photoWall: allPhotos.slice(0, 24),
      tagCloud,
    };
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
