import { exec } from "child_process";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { promisify } from 'util';
import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import mime from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const frontend_dir_path = dirname(__dirname);
const execAsync = promisify(exec);

console.log("Running build...")
const buildCommand = `cd ${frontend_dir_path} && npm run clean-build`
try {
    await execAsync(buildCommand);
} catch (error) {
    console.error("Error happened while building static files:", error);
    process.exit(1);
}
console.log('Build complete');


const bucketName = 'estimo-deployment-bucket'
const region = 'eu-west-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;
const kmsKeyARN = process.env.S3_DEPLOYMENT_KMS_ARN || "";
const uploadedFolder = path.resolve(__dirname, '../build');

console.log(`Emptying bucket: ${bucketName}`)
const emptyBucketCommand = `aws s3 rm s3://${bucketName} --recursive`
try {
    await execAsync(emptyBucketCommand);
} catch (error) {
    console.error("Error happened while deleting files from bucket:", error);
    process.exit(1);
}
console.log(`Bucket content emptied`)


console.log(`Uploading to bucket ${bucketName} in ${region}`)
console.log(`Your credentials: ${accessKeyId}, ${secretAccessKey}`)

var s3 = null;
try{
    s3 = new S3Client({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            sessionToken: sessionToken
        },
    });
    const data = await s3.send(new ListBucketsCommand({}));
    console.log("Successfully listed buckets:", data.Buckets);
} catch(error){
    console.error("Error while establishing connection:", error);
    process.exit(1);
}



async function getFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(
            async entry => {
                const res = path.resolve(dir, entry.name);
                return entry.isDirectory() ? getFiles(res) : res;
            }));
    return files.flat();
}

async function uploadFile(filePath) {
    const fileContent = await fs.readFile(filePath);
    const relativePath = path.relative(uploadedFolder, filePath).replace(/\\/g, "/");
    const contentType = mime.lookup(filePath);

    const params = {
        Bucket: bucketName,
        Key: relativePath,
        Body: fileContent,
        ServerSideEncryption: "aws:kms",
        SSEKMSKeyId: kmsKeyARN,
        ContentType: contentType
    };

    await s3.send(new PutObjectCommand(params));
    console.log(`Uploaded: ${relativePath}`);
}

async function uploadFolder() {
    const files = await getFiles(uploadedFolder);
    for (const file of files) {
        await uploadFile(file);
    }
}

try{
    uploadFolder()
}catch(error){
    console.error("Error while uploading files:", error);
    process.exit(1);
}