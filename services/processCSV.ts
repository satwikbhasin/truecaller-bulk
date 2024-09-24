import csv from "csv-parser";
import { Readable } from "stream";

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

        let headersChecked = false;

        const csvStream = csv()
          .on("headers", (headers) => {
            if (!headers.includes("phone")) {
              reject(new Error("CSV file must have 'phone' as the header"));
              stream.unpipe(csvStream);
            }
            headersChecked = true;
          })
          .on("data", (data) => {
            if (!headersChecked) {
              reject(new Error("CSV file must have 'phone' as the header"));
              stream.unpipe(csvStream);
            }
            if (results.length < API_RATE_LIMIT) {
              if (data.phone) {
                results.push(data.phone.trim());
              } else {
                console.warn("No phone field in the data row:", data);
              }
            } else {
              limitExceeded = true;
              stream.unpipe(csvStream);
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("end", () => {
            if (results.length === 0) {
              reject(new Error("No phone numbers found in the file"));
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
