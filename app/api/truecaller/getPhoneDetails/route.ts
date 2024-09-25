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

    const result = await processCSV(file);
    const phones = result.phones;
    const limitExceeded = result.limitExceeded;

    const limitedPhones = phones.slice(0, 20);

    const fetchPhoneDetails = async (phone: string) => {
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
          return NextResponse.json(
            { message: "Invalid Secret Key" },
            { status: 403 }
          );
        }
        throw new Error(`Invalid Secret Key`);
      }
      const data = await response.json();
      if (typeof data !== "object" || data === null) {
        throw new Error(
          `Unexpected response format for phone number: ${phone}`
        );
      }
      return { ...data, phone };
    };

    const fetchPromises = limitedPhones.map((phone) =>
      fetchPhoneDetails(phone)
    );
    const results = await Promise.all(fetchPromises);

    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { message: error.message },
      { status: statusCode }
    );
  }
}
