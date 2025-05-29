export interface ProgressUpdate {
  step: string;
  status: "started" | "completed" | "skipped" | "error";
  details?: string;
  data?: any;
}

export function createProgressStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
  });

  const sendUpdate = (update: ProgressUpdate) => {
    const data = `data: ${JSON.stringify(update)}\n\n`;
    controller.enqueue(encoder.encode(data));
  };

  const close = () => {
    controller.close();
  };

  return { stream, sendUpdate, close };
}
