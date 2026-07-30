import fs from "fs";
import path from "path";
import archiver from "archiver";

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "prisma", "data");
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
const BACKUP_DIR = path.join(ROOT_DIR, "backups");

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function getTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}_${h}${min}`;
}

async function createBackupArchive(): Promise<string> {
  ensureBackupDir();

  const timestamp = getTimestamp();
  const backupPath = path.join(BACKUP_DIR, `vvh-backup-${timestamp}.zip`);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(backupPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(backupPath));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    // Add SQLite database
    const dbPath = path.join(DATA_DIR, "vvh.db");
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: "data/vvh.db" });
    } else {
      console.warn("Warning: SQLite database not found at", dbPath);
    }

    // Add uploads directory if it exists
    if (fs.existsSync(UPLOADS_DIR)) {
      archive.directory(UPLOADS_DIR, "uploads");
    }

    // Add .env file (without secrets being exposed, just config)
    const envPath = path.join(ROOT_DIR, ".env");
    if (fs.existsSync(envPath)) {
      archive.file(envPath, { name: ".env" });
    }

    archive.finalize();
  });
}

async function main() {
  console.log("Starting backup...");

  try {
    const backupPath = await createBackupArchive();
    const stats = fs.statSync(backupPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`Backup created successfully: ${backupPath}`);
    console.log(`Size: ${sizeMB} MB`);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
}

main();