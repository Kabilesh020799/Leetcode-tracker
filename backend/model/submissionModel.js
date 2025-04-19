const fs = require("fs");
const path = require("path");
const gitService = require("../services/gitService");
const googleSheetService = require("../services/excelService"); // replace excelService if needed

exports.submit = async ({
  problemName,
  difficulty,
  code,
  leetcodeLink,
  filename,
}) => {
  // Basic validation
  if (!problemName || !difficulty || !code || !leetcodeLink || !filename) {
    throw new Error(
      "Missing one or more required fields: problemName, difficulty, code, leetcodeLink, filename"
    );
  }
  const safeDifficulty = difficulty.toLowerCase();
  const folder = path.join(__dirname, "..", safeDifficulty);
  const filePath = path.join(folder, filename);
  // Ensure folder exists
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  // Save code to file
  fs.writeFileSync(filePath, code);
  console.log(filePath);

  // Append to Google Sheet (or Excel)
  await googleSheetService.appendSubmission({
    problemName,
    leetcodeLink,
    filename,
    difficulty,
  });

  // Push to GitHub (your dynamic repo logic)
  await gitService.pushToDifferentRepo(filePath, problemName, difficulty);

  return "Submission recorded and pushed to GitHub";
};
