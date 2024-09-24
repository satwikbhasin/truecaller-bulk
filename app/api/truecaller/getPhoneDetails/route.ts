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
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    let phones: string[] = [];
    let limitExceeded = false;

    try {
      const result = await processCSV(file);
      phones = result.phones;
      limitExceeded = result.limitExceeded;
    } catch (csvError: any) {
      return NextResponse.json({ message: csvError.message }, { status: 400 });
    }

    let results;
    try {
      const fetchPromises = phones.map(async (phone) => {
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
            throw new Error("Invalid Secret Key");
          }
          throw new Error(`Failed to fetch details for phone number: ${phone}`);
        }
        return await response.json();
      });

      results = await Promise.all(fetchPromises);
    } catch (requestError: any) {
      return NextResponse.json(
        { message: requestError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
