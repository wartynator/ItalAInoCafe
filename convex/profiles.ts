import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id, Doc } from "./_generated/dataModel";

async function getProfile(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

async function buildPublicProfile(
  ctx: QueryCtx,
  user: Doc<"users">,
  profile: Doc<"profiles"> | null,
) {
  const avatarUrl = profile?.avatarStorageId
    ? await ctx.storage.getUrl(profile.avatarStorageId)
    : null;
  return {
    _id: user._id,
    name: profile?.name ?? user.name ?? null,
    email: user.email ?? null,
    bio: profile?.bio ?? null,
    avatarUrl: avatarUrl ?? null,
  };
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const profile = await getProfile(ctx, userId);
    return buildPublicProfile(ctx, user, profile);
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (!user) return null;
    const profile = await getProfile(ctx, id);
    return buildPublicProfile(ctx, user, profile);
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await getProfile(ctx, userId);
    const patch = {
      name: args.name?.slice(0, 60).trim() || undefined,
      bio: args.bio?.slice(0, 280) ?? undefined,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("profiles", { userId, ...patch });
    }
  },
});

export const setAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await getProfile(ctx, userId);
    if (existing) {
      if (existing.avatarStorageId && existing.avatarStorageId !== storageId) {
        await ctx.storage.delete(existing.avatarStorageId);
      }
      await ctx.db.patch(existing._id, { avatarStorageId: storageId });
    } else {
      await ctx.db.insert("profiles", { userId, avatarStorageId: storageId });
    }
  },
});

export const search = query({
  args: { q: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { q, limit }) => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const cap = limit ?? 10;
    const me = await getAuthUserId(ctx);
    // small app: collect a slice of users and filter in-memory
    const users = await ctx.db.query("users").take(200);
    const matches = [] as Array<{
      _id: Id<"users">;
      name: string | null;
      email: string | null;
      avatarUrl: string | null;
    }>;
    for (const u of users) {
      if (u._id === me) continue;
      const profile = await getProfile(ctx, u._id);
      const name = (profile?.name ?? u.name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      if (!name.includes(term) && !email.includes(term)) continue;
      const avatarUrl = profile?.avatarStorageId
        ? await ctx.storage.getUrl(profile.avatarStorageId)
        : null;
      matches.push({
        _id: u._id,
        name: profile?.name ?? u.name ?? null,
        email: u.email ?? null,
        avatarUrl: avatarUrl ?? null,
      });
      if (matches.length >= cap) break;
    }
    return matches;
  },
});
