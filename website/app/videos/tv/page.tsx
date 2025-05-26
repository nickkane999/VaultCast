"use client";

import { redirect } from "next/navigation";

export default function TVPage() {
  redirect("/videos?tab=tv");
}
