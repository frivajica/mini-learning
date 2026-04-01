import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name:
          data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
