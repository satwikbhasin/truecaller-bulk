import { generatePDF } from "@/services/pdfGenerator";

export const processSubmission = async (
  selectedFile: File | null,
  secretKey: string,
  selectedRegion: string
) => {
  try {
    console.log("Starting processSubmission");

    if (!selectedFile) {
      console.error("No file selected");
      throw new Error("No file selected");
    }

    console.log("File selected:", selectedFile.name);

    const formData = new FormData();
    formData.append("file", selectedFile);
    console.log("Form data created");

    console.log("Sending POST request to api/truecaller/getPhoneDetails");
    const response = await fetch("api/truecaller/getPhoneDetails", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `${secretKey}`,
        Region: selectedRegion,
      },
    });

    console.log("Response received:", response.status);

    const jsonData = await response.json();
    console.log("Response JSON data:", jsonData);

    if (!response.ok) {
      console.error("Failed to process CSV:", jsonData.message);
      throw new Error(jsonData.message || "Failed to process CSV");
    }

    console.log("Generating PDF with results");
    await generatePDF(jsonData.results);
    console.log("PDF generated");

    return jsonData.limitExceeded;
  } catch (error: any) {
    console.error("Error in processSubmission:", error.message);
    throw error;
  }
};