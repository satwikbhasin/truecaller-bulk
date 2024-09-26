import csv from "csv-parser";
import { Readable } from "stream";
import { CustomError } from "@/services/CustomError";

interface ProcessCSVResult {
  phones: string[];
  limitExceeded: boolean;
}

export default function processCSV(file: File): Promise<ProcessCSVResult> {
  return new Promise((resolve, reject) => {
    console.log("Starting CSV processing");

    const results: string[] = [];
    const API_RATE_LIMIT = parseInt(
      process.env.NEXT_PUBLIC_API_RATE_LIMIT || "20",
      10
    );

    let limitExceeded = false;

    const bufferPromise = file.arrayBuffer();

    bufferPromise
      .then((buffer) => {
        console.log("Buffer obtained from file");

        const stream = new Readable();
        stream.push(Buffer.from(buffer));
        stream.push(null);

        const csvStream = csv()
          .on("headers", (headers) => {
            console.log("CSV headers:", headers);
            if (!headers.includes("phone")) {
              console.error("CSV file must have a 'phone' header");
              reject(
                new CustomError("CSV file must have a 'phone' header", 400)
              );
              stream.unpipe(csvStream);
            }
          })
          .on("data", (data) => {
            if (results.length < API_RATE_LIMIT && data.phone) {
              console.log("Adding phone number:", data.phone.trim());
              results.push(data.phone.trim());
            } else {
              limitExceeded = true;
              console.log("API rate limit exceeded");
              stream.unpipe(csvStream);
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("end", () => {
            if (results.length === 0) {
              console.error("No phone numbers found in the file");
              reject(
                new CustomError("No phone numbers found in the file", 400)
              );
            } else if (!limitExceeded) {
              console.log("CSV processing completed");
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("error", (error) => {
            console.error("Error during CSV processing:", error);
            reject(error);
          });

        stream.pipe(csvStream);
      })
      .catch((error) => {
        console.error("Error obtaining buffer from file:", error);
        reject(error);
      });
  });
}
