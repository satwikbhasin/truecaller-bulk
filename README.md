# Truecaller Bulk

Truecaller Bulk is a web application that allows users to look up multiple phone numbers on Truecaller in one go. This project leverages the Truecaller API to fetch details for phone numbers provided in a CSV file and generates a PDF report with the results.

Try it [here](https://truecaller-bulk.vercel.app)

You can get an API key from RapidAPI [here](https://rapidapi.com/DataCrawler/api/truecaller4). Please note that the API is rate-limited to 20 requests per minute which means your csv file should not contain more than 20 phone numbers.

## Features

- Upload a CSV file containing phone numbers.
- Fetch details for each phone number using the Truecaller API.
- Generate a PDF report with the fetched details.
- Supports different regions and secret keys for API access.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [NextUI](https://nextui.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF), [pdf-lib](https://github.com/Hopding/pdf-lib), [pdfmake](https://github.com/bpampuch/pdfmake)
- **CSV Parsing**: [csv-parser](https://github.com/mafintosh/csv-parser)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [React](https://reactjs.org/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)
- **HTTP Requests**: [node-fetch](https://github.com/node-fetch/node-fetch)

## Instructions

1. **Upload a CSV File**: Select your CSV file containing phone numbers to upload. Ensure your CSV file follows the format shown below:
  <img src="public/assets/csv_example_git.png" alt="Upload CSV" width="200"/>

2. **Select Region**: Choose the region for the phone numbers from the dropdown menu.

4. **Enter Secret Key**: Provide your secret key for API access. 
    - You can get your API Key here: https://rapidapi.com/DataCrawler/api/truecaller4/pricing

5. **Submit**: Click on the "Submit" button to process the phone numbers.

6. **Download PDF Report**: Once the processing is complete, open the downloaded PDF report.
