export const fetchPhoneDetails = async (
  selectedFile: File,
  secretKey: string,
  selectedRegion: string
) => {
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
    throw new Error(
      response.status === 403 || response.status === 429 || response.status === 400
        ? jsonData.message
        : "Failed to do bulk search"
    );
  }

  return jsonData;
};
