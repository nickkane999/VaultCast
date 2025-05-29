import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/server/mongodb";

export async function POST(request: NextRequest) {
  try {
    const options = await request.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sendUpdate = (data: any) => {
            const chunk = encoder.encode(JSON.stringify(data) + "\n");
            controller.enqueue(chunk);
          };

          let collection;
          let query = {};

          if (options.contentType === "movies") {
            collection = await getCollection("movies");
            if (!options.overwriteExisting) {
              query = {
                $or: [{ trailer: { $exists: false } }, { trailer: null }, { trailer: "" }],
              };
            }
          } else {
            collection = await getCollection("tv_episodes");
            if (options.selectedShow) {
              query = { showName: options.selectedShow };
              if (options.selectedSeason) {
                query = { ...query, seasonNumber: options.selectedSeason };
              }
            }
          }

          const items = await collection.find(query).toArray();
          const total = items.length;
          let current = 0;
          const completed: string[] = [];
          const failed: string[] = [];
          const skipped: string[] = [];

          for (let i = 0; i < items.length; i += options.batchSize) {
            const batch = items.slice(i, i + options.batchSize);

            for (const item of batch) {
              current++;

              sendUpdate({
                type: "progress",
                data: {
                  total,
                  current,
                  currentMovie: item.title || item.episodeTitle || item.name,
                  completed,
                  failed,
                  skipped,
                },
              });

              try {
                // Simulate processing delay
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Here you would implement actual video update logic
                // For now, just mark as completed
                completed.push(item.title || item.episodeTitle || item.name);
              } catch (error) {
                failed.push(item.title || item.episodeTitle || item.name);
              }
            }
          }

          sendUpdate({
            type: "complete",
            data: {
              updated: completed.length,
              skipped: skipped.length,
              failed: failed.length,
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const chunk = encoder.encode(
            JSON.stringify({
              type: "error",
              message: errorMessage,
            }) + "\n"
          );
          controller.enqueue(chunk);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
