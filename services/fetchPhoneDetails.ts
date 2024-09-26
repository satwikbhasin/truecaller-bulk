import { CustomError } from "./CustomError";
import fetch from "node-fetch";

export const fetchPhoneDetails = async (
  phone: string,
  secretKey: string,
  region: string
) => {
  console.log(
    `Fetching details for phone number: ${phone} in region: ${region}`
  );

  const apiUrl = process.env.TRUECALLER_API_URL;
  if (!apiUrl) {
    console.error("Missing API URL");
    throw new CustomError("Missing API URL", 500);
  }

  const url = `${apiUrl}?countryCode=${region}&phone=${phone}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": `${secretKey}`,
      "x-rapidapi-host": "truecaller4.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 403) {
      console.error("Invalid Secret Key");
      throw new CustomError("Invalid Secret Key", 403);
    } else if (response.status === 429) {
      console.error("Limit Exceeded for Secret Key");
      throw new CustomError("Limit Exceeded for Secret Key", 429);
    } else if (response.status !== 200) {
      console.error(
        `Unexpected response status ${response.status} for phone number: ${phone}`
      );
      throw new CustomError(
        `Unexpected response status ${response.status} for phone number: ${phone}`,
        response.status
      );
    }

    const data = await response.json();
    if (typeof data !== "object" || data === null) {
      console.error(`Unexpected response format for phone number: ${phone}`);
      throw new CustomError(
        `Unexpected response format for phone number: ${phone}`,
        500
      );
    }

    console.log(`Successfully fetched details for phone number: ${phone}`);
    return { ...data, phone };
  } catch (error) {
    console.error(`Error fetching details for phone number: ${phone}`, error);
    throw error;
  }
};
