import React from "react";
import { revalidatePath } from "next/cache";
import AiMessengerClient from "@/lib/features/ai_messenger/AiMessengerClient";
import { fetchAiMessengerData } from "@/lib/features/ai_messenger/util/page_cache";

async function refreshData() {
  "use server";
  revalidatePath("/resources/ai_messenger");
}

export default async function AiMessengerPage() {
  const data = await fetchAiMessengerData();

  return <AiMessengerClient initialData={data} refreshAction={refreshData} />;
}
