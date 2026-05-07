import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Kept as a thin shim — `api.profiles.me` is the canonical endpoint. This
// route is preserved so existing UI imports keep working until they migrate.
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
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
  },
});
