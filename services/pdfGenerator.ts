import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { saveAs } from "file-saver";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const createTable = (item: any) => {
  try {
    return {
      table: {
        headerRows: 1,
        widths: ["25%", "75%"],
        body: [
          [
            { text: "Phone Number", style: "normal" },
            { text: item.phones[0]?.e164Format ?? "UNKNOWN", style: "bold" },
          ],
          [
            { text: "Name", style: "normal" },
            { text: item.name ?? "UNKNOWN", style: "bold" },
          ],
          [
            { text: "Email", style: "normal" },
            { text: item.internetAddresses[0]?.id ?? "UNKNOWN", style: "bold" },
          ],
          [
            { text: "Gender", style: "normal" },
            { text: item.gender ?? "UNKNOWN", style: "bold" },
          ],
          [
            { text: "City", style: "normal" },
            { text: item.addresses[0]?.city ?? "UNKNOWN", style: "bold" },
          ],
          [
            { text: "Carrier", style: "normal" },
            { text: item.phones[0]?.carrier ?? "UNKNOWN", style: "bold" },
          ],
        ],
      },
      layout: "fullBorders",
    };
  } catch (error) {
    console.error("Error creating table:", error);
    return {
      table: {
        headerRows: 1,
        widths: ["100%"],
        body: [[{ text: "Error creating table", style: "error" }]],
      },
      layout: "fullBorders",
    };
  }
};

const splitIntoPages = (data: any, limit: any) => {
  const pages = [];
  let currentPage: any = [];

  for (let i = 0; i < data.length; i += 2) {
    const groups = [];
    try {
      const firstData = data[i]?.data?.[0];
      const secondData = data[i + 1]?.data?.[0];

      if (!firstData) {
        throw new Error(`Data at index ${i} is undefined or invalid`);
      }

      groups.push({
        columns: [
          createTable(firstData),
          secondData ? createTable(secondData) : {},
        ],
        columnGap: 20,
        margin: [0, 15],
      });
    } catch (error) {
      console.error(`Error creating table for data index ${i}:`, error);
      groups.push({
        columns: [
          { text: `Error creating table for data index ${i}`, style: "error" },
          i + 1 < data.length
            ? {
                text: `Error creating table for data index ${i + 1}`,
                style: "error",
              }
            : {},
        ],
        columnGap: 20,
        margin: [0, 15],
      });
    }

    groups.forEach((group) => {
      if (currentPage.length < limit) {
        currentPage.push(group);
      } else {
        pages.push(currentPage);
        currentPage = [group];
      }
    });
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

export const generatePDF = async (results: any) => {
  try {
    const pages = splitIntoPages(results, 4);

    const docDefinition = {
      content: [
        {
          text: "Truecaller Bulk Report",
          style: "header",
          margin: [0, 0, 0, 20],
          alignment: "center",
          color: "#23A4BC",
        },
        ...pages
          .flatMap((page, pageIndex) => [
            ...page,
            pageIndex < pages.length - 1
              ? { text: "", pageBreak: "after" }
              : null,
          ])
          .filter(Boolean),
      ],
      footer: (currentPage: number, pageCount: number): any => ({
        columns: [
          { text: `${currentPage} of ${pageCount}`, alignment: "center" },
        ],
        margin: [0, 0, 0, 20],
      }),
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: "#23A4BC",
        },
        normal: {
          fontSize: 12,
          bold: false,
        },
        bold: {
          fontSize: 12,
          bold: true,
        },
        error: {
          fontSize: 12,
          bold: true,
          color: "red",
        },
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: any) => {
      saveAs(blob, "results.pdf");
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
