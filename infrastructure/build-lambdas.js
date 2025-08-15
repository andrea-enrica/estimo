#!/usr/bin/env node

const { exec } = require("child_process");
const { readdirSync, statSync, existsSync } = require("fs");
const { join } = require("path");

const baseDir = process.argv[2] || process.cwd();

function findPackageDirs(dir, result = []) {
    if (dir.includes("scripts") || dir.includes("node_modules")) {
        return result;
    }

    const entries = readdirSync(dir);

    if (entries.includes("package.json")) {
        result.push(dir);
    }

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        if (statSync(fullPath).isDirectory()) {
            findPackageDirs(fullPath, result);
        }
    }
    return result;
}

const packageDirs = findPackageDirs(baseDir);

if (packageDirs.length === 0) {
    console.log("No package.json files found.");
    process.exit(0);
}

packageDirs.forEach((dir) => {
    console.log(`Running build in ${dir}`);
    exec("npm i && npm run build", { cwd: dir }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error in ${dir}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr in ${dir}: ${stderr}`);
        }
        console.log(stdout);
    });
});