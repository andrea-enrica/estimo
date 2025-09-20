import { exec } from "child_process";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { promisify } from "util";
import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import fs from "fs/promises";
import mime from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const frontend_dir_path = dirname(__dirname);
const execAsync = promisify(exec);

// 1) Build
console.log("Running build...");
try {
    await execAsync(`cd ${frontend_dir_path} && npm run clean-build`);
    console.log("Build complete");
} catch (error) {
    console.error("Error building static files:", error);
    process.exit(1);
}

// 2) Config
const bucketName = "estimo-deployment-bucket";
const region = "eu-west-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;
const kmsKeyARN = process.env.S3_DEPLOYMENT_KMS_ARN || ""; // leave empty to use AWS-managed KMS key
const uploadedFolder = path.resolve(__dirname, "../build");
const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID; // e.g. E262S7I4GQBE14

// 3) Empty bucket via CLI (fine)
console.log(`Emptying bucket: ${bucketName}`);
try {
    await execAsync(`aws s3 rm s3://${bucketName} --recursive`);
    console.log("Bucket content emptied");
} catch (error) {
    console.error("Error deleting files from bucket:", error);
    process.exit(1);
}

// 4) S3 client sanity check
console.log(`Uploading to bucket ${bucketName} in ${region}`);
try {
    const s3 = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey, sessionToken },
    });
    const data = await s3.send(new ListBucketsCommand({}));
    console.log("Successfully listed buckets:", data.Buckets);

    async function getFiles(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (e) => {
            const p = path.resolve(dir, e.name);
            return e.isDirectory() ? getFiles(p) : p;
        }));
        return files.flat();
    }

    async function uploadFile(filePath) {
        const fileContent = await fs.readFile(filePath);
        const relativePath = path.relative(uploadedFolder, filePath).replace(/\\/g, "/");
        const contentType = mime.lookup(filePath) || "application/octet-stream";

        const sse = kmsKeyARN
            ? { ServerSideEncryption: "aws:kms", SSEKMSKeyId: kmsKeyARN }
            : { ServerSideEncryption: "aws:kms" }; // uses AWS-managed KMS key

        // cache: index.html no-cache; assets long-lived
        const isIndex = relativePath === "index.html";
        const cacheControl = isIndex
            ? "no-cache, no-store, must-revalidate"
            : "public, max-age=31536000, immutable";

        await s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: relativePath,
            Body: fileContent,
            ContentType: contentType,
            CacheControl: cacheControl,
            ...sse,
        }));
        console.log(`Uploaded: ${relativePath}`);
    }

    async function uploadFolder() {
        const files = await getFiles(uploadedFolder);
        // sequential is fine; you can parallelize if you like
        for (const file of files) {
            await uploadFile(file);
        }
    }

    await uploadFolder(); // <-- IMPORTANT: await
    console.log("All files uploaded");

    // 5) CloudFront invalidation (optional but recommended)
    if (distributionId) {
        const cf = new CloudFrontClient({ region: "us-east-1" }); // CloudFront control plane
        await cf.send(new CreateInvalidationCommand({
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: `${Date.now()}`,
                Paths: { Quantity: 2, Items: ["/index.html", "/"] }, // or "/*" for full
            },
        }));
        console.log("CloudFront invalidation submitted");
    } else {
        console.log("No CLOUDFRONT_DISTRIBUTION_ID set; skipping invalidation");
    }

} catch (error) {
    console.error("Deployment error:", error);
    process.exit(1);
}
