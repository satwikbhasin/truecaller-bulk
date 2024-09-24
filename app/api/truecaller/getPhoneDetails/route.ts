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

    const firstPhone = phones[0];
    const testUrl = `https://truecaller4.p.rapidapi.com/api/v1/getDetails?countryCode=${region}&phone=${firstPhone}`;
    const testOptions = {
      method: "GET",
      headers: {
        "x-rapidapi-key": `${secretKey}`,
        "x-rapidapi-host": "truecaller4.p.rapidapi.com",
      },
    };

    const testResponse = await fetch(testUrl, testOptions);
    if (!testResponse.ok) {
      if (testResponse.status === 403) {
        return NextResponse.json(
          { message: "Invalid Secret Key" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { message: `Failed to fetch details for phone number: ${firstPhone}` },
        { status: testResponse.status }
      );
    }

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
        throw {
          message: `Failed to fetch details for phone number: ${phone}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      if (typeof data === "object" && data !== null) {
        return { ...data, phone };
      } else {
        throw {
          message: `Unexpected response format for phone number: ${phone}`,
          statusCode: 500,
        };
      }
    });

    const results = await Promise.all(fetchPromises);

    const firstData = await testResponse.json();
    if (typeof firstData === "object" && firstData !== null) {
      results.unshift({ ...firstData, phone: firstPhone });
    } else {
      throw {
        message: "Unexpected response format for the first phone number",
        statusCode: 500,
      };
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
