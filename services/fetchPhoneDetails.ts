import { CustomError } from "./CustomError";
import fetch from "node-fetch";

export const fetchPhoneDetails = async (
  phone: string,
  secretKey: string,
  region: string
) => {
  const apiUrl = process.env.TRUECALLER_API_URL;
  if (!apiUrl) {
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

  const response = await fetch(url, options);

  if (response.status === 403) {
    throw new CustomError("Invalid Secret Key", 403);
  } else if (response.status === 429) {
    throw new CustomError("Limit Exceeded for Secret Key", 429);
  } else if (response.status !== 200) {
    throw new CustomError(
      `Unexpected response status ${response.status} for phone number: ${phone}`,
      response.status
    );
  }

  const data = await response.json();
  if (typeof data !== "object" || data === null) {
    throw new CustomError(
      `Unexpected response format for phone number: ${phone}`,
      500
    );
  }
  return { ...data, phone };
};
