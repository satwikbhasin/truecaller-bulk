import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { saveAs } from "file-saver";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const createTable = (item: any) => {
  try {
    console.log("Creating table for item:", item);
    return {
      table: {
        headerRows: 1,
        widths: ["25%", "75%"],
        body: [
          [{ text: "Phone Number", style: "normal" }, { text: item.phone }],
          [
            { text: "Name", style: "normal" },
            {
              text:
                item.status && item.data[0].name
                  ? item.data[0].name
                  : "Unknown",
              style: "bold",
            },
          ],
        ],
      },
      layout: "fullBorders",
    };
  } catch (error: any) {
    console.error("Error creating table:", error);
    throw new Error("Error creating table:", error);
  }
};

const splitIntoPages = (data: any, limit: any) => {
  console.log("Splitting data into pages with limit:", limit);
  const pages = [];
  let currentPage: any = [];

  for (let i = 0; i < data.length; i += 2) {
    const groups = [];
    try {
      const firstData = data[i];
      const secondData = data[i + 1];

      console.log("Processing data pair:", { firstData, secondData });

      groups.push({
        columns: [
          createTable(firstData),
          secondData ? createTable(secondData) : {},
        ],
        columnGap: 20,
        margin: [0, 15],
      });
    } catch (error: any) {
      console.error("Error splitting data into pages:", error);
      throw new Error("Error splitting data into pages:", error);
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

  console.log("Pages created:", pages);
  return pages;
};

export const generatePDF = async (results: any) => {
  try {
    console.log("Generating PDF with results:", results);
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

    console.log("Document definition created:", docDefinition);

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: any) => {
      console.log("PDF generated, saving as results.pdf");
      saveAs(blob, "results.pdf");
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    throw new Error("Error generating PDF:", error);
  }
};
