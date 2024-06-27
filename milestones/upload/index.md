# Portal Sync Demo Guide: Uploading

This guide provides instructions for using the Portal Sync Demo for upload, including uploading both small and large files, and viewing the upload logs using the Electron-based log viewer application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Small File Upload Application](#small-file-upload-application)
5. [Large File Upload Application](#large-file-upload-application)
6. [Log Viewer Application](#log-viewer-application)
7. [Viewing Upload Logs](#viewing-upload-logs)
8. [Troubleshooting](#troubleshooting)

## Project Overview

The Portal Sync Demo consists of three main components:

1. `small`: Go application for uploading small files (up to 40MB)
2. `large`: Go application for uploading large files using the tus protocol
3. `../log-viewer-app`: Electron-based application for viewing upload logs

## Prerequisites

- Go programming language (for upload applications)
- Node.js and pnpm (for the log viewer app)
- Git (for cloning the repository)
- Internet connection

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/LumeWeb/portal-sync-demo.git
   cd portal-sync-demo
   ```

2. Set up the log viewer application:
   ```
   cd log-viewer-app
   pnpm install
   ```

## Small File Upload Application

1. Navigate to the `small` directory:
   ```
   cd ../milestones/upload/small
   ```

2. Set up the Go modules for the small file upload application:
   ```
   go mod download
   ```

3. Run the application:
   ```
   go run main.go
   ```

4. The application will automatically generate a random account, create a 40MB random file, and upload it.

5. Wait for the upload to complete. The application will display progress in the console.

6. No user input is required during this process.

## Large File Upload Application

1. Navigate to the `large` directory:
   ```
   cd ../large
   ```

2. Set up the Go modules for the large file upload application:
   ```
   go mod download
   ```

3. Run the application:
   ```
   go run main.go
   ```

4. This application uses the tus protocol for resumable uploads of large files.

5. The application will automatically generate a random account, create a large random file, and begin the upload process.

6. The application will display progress in the console.

7. No user input is required during this process.

## Log Viewer Application

1. Navigate back to the `log-viewer-app` directory:
   ```
   cd ../../log-viewer-app
   ```

2. Build and run the Electron app:
   ```
   pnpm run build
   ```

3. The application will launch, displaying an interface with an "Enter Hash" input field and a "Submit" button.

## Viewing Upload Logs

1. After an upload (small or large) is completed, open your web browser and navigate to:
   ```
   https://sync.alpha.pinner.xyz/api/log/key
   ```

2. You will see a JSON response containing a "key" value, similar to:
   ```json
   {
     "key": "990f2e9a992f196e2e5342a880a223885a5257b9c428e630e4ea80feafe06ab"
   }
   ```

3. Copy this key value.

4. In the log viewer application:
    - Paste the key into the "Enter Hash" field.
    - Click the "Submit" button.

5. The app will retrieve and display the log data for the specified upload. The available information may include:
    - File size
    - Upload status
    - Any error messages (if applicable)
    - Other metadata related to the upload process

Note: Currently, the upload time is not included in the log data. The exact fields and information available may vary depending on the upload type and any recent updates to the logging system.

6. Review the displayed information to verify the success of your upload and gather insights about the process.

7. If you need to check logs for multiple uploads, repeat steps 1-6 for each upload key.

## Troubleshooting

- **Upload Applications**:
    - If you encounter "command not found" errors, ensure Go is correctly installed and added to your PATH.
    - For network-related issues, check your internet connection and firewall settings.

- **Log Viewer Application**:
    - If the app fails to launch, ensure Node.js and pnpm are correctly installed.
    - For build errors, try deleting the `node_modules` folder and running `pnpm install` again.

- **Viewing Logs**:
    - If the log viewer fails to retrieve data, double-check that you've entered the correct hash.
    - Ensure you have an active internet connection.
    - If the API endpoint (sync.alpha.pinner.xyz) is unreachable, it may be temporarily down. Try again later or contact support.

For any persistent issues, please refer to the project's issue tracker or contact the development team for support.
