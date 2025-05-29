import React from "react";
import { revalidatePath, revalidateTag } from "next/cache";
import DecisionHelperClient from "@/lib/features/decision_helper/DecisionHelperClient";
import { fetchDecisionHelperData } from "@/lib/features/decision_helper/util/page_cache";

async function refreshData() {
  "use server";
  revalidateTag("events");
  revalidateTag("tasks");
  revalidateTag("projects");
  revalidateTag("decisions");
  revalidateTag("essentials");
  revalidatePath("/resources/decision_helper");
}

export default async function Page() {
  const data = await fetchDecisionHelperData();

  return <DecisionHelperClient initialData={data} refreshAction={refreshData} />;
}
