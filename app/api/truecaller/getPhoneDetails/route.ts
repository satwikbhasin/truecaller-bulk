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

    const { phones, limitExceeded } = await processCSV(file);

    if (phones.length === 0) {
      return NextResponse.json(
        { message: "No phone numbers found in the file" },
        { status: 400 }
      );
    }

    console.log(`Processing ${phones.length} phone numbers`);
    console.log(`processing phone numbers: ${phones}`);

    const fetchPromises = phones.map(async (phone) => {
      const url = `https://truecaller4.p.rapidapi.com/api/v1/getDetails?countryCode=${region}&phone=${phone}`;
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
          console.error(`Failed to fetch details for phone number: ${phone}`);
          throw new Error(`Failed to fetch details for phone number: ${phone}`);
        }
        return await response.json();
      } catch (error) {
        console.error(
          `Error fetching details for phone number: ${phone}`,
          error
        );
        throw error;
      }
    });

    const results = await Promise.all(fetchPromises);
    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
