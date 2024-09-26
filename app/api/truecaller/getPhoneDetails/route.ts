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

    const start = Date.now();
    const fetchPromises = phones.map((phone) => {
      return fetchPhoneDetails(phone, secretKey, region)
        .then((result) => {
          console.log(
            `Time taken for phone number ${phone}: ${Date.now() - start}ms`
          );
          return result;
        })
        .catch((error) => {
          console.error(`Failed to fetch details for phone: ${phone}`, error);
          return { error: error.message };
        });
    });

    const results = await Promise.all(fetchPromises);

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
