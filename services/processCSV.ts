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
            console.log("CSV Headers:", headers);
            if (!headers.includes("phone")) {
              console.error("CSV file must have 'phone' as the header");
              reject(new Error("CSV file must have 'phone' as the header"));
              stream.unpipe(csvStream);
            }
            headersChecked = true;
          })
          .on("data", (data) => {
            console.log("CSV Data Row:", data);
            if (!headersChecked) {
              console.error("CSV file must have 'phone' as the header");
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
              console.log("Rate limit exceeded, stopping CSV parsing");
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("end", () => {
            console.log("CSV Parsing Ended");
            if (results.length === 0) {
              console.error("No phone numbers found in the file");
              reject(new Error("No phone numbers found in the file"));
            } else if (!limitExceeded) {
              resolve({ phones: results, limitExceeded });
            }
          })
          .on("error", (error) => {
            console.error("CSV Parsing Error:", error);
            reject(error);
          });

        stream.pipe(csvStream);
      })
      .catch((error) => {
        console.error("Error reading file buffer:", error);
        reject(error);
      });
  });
}
