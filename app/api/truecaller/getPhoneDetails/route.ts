import { convertCSVtoJSON } from "@/services/convertCSVtoJSON";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const secretKey = request.headers.get("Authorization");
    const region = request.headers.get("Region");
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const entries = await convertCSVtoJSON(file);

    let results = [];

    const limitedEntries = entries.slice(0, 20);

    for (const entry of limitedEntries) {
      const url = `https://truecaller4.p.rapidapi.com/api/v1/getDetails?countryCode=${region}&phone=${entry.phone}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": `${secretKey}`,
          "x-rapidapi-host": "truecaller4.p.rapidapi.com",
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          console.error(
            `Failed to fetch details for phone number: ${entry.phone}`
          );
          throw new Error(
            `Failed to fetch details for phone number: ${entry.phone}`
          );
        }
        const result = await response.json();
        results.push(result);
      } catch (error) {
        console.error(
          `Error fetching details for phone number: ${entry.phone}`,
          error
        );
        throw error;
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error("Error occurred:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
