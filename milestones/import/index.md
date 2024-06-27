# Portal Sync Demo Guide - File Import

This guide provides instructions for using the Portal Sync Demo to import both small and large files using a single command-line application. The demo showcases the process of importing files using provided file hashes and verifying the imports in the Renterd instance.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Setup and File Import Process](#setup-and-file-import-process)
4. [Verifying Imports in Renterd](#verifying-imports-in-renterd)
5. [Troubleshooting](#troubleshooting)

## Project Overview

The Portal Sync Demo consists of a Go application capable of importing both small and large files. The application is located in the current directory, alongside this guide.

## Prerequisites

- Go programming language
- File hashes for the files you want to import (both small and large)
- Internet connection

## Setup and File Import Process

Assuming you're in the directory containing the `main.go` file:

1. Build the application:
   ```
   go build -o file-import
   ```

2. Run the application with a file hash:
   ```
   ./file-import -hash YOUR_FILE_HASH_HERE
   ```
   Replace `YOUR_FILE_HASH_HERE` with the actual hash of the file you want to import (works for both small and large files).

3. The application will automatically:
    - Generate a random account
    - Import the file associated with the provided hash

4. Wait for the import to complete. The application will display progress in the console.

5. Repeat the process with different file hashes for importing multiple files (both small and large).

## Verifying Imports in Renterd

After completing the file imports, you can verify that the files were successfully imported to the "s5" bucket in the Renterd instance.

1. Open a web browser and navigate to:
   ```
   http://SERVER:9980/buckets/s5/files
   ```
   Replace `SERVER` with the actual address or IP of your Renterd instance.

2. You should see a list of files in the "s5" bucket.

3. Look for the files corresponding to the hashes you provided during the import process.

4. Verify that all imported files are present in the list.

5. You can click on individual files to view more details, including size and other metadata.

## Troubleshooting

- **Import Application**:
    - If you encounter "command not found" errors, ensure Go is correctly installed and added to your PATH.
    - For network-related issues, check your internet connection and firewall settings.

- **Hash Errors**:
    - If the import fails due to an invalid hash, double-check that you've entered the correct hash for the file you want to import.
    - Ensure that the file associated with the hash exists in the system you're importing from.

- **Import Process**:
    - If the import fails, try running the application again with the same hash.
    - For large files, the import process may take longer. Be patient and allow the process to complete.

- **Import Verification**:
    - If you can't find the imported files in the Renterd instance, double-check that you're looking in the correct "s5" bucket.
    - Ensure that you've waited long enough for the import process to complete, especially for large files.
    - Verify that the Renterd instance is properly connected and functioning.
    - If you can't access the Renterd web interface, check that the Renterd service is running and that you're using the correct SERVER address and port.

For any persistent issues, please refer to the project's issue tracker or contact the development team for support.

Note: If you need to clone the repository, you can use:
```
git clone https://github.com/LumeWeb/portal-sync-demo.git
```
Then navigate to the appropriate directory containing the `main.go` file.