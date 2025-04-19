const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
const { execSync } = require("child_process");

const REMOTE_REPO_URL = process.env.GITHUB_URL;
const TARGET_BRANCH = "master";

exports.pushToDifferentRepo = async (filePath, problemName, difficulty) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const filename = path.basename(filePath);
    const commitMessage = `Add ${problemName} (${difficulty})`;

    const tempRepoPath = path.join(__dirname, "temp_clone");

    if (fs.existsSync(tempRepoPath)) {
      fs.rmSync(tempRepoPath, { recursive: true, force: true });
      console.log("🧼 Cleaned temp_clone folder");
    }

    try {
      execSync('eval "$(ssh-agent -s)"');
      execSync("ssh-add /render/secrets/id_rsa");
      console.log("🔐 SSH key added");
    } catch (err) {
      console.error("❌ Failed to load SSH key:", err.message);
    }
    const git = simpleGit();
    console.log("📥 Cloning repo...");
    await git.clone(REMOTE_REPO_URL, tempRepoPath);

    const difficultyFolder = path.join(tempRepoPath, difficulty.toLowerCase());
    fs.mkdirSync(difficultyFolder, { recursive: true });

    const destFile = path.join(difficultyFolder, filename);
    fs.writeFileSync(destFile, fileContent);
    console.log("📄 File written to:", destFile);

    const clonedRepo = simpleGit({ baseDir: tempRepoPath });
    const status = await clonedRepo.status();

    if (status.files.length === 0) {
      console.log("⚠️ No changes to commit. Skipping push.");
      return;
    }

    await clonedRepo.add(".");
    await clonedRepo.commit(commitMessage);

    await clonedRepo.push("origin", TARGET_BRANCH);
  } catch (err) {
    console.error("❌ Error pushing to GitHub:", err.message);
  }
};
