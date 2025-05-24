import { VideoRecord } from "../types";

export async function fetchVideosData(page: number = 1, limit: number = 12, yearFilter?: string, sortBy: string = "release_date", sortOrder: string = "desc") {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (yearFilter) {
      params.append("year", yearFilter);
    }

    const response = await fetch(`${baseUrl}/api/videos?${params}`, {
      next: { revalidate: 300, tags: ["videos"] },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      videos: data.videos || [],
      totalVideos: data.totalVideos || 0,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching videos data:", error);
    return {
      videos: [],
      totalVideos: 0,
      currentPage: 1,
      totalPages: 1,
    };
  }
}
