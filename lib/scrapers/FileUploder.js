const fs = require("fs-extra");
const path = require("path");
const { Catbox } = require("node-catbox");
const fileType = require("file-type");
const { tmpdir } = require("os");
const crypto = require("crypto");


class FileUploader {
    constructor() {
        if (FileUploader.instance) {
          return FileUploader.instance;
        }
        this.catbox = new Catbox();
        FileUploader.instance = this;
    }

    // Upload file from a file path
    async uploadToCatbox(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error("File does not exist");
        }

        try {
            const response = await this.catbox.uploadFile({
                path: filePath
            });

            if (response) {
                return response; // returns the uploaded file URL
            } else {
                throw new Error("Error retrieving file URL");
            }
        } catch (err) {
            throw new Error(String(err));
        }
    }

    // Upload file from a buffer
    async uploadFromBuffer(buffer, fileName) {
        const fileTypeResult = await fileType.fromBuffer(buffer);
        if (!fileTypeResult) {
            throw new Error("Unable to determine file type from buffer");
        }
        if (!fileName) filePath = `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}`;
        else filePath = fileName
        const extension = `.${fileTypeResult.ext}`; // Get the file extension
        const tempFilePath = path.join(tmpdir(), `${filePath}${extension}`); // Temporary file path

        try {
            // Write the buffer to a temporary file
            await fs.writeFile(tempFilePath, buffer);

            // Upload the temporary file
            const response = await this.uploadToCatbox(tempFilePath);

            // Remove the temporary file
            await this.removeFile(tempFilePath);

            return response;
        } catch (err) {
            throw new Error(String(err));
        }
    }

    // Upload file with specific MIME type (using buffer to determine type)
    async uploadFileWithMimeType(buffer, fileName, mimeType) {
        if (!fileName) filePath = `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}`;
        else filePath = fileName;
        
        try {
            const ext = this.getExtensionFromMimeType(mimeType);
            const extension = `.${ext}`; // Get the file extension
            const tempFilePath = path.join(tmpdir(), `${filePath}${extension}`); // Temporary file path with proper extension

            // Write the buffer to a temporary file
            await fs.writeFile(tempFilePath, buffer);

            // Upload the file
            const response = await this.uploadToCatbox(tempFilePath);

            // Remove the temporary file
            await this.removeFile(tempFilePath);

            return response;
        } catch (err) {
            throw new Error(String(err));
        }
    }
    
    // Helper method to extract extension from MIME type
    getExtensionFromMimeType(mimeType) {
    if (!mimeType) {
        throw new Error("MIME type is required");
    }

    const parts = mimeType.split('/');
    if (parts.length !== 2) {
        throw new Error("Invalid MIME type format");
    }

    return parts[1]; // The second part is usually the extension
}
    
    // Helper method to remove files
    async removeFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error(`Error deleting file: ${error}`);
        }
    }
}


module.exports = new FileUploader();