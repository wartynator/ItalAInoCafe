import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";
import { followingIds } from "./follows";

const ratingValidator = v.object({
  environment: v.number(),
  coffee: v.number(),
  location: v.number(),
});

function clamp1to5(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function visitOverall(v: Doc<"visits">): number {
  if (typeof v.overall === "number") return v.overall;
  if (v.ratings) {
    return (v.ratings.environment + v.ratings.coffee + v.ratings.location) / 3;
  }
  return 0;
}

async function enrichVisit(ctx: QueryCtx, v: Doc<"visits">) {
  const cafe = await ctx.db.get(v.cafeId);
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
  return {
    _id: v._id,
    cafeId: v.cafeId,
    cafeName: cafe?.name ?? "Unknown",
    cafeAddress: cafe?.address ?? "",
    userId: v.userId,
    userName: profile?.name ?? user?.name ?? user?.email ?? "Anonymous",
    userAvatarUrl: avatarUrl,
    overall: visitOverall(v),
    ratings: v.ratings ?? null,
    notes: v.notes,
    tags: v.tags,
    photoUrls,
    visitedAt: v.visitedAt,
  };
}

export const create = mutation({
  args: {
    cafeId: v.id("cafes"),
    overall: v.number(),
    ratings: v.optional(ratingValidator),
    notes: v.string(),
    tags: v.array(v.string()),
    photoIds: v.array(v.id("_storage")),
    visitedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const overall = clamp1to5(args.overall);
    let ratings = args.ratings;
    if (ratings) {
      ratings = {
        environment: clamp1to5(ratings.environment),
        coffee: clamp1to5(ratings.coffee),
        location: clamp1to5(ratings.location),
      };
    }
    return await ctx.db.insert("visits", {
      cafeId: args.cafeId,
      userId,
      overall,
      ratings,
      notes: args.notes.slice(0, 2000),
      tags: args.tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 12),
      photoIds: args.photoIds,
      visitedAt: args.visitedAt,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("visits"),
    overall: v.number(),
    ratings: v.optional(ratingValidator),
    notes: v.string(),
    tags: v.array(v.string()),
    photoIds: v.array(v.id("_storage")),
    visitedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const visit = await ctx.db.get(args.id);
    if (!visit) throw new Error("Not found");
    if (visit.userId !== userId) throw new Error("Forbidden");
    const overall = clamp1to5(args.overall);
    let ratings = args.ratings;
    if (ratings) {
      ratings = {
        environment: clamp1to5(ratings.environment),
        coffee: clamp1to5(ratings.coffee),
        location: clamp1to5(ratings.location),
      };
    }
    const removed = visit.photoIds.filter((pid) => !args.photoIds.includes(pid));
    for (const pid of removed) await ctx.storage.delete(pid);
    await ctx.db.patch(args.id, {
      overall,
      ratings,
      notes: args.notes.slice(0, 2000),
      tags: args.tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 12),
      photoIds: args.photoIds,
      visitedAt: args.visitedAt,
    });
  },
});

export const byId = query({
  args: { id: v.id("visits") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const visit = await ctx.db.get(id);
    if (!visit) return null;
    if (visit.userId !== userId) return null;
    const cafe = await ctx.db.get(visit.cafeId);
    const photos = await Promise.all(
      visit.photoIds.map(async (pid) => ({
        storageId: pid,
        url: (await ctx.storage.getUrl(pid)) ?? "",
      })),
    );
    return {
      _id: visit._id,
      cafeId: visit.cafeId,
      cafeName: cafe?.name ?? "Unknown",
      cafeAddress: cafe?.address ?? "",
      overall: visitOverall(visit),
      ratings: visit.ratings ?? null,
      notes: visit.notes,
      tags: visit.tags,
      photos: photos.filter((p) => p.url),
      visitedAt: visit.visitedAt,
    };
  },
});

export const remove = mutation({
  args: { id: v.id("visits") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const visit = await ctx.db.get(id);
    if (!visit) return;
    if (visit.userId !== userId) throw new Error("Forbidden");
    const cafeId = visit.cafeId;
    for (const pid of visit.photoIds) await ctx.storage.delete(pid);
    await ctx.db.delete(id);
    const remaining = await ctx.db
      .query("visits")
      .withIndex("by_cafe", (q) => q.eq("cafeId", cafeId))
      .first();
    if (!remaining) await ctx.db.delete(cafeId);
  },
});

// Friends-only feed: yourself + everyone you follow, newest first.
export const friendsFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const allowed = await followingIds(ctx, userId);
    allowed.add(userId);
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_visitedAt")
      .order("desc")
      .take(Math.min((limit ?? 30) * 4, 200));
    const filtered = visits.filter((v) => allowed.has(v.userId)).slice(0, limit ?? 30);
    return Promise.all(filtered.map((v) => enrichVisit(ctx, v)));
  },
});

export const myFeed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return Promise.all(visits.map((v) => enrichVisit(ctx, v)));
  },
});

export const byUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 50);
    return Promise.all(visits.map((v) => enrichVisit(ctx, v)));
  },
});
