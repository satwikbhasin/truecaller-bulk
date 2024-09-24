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
          [{ text: "Phone Number", style: "normal" }, { text: item.phone }],
          [
            { text: "Name", style: "normal" },
            {
              text: item.status ? item.data[0].name : "Unknown",
              style: "bold",
            },
          ],
        ],
      },
      layout: "fullBorders",
    };
  } catch (error: any) {
    throw new Error("Error creating table:", error);
  }
};

const splitIntoPages = (data: any, limit: any) => {
  const pages = [];
  let currentPage: any = [];

  for (let i = 0; i < data.length; i += 2) {
    const groups = [];
    try {
      const firstData = data[i];
      const secondData = data[i + 1];

      groups.push({
        columns: [
          createTable(firstData),
          secondData ? createTable(secondData) : {},
        ],
        columnGap: 20,
        margin: [0, 15],
      });
    } catch (error: any) {
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
  } catch (error: any) {
    throw new Error("Error generating PDF:", error);
  }
};
