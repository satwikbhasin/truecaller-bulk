import processCSV from "@/services/processCSV";
import { NextResponse } from "next/server";
import { fetchPhoneDetails } from "@/services/fetchPhoneDetails";
import { CustomError } from "@/services/CustomError";

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

    if (!secretKey) {
      return NextResponse.json(
        { message: "Authorization header is missing" },
        { status: 400 }
      );
    }

    if (!region) {
      return NextResponse.json(
        { message: "Region header is missing" },
        { status: 400 }
      );
    }

    const result = await processCSV(file);
    const phones = result.phones;
    const limitExceeded = result.limitExceeded;

    const fetchPromises = phones.map((phone) =>
      fetchPhoneDetails(phone, secretKey, region)
    );

    const results = await Promise.all(fetchPromises);

    return NextResponse.json({ results, limitExceeded }, { status: 200 });
  } catch (error: any) {
    const statusCode = error instanceof CustomError ? error.statusCode : 500;
    return NextResponse.json(
      { message: error.message },
      { status: statusCode }
    );
  }
}
