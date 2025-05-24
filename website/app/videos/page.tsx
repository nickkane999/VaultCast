import { revalidatePath } from "next/cache";
import { fetchVideosData } from "@/lib/features/videos/util/page_cache";
import VideosClient from "./VideosClient";

export default async function VideosPage() {
  const data = await fetchVideosData();

  const refreshAction = async () => {
    "use server";
    revalidatePath("/videos");
  };

  return <VideosClient initialData={data} refreshAction={refreshAction} />;
}
