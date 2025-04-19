const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const credentials = require("../service-accout.json");

// Load credentials

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "1ZOInX4QVbADoOtOVcyUYukWqe7PCZZa-K159p4Par3U";
const SHEET_NAME = "Sheet1";

exports.appendSubmission = async ({
  problemName,
  leetcodeLink,
  filename,
  difficulty,
}) => {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[problemName, leetcodeLink, filename, difficulty]],
    },
  });
};
