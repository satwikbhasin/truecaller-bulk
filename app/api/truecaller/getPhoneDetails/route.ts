import processCSV from "@/services/processCSV";
import { NextResponse } from "next/server";
import { fetchPhoneDetails } from "@/services/fetchPhoneDetails";
import { CustomError } from "@/services/CustomError";

export async function POST(request: Request) {
  try {
    console.log("Received POST request");

    const formData = await request.formData();
    const secretKey = request.headers.get("Authorization");
    const region = request.headers.get("Region");
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file uploaded");
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!secretKey) {
      console.log("Authorization header is missing");
      return NextResponse.json(
        { message: "Authorization header is missing" },
        { status: 400 }
      );
    }

    if (!region) {
      console.log("Region header is missing");
      return NextResponse.json(
        { message: "Region header is missing" },
        { status: 400 }
      );
    }

    console.log("Processing CSV file");
    const result = await processCSV(file);
    const phones = result.phones;
    const limitExceeded = result.limitExceeded;

    if (phones.length === 0) {
      console.log("No phone numbers found in the file");
      return NextResponse.json(
        { message: "No phone numbers found in the file" },
        { status: 400 }
      );
    }

    console.log(`Found ${phones.length} phone numbers`);

    let firstResult;
    try {
      console.log(`Fetching details for the first phone number: ${phones[0]}`);
      firstResult = await fetchPhoneDetails(phones[0], secretKey, region);
    } catch (error: any) {
      if (error instanceof CustomError && error.statusCode === 403) {
        console.log("Invalid Secret Key");
        return NextResponse.json(
          { message: "Invalid Secret Key" },
          { status: 403 }
        );
      }
      throw error;
    }

    console.log("Fetching details for remaining phone numbers");
    const fetchPromises = phones
      .slice(1)
      .map((phone) => fetchPhoneDetails(phone, secretKey, region));

    const remainingResults = await Promise.allSettled(fetchPromises);

    const results = [
      firstResult,
      ...remainingResults.map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          console.error(`Failed to fetch details for phone: ${result.reason}`);
          return { error: result.reason.message };
        }
      }),
    ];

    console.log("Returning results");
    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    const statusCode = error instanceof CustomError ? error.statusCode : 500;
    console.error(`Error: ${error.message}`);
    return NextResponse.json(
      { message: error.message },
      { status: statusCode }
    );
  }
}
