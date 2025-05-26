"use client";

import { redirect } from "next/navigation";

export default function MoviesPage() {
  redirect("/videos?tab=movies");
}
