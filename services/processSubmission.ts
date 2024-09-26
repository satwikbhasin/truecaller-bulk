// src/services/processSubmission.ts
import { generatePDF } from "@/services/pdfGenerator";
import { fetchPhoneDetails } from "@/services/apiClient";

export const processSubmission = async (
  selectedFile: File | null,
  secretKey: string,
  selectedRegion: string
): Promise<boolean> => {
  if (!selectedFile) {
    throw new Error("No file selected");
  }

  try {
    const jsonData = await fetchPhoneDetails(
      selectedFile,
      secretKey,
      selectedRegion
    );
    await generatePDF(jsonData.results);
    return jsonData.limitExceeded;
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred");
  }
};
