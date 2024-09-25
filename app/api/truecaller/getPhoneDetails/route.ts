import processCSV from "@/services/processCSV";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const secretKey = request.headers.get("Authorization");
    const region = request.headers.get("Region");
    const file = formData.get("file") as File;

    if (!file) {
      throw { message: "No file uploaded", statusCode: 400 };
    }

    const result = await processCSV(file);
    const phones = result.phones;
    const limitExceeded = result.limitExceeded;

    const results = [];

    for (const phone of phones) {
      try {
        const url = `https://truecaller4.p.rapidapi.com/api/v1/getDetails?countryCode=${region}&phone=${phone}`;
        const options = {
          method: "GET",
          headers: {
            "x-rapidapi-key": `${secretKey}`,
            "x-rapidapi-host": "truecaller4.p.rapidapi.com",
          },
        };
        const response = await fetch(url, options);
        if (!response.ok) {
          if (response.status === 403) {
            throw { message: "Invalid Secret Key", statusCode: 403 };
          }
          throw {
            message: `Failed to fetch details for phone number: ${phone}`,
            statusCode: response.status,
          };
        }

        const data = await response.json();

        if (typeof data === "object" && data !== null) {
          results.push({ ...data, phone });
        } else {
          throw {
            message: `Unexpected response format for phone number: ${phone}`,
            statusCode: 500,
          };
        }
      } catch (error: any) {
        console.error(`Error processing phone number ${phone}:`, error.message);
      }
    }

    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { message: error.message },
      { status: statusCode }
    );
  }
}
