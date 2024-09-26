import csv from "csv-parser";
import { Readable } from "stream";
import { CustomError } from "@/services/CustomError";

interface ProcessCSVResult {
  phones: string[];
  limitExceeded: boolean;
}

export default function processCSV(file: File): Promise<ProcessCSVResult> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const API_RATE_LIMIT = parseInt(
      process.env.NEXT_PUBLIC_API_RATE_LIMIT || "20",
      10
    );

    let limitExceeded = false;

    const bufferPromise = file.arrayBuffer();

    bufferPromise
      .then((buffer) => {
        const stream = new Readable();
        stream.push(Buffer.from(buffer));
        stream.push(null);

        const csvStream = csv()
          .on("headers", (headers) => {
            if (!headers.includes("phone")) {
              reject(
                new CustomError("CSV file must have a 'phone' header", 400)
              );
              stream.unpipe(csvStream);
            }
          })
          .on("data", (data) => {
            if (results.length < API_RATE_LIMIT && data.phone) {
              results.push(data.phone.trim());
            } else {
              limitExceeded = true;
              stream.unpipe(csvStream);
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("end", () => {
            if (results.length === 0) {
              reject(
                new CustomError("No phone numbers found in the file", 400)
              );
            } else if (!limitExceeded) {
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("error", (error) => {
            reject(error);
          });

        stream.pipe(csvStream);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
