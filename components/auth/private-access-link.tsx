"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function PrivateAccessLink({ className, children }: Props) {
  const [href, setHref] = useState("/login");
  const [label, setLabel] = useState<React.ReactNode>(children || "Private access");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted || !user) return;
      let { data: profile } = await supabase.from("profiles").select("role,email").eq("id", user.id).maybeSingle();
      if (!profile && user.email) {
        const retry = await supabase.from("profiles").select("role,email").ilike("email", user.email).maybeSingle();
        profile = retry.data;
      }
      const isAdmin = profile?.role === "admin" || user.user_metadata?.role === "admin";
      setHref(isAdmin ? "/dashboard" : "/account");
      if (!children) setLabel(isAdmin ? "Dashboard" : "Account");
    }

    load();
    return () => {
      mounted = false;
    };
  }, [children]);

  return <Link href={href} className={className}>{label}</Link>;
}
