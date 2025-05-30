const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
const { execSync } = require("child_process");

const REMOTE_REPO_URL = process.env.GITHUB_URL;
const TARGET_BRANCH = "master"; // or "main" based on your GitHub repo

exports.pushToDifferentRepo = async (filePath, problemName, difficulty) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const rawFilename = path.basename(filePath);
    const filename = sanitizeFilename(rawFilename);
    const commitMessage = `Add ${problemName} (${difficulty})`;
    try {
      execSync('eval "$(ssh-agent -s)"');
      execSync("ssh-add /etc/secrets/id_rsa");
      console.log("✅ SSH key added");
    } catch (err) {
      console.error("❌ Failed to load SSH key:", err.message);
    }
    console.log("🚀 Starting GitHub push process...");
    console.log("📦 Filename:", filename);
    console.log("📝 Commit message:", commitMessage);

    const tempRepoPath = path.join(__dirname, "temp_clone");

    if (fs.existsSync(tempRepoPath)) {
      fs.rmSync(tempRepoPath, { recursive: true, force: true });
      console.log("🧼 Cleaned temp_clone folder");
    }
    process.env.GIT_SSH_COMMAND = "ssh -F /etc/secrets/ssh_config";
    console.log("📁 /etc/secrets contains:", fs.readdirSync("/etc/secrets"));
    console.log("🔐 Using SSH config at:", process.env.GIT_SSH_COMMAND);

    const git = simpleGit();
    console.log("📥 Cloning repo from:", REMOTE_REPO_URL);
    await git.clone(REMOTE_REPO_URL, tempRepoPath);

    const difficultyFolder = path.join(tempRepoPath, difficulty.toLowerCase());
    fs.mkdirSync(difficultyFolder, { recursive: true });
    const destFile = path.join(difficultyFolder, filename);
    fs.writeFileSync(destFile, fileContent);
    console.log("✅ File written to repo:", destFile);

    const clonedRepo = simpleGit({ baseDir: tempRepoPath });
    const status = await clonedRepo.status();
    console.log("📊 Git status:", status);

    if (status.files.length === 0) {
      console.log("⚠️ No changes to commit. Skipping push.");
      return;
    }

    await clonedRepo.add(".");
    console.log("➕ Staged all changes");

    await clonedRepo.commit(commitMessage);
    console.log("✅ Commit created");

    await clonedRepo.push("origin", TARGET_BRANCH);
    console.log("🚀 Pushed to GitHub:", TARGET_BRANCH);
  } catch (err) {
    console.error("❌ Error during GitHub push:", err.message);
    console.error(err.stack);
  }
};

function sanitizeFilename(name) {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return /^[a-zA-Z.]/.test(safe) ? safe : `file_${safe}`;
}
