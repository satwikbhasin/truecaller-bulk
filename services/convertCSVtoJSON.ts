import csv from "csv-parser";
import { Readable } from "stream";

export async function convertCSVtoJSON(file: File): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    const results: any[] = [];

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      stream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}
