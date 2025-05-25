import { revalidatePath } from "next/cache";
import { fetchVideosData } from "@/lib/features/videos/util/page_cache";
import { Suspense } from "react";
import VideosClient from "./VideosClient";

export default async function VideosPage() {
  const data = await fetchVideosData();

  const refreshAction = async () => {
    "use server";
    revalidatePath("/videos");
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideosClient initialData={data} refreshAction={refreshAction} />
    </Suspense>
  );
}
