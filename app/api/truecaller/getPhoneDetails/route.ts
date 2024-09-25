import processCSV from "@/services/processCSV";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: Request) {
  try {
    console.log("Received POST request");

    const formData = await request.formData();
    console.log("Form data received");

    const secretKey = request.headers.get("Authorization");
    const region = request.headers.get("Region");
    console.log("Authorization and Region headers received");

    const file = formData.get("file") as File;
    if (!file) {
      console.error("No file uploaded");
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }
    console.log("File uploaded");

    const result = await processCSV(file);
    console.log("CSV processed");

    const phones = result.phones;
    const limitExceeded = result.limitExceeded;
    console.log("Phones extracted from CSV:", phones);
    console.log("Limit exceeded:", limitExceeded);

    const firstPhone = phones[0];
    const testUrl = `https://truecaller4.p.rapidapi.com/api/v1/getDetails?countryCode=${region}&phone=${firstPhone}`;
    const testOptions = {
      method: "GET",
      headers: {
        "x-rapidapi-key": `${secretKey}`,
        "x-rapidapi-host": "truecaller4.p.rapidapi.com",
      },
    };

    console.log("Sending test request for the first phone number:", firstPhone);
    const testResponse = await fetch(testUrl, testOptions);
    if (!testResponse.ok) {
      if (testResponse.status === 403) {
        console.error("Invalid Secret Key");
        return NextResponse.json(
          { message: "Invalid Secret Key" },
          { status: 403 }
        );
      }
      console.error(`Failed to fetch details for phone number: ${firstPhone}`);
      return NextResponse.json(
        { message: `Failed to fetch details for phone number: ${firstPhone}` },
        { status: testResponse.status }
      );
    }

    console.log("Details fetched for the first phone number:", firstPhone);
    const firstData = await testResponse.json();
    if (typeof firstData !== "object" || firstData === null) {
      console.error("Unexpected response format for the first phone number");
      return NextResponse.json(
        { message: "Unexpected response format for the first phone number" },
        { status: 500 }
      );
    }

    const results = [{ ...firstData, phone: firstPhone }];
    console.log("First phone details added to results");

    console.log(
      "Fetching details for the remaining phone numbers:",
      phones.slice(1)
    );
    const fetchPromises = phones.slice(1).map(async (phone) => {
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
        console.error(`Failed to fetch details for phone number: ${phone}`);
        throw {
          message: `Failed to fetch details for phone number: ${phone}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      if (typeof data === "object" && data !== null) {
        console.log(`Details fetched for phone number: ${phone}`);
        return { ...data, phone };
      } else {
        console.error(`Unexpected response format for phone number: ${phone}`);
        throw {
          message: `Unexpected response format for phone number: ${phone}`,
          statusCode: 500,
        };
      }
    });

    const remainingResults = await Promise.all(fetchPromises);
    results.push(...remainingResults);
    console.log("All phone details fetched");

    console.log("Final results:", results);
    console.log("Data:", results[0].data);
    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    console.error("Error occurred:", error.message);
    return NextResponse.json(
      { message: error.message },
      { status: statusCode }
    );
  }
}
