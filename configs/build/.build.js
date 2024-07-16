const fs = require("fs-extra");

async function convertToOneLine(filePath, outputPath) {
    const content = await fs.readFile(filePath, "utf8");
    const oneLined = content.replace(/\s+/g, " ").replace(/\\/g, "\\\\").trim();
    await fs.writeFile(outputPath, oneLined);
}

convertToOneLine("cspt.js", "cspt.min.js");
