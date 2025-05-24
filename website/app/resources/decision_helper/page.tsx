import React from "react";
import { revalidatePath } from "next/cache";
import DecisionHelperClient from "./DecisionHelperClient";
import { fetchDecisionHelperData } from "@/lib/features/decision_helper/util/page_cache";

async function refreshData() {
  "use server";
  revalidatePath("/resources/decision_helper");
}

export default async function Page() {
  const data = await fetchDecisionHelperData();

  return <DecisionHelperClient initialData={data} refreshAction={refreshData} />;
}
