import React from "react";
import { revalidatePath, revalidateTag } from "next/cache";
import DecisionHelperClient from "../DecisionHelperClient";
import { fetchDecisionHelperData } from "../util/page_cache";

async function refreshData() {
  "use server";
  revalidateTag("events");
  revalidateTag("tasks");
  revalidateTag("projects");
  revalidateTag("decisions");
  revalidateTag("essentials");
  revalidatePath("/resources/decision_helper");
}

export default async function DecisionHelperPage() {
  const data = await fetchDecisionHelperData();

  return <DecisionHelperClient initialData={data} refreshAction={refreshData} />;
}
