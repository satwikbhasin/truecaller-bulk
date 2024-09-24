import { generatePDF } from "@/services/pdfGenerator";

export const processSubmission = async (
  selectedFile: File | null,
  secretKey: string,
  selectedRegion: string
) => {
  if (selectedFile) {
    const formData = new FormData();
    formData.append("file", selectedFile);
    const response = await fetch("api/truecaller/getPhoneDetails", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `${secretKey}`,
        Region: selectedRegion,
      },
    });
    const jsonData = await response.json();

    if (!response.ok) {
      if (response.status != 200) {
        throw new Error(jsonData.message);
      } else {
        throw new Error("Failed to process CSV");
      }
    }

    await generatePDF(jsonData.results);
    return jsonData.limitExceeded;
  } else {
    console.error("No file selected");
  }
};
