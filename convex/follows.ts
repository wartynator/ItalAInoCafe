import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

export async function followingIds(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Set<Id<"users">>> {
  const rows = await ctx.db
    .query("follows")
    .withIndex("by_follower", (q) => q.eq("followerId", userId))
    .collect();
  return new Set(rows.map((r) => r.followeeId));
}

export const toggle = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const me = await getAuthUserId(ctx);
    if (!me) throw new Error("Not authenticated");
    if (me === targetId) throw new Error("Cannot follow yourself");
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", me).eq("followeeId", targetId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    }
    await ctx.db.insert("follows", { followerId: me, followeeId: targetId });
    return { following: true };
  },
});

export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const me = await getAuthUserId(ctx);
    if (!me) return false;
    const row = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", me).eq("followeeId", targetId),
      )
      .unique();
    return !!row;
  },
});

export const counts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followee", (q) => q.eq("followeeId", userId))
      .collect();
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();
    return {
      followers: followers.length,
      following: following.length,
    };
  },
});
