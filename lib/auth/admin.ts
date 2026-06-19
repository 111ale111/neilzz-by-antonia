import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/supabase/env";

type UserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type ProfileLike = {
  id?: string;
  role?: string | null;
  email?: string | null;
  full_name?: string | null;
  is_activated?: boolean | null;
};

function cleanEmail(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function metadataRole(user: UserLike) {
  const role = user.user_metadata?.role;
  return typeof role === "string" ? role.toLowerCase() : "";
}

export function isAdminUser(user: UserLike, profile?: ProfileLike | null) {
  const email = cleanEmail(user.email || profile?.email);
  return profile?.role === "admin" || metadataRole(user) === "admin" || getAdminEmails().includes(email);
}

export async function findProfileForUser(user: UserLike) {
  const supabase = await createClient();

  const byId = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (byId.data) return byId.data as ProfileLike;

  const email = cleanEmail(user.email);
  if (!email) return null;

  const byEmail = await supabase
    .from("profiles")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  return (byEmail.data as ProfileLike | null) || null;
}

export async function ensureProfile(user: UserLike) {
  const supabase = await createClient();
  const email = cleanEmail(user.email);
  const fallbackName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    "Clientă";
  const fallbackRole = getAdminEmails().includes(email) || metadataRole(user) === "admin" ? "admin" : "client";

  let profile = await findProfileForUser(user);

  if (!profile) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fallbackName,
        role: fallbackRole,
        is_activated: fallbackRole === "admin",
        visit_count: 0,
        loyalty_goal: 5,
      },
      { onConflict: "id" },
    );
    profile = await findProfileForUser(user);
  } else {
    const update: Record<string, string | boolean | null> = {};
    if (!profile.email && user.email) update.email = user.email;
    if (!profile.full_name) update.full_name = fallbackName;
    if (fallbackRole === "admin" && profile.role !== "admin") {
      update.role = "admin";
      update.is_activated = true;
    }
    if (Object.keys(update).length > 0 && profile.id) {
      await supabase.from("profiles").update(update).eq("id", profile.id);
      profile = { ...profile, ...update };
    }
  }

  return profile as ProfileLike | null;
}

export async function getCurrentUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null, isAdmin: false };
  const profile = await ensureProfile(user);
  return { supabase, user, profile, isAdmin: isAdminUser(user, profile) };
}

export async function requireAdmin() {
  const session = await getCurrentUserWithProfile();
  if (!session.user) redirect("/login?next=/dashboard");
  if (!session.isAdmin) redirect("/account?admin=missing-role");
  return session as typeof session & { user: NonNullable<typeof session.user> };
}
