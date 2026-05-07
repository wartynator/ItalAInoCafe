import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const ratingValidator = v.object({
  environment: v.number(),
  coffee: v.number(),
  location: v.number(),
});

export const create = mutation({
  args: {
    cafeId: v.id("cafes"),
    ratings: ratingValidator,
    notes: v.string(),
    tags: v.array(v.string()),
    photoIds: v.array(v.id("_storage")),
    visitedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    for (const k of ["environment", "coffee", "location"] as const) {
      const r = args.ratings[k];
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        throw new Error(`Invalid rating for ${k}`);
      }
    }
    return await ctx.db.insert("visits", {
      cafeId: args.cafeId,
      userId,
      ratings: args.ratings,
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
    ratings: ratingValidator,
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
    for (const k of ["environment", "coffee", "location"] as const) {
      const r = args.ratings[k];
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        throw new Error(`Invalid rating for ${k}`);
      }
    }
    const removed = visit.photoIds.filter((pid) => !args.photoIds.includes(pid));
    for (const pid of removed) await ctx.storage.delete(pid);
    await ctx.db.patch(args.id, {
      ratings: args.ratings,
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
      ratings: visit.ratings,
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
    for (const pid of visit.photoIds) await ctx.storage.delete(pid);
    await ctx.db.delete(id);
  },
});

export const recentFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_visitedAt")
      .order("desc")
      .take(limit ?? 30);
    return Promise.all(
      visits.map(async (v) => {
        const cafe = await ctx.db.get(v.cafeId);
        const user = await ctx.db.get(v.userId);
        const photoUrls = await Promise.all(
          v.photoIds.map((pid) => ctx.storage.getUrl(pid)),
        );
        return {
          _id: v._id,
          cafeId: v.cafeId,
          cafeName: cafe?.name ?? "Unknown",
          cafeAddress: cafe?.address ?? "",
          userId: v.userId,
          userName: user?.name ?? user?.email ?? "Anonymous",
          ratings: v.ratings,
          notes: v.notes,
          tags: v.tags,
          photoUrls: photoUrls.filter((u): u is string => !!u),
          visitedAt: v.visitedAt,
        };
      }),
    );
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
    return Promise.all(
      visits.map(async (v) => {
        const cafe = await ctx.db.get(v.cafeId);
        const photoUrls = await Promise.all(
          v.photoIds.map((pid) => ctx.storage.getUrl(pid)),
        );
        return {
          _id: v._id,
          cafeId: v.cafeId,
          cafeName: cafe?.name ?? "Unknown",
          cafeAddress: cafe?.address ?? "",
          ratings: v.ratings,
          notes: v.notes,
          tags: v.tags,
          photoUrls: photoUrls.filter((u): u is string => !!u),
          visitedAt: v.visitedAt,
        };
      }),
    );
  },
});
