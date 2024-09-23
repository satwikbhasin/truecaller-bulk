import { generatePDF } from "@/services/pdfGenerator";

export const processSubmission = async (
  selectedFile: File | null,
  secretKey: string,
  selectedRegion: string
) => {
  if (selectedFile) {
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await fetch("api/truecaller/getPhoneDetails", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `${secretKey}`,
          Region: selectedRegion,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to process CSV");
      }

      const jsonData = await response.json();
      if (jsonData.length === 0) {
        throw new Error("No data found");
      }
      console.log("JSON Data:", jsonData);
      await generatePDF(jsonData);
    } catch (error) {
      console.error("Error processing CSV:", error);
    }
  } else {
    console.error("No file selected");
  }
};
