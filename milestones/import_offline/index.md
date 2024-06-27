# Portal Sync Demo Guide: Offline Import with Continuous Seeding

This guide provides instructions for performing an "offline" import where the primary portal becomes unavailable, made possible by continuous seeding of the data. We'll use the `@lumeweb/portal-sync-simple-seeder` package to keep the data online and the previously demonstrated import tool to perform the import.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Overview](#overview)
3. [Step 1: Running the Seeder](#step-1-running-the-seeder)
4. [Step 2: Primary Portal Offline Scenario](#step-2-primary-portal-offline-scenario)
5. [Step 3: Import Process](#step-3-import-process)
6. [Monitoring and Verification](#monitoring-and-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js and npm (for `@lumeweb/portal-sync-simple-seeder`)
- Go programming language (for the import tool)
- File hashes for the files you want to import
- Internet connection
- Basic familiarity with command-line operations
- The seed demo should have been previously run, creating the `../seed/corestore` directory

## Overview

In this scenario, we'll first start the seeder to ensure the data remains accessible on the network. Then, we'll simulate the primary portal going offline. Finally, we'll perform an offline import of files. This process demonstrates the resilience of the system, allowing for continued data accessibility and import capabilities even when the primary portal is unavailable.

## Step 1: Running the Seeder

First, we need to start the seeder to keep the data online and accessible:

1. Open a terminal or command prompt.

2. Retrieve the log key by navigating to:
   ```
   https://sync.alpha.pinner.xyz/api/log/key
   ```
   You should see a JSON response containing a "key" value.

3. Copy the key value carefully. The key doesn't change, but be cautious to avoid copying errors.

4. Run the following command to start the forked version of `simple-seeder`:
   ```
   npx @lumeweb/portal-sync-simple-seeder -b KEY -storage ../seed/corestore
   ```
   Replace `KEY` with the log key you copied.

5. If prompted to install the package, type 'y' and press Enter.

6. The seeder will start running, connecting to the hyperbee network and keeping the data accessible.

7. Leave this terminal window open to keep the seeder running continuously.

## Step 2: Primary Portal Offline Scenario

Now, we'll simulate the primary portal going offline:

1. At this point, assume that the primary portal (alpha.pinner.xyz) has gone offline.
2. In a real-world scenario, this could be due to maintenance, network issues, or other unforeseen circumstances.
3. Despite the primary portal being offline, the seeder you started in Step 1 continues to run, keeping the data accessible on the network.

## Step 3: Import Process

With the seeder running and keeping the data accessible, even though the primary portal is offline, we can now perform the offline import:

1. Open a new terminal window.

2. Navigate to the directory containing the import tool (where `main.go` is located).

3. Build the application if you haven't already:
   ```
   go build -o file-import
   ```

4. Run the application with a file hash:
   ```
   ./file-import -hash YOUR_FILE_HASH_HERE
   ```
   Replace `YOUR_FILE_HASH_HERE` with the actual hash of the file you want to import.

5. Repeat this process for each file you need to import.

6. The application will handle the import process, including generating a random account.

## Monitoring and Verification

- For the seeding process, monitor the console output of `@lumeweb/portal-sync-simple-seeder`. It should show connection status and activity related to serving the data.
- For the import process, watch the console output of the import tool for each file. It should indicate successful imports despite the primary portal being offline.
- You can verify the imports in Renterd by navigating to:
  ```
  http://SERVER:9980/buckets/s5/files
  ```
  Replace `SERVER` with the actual address or IP of your Renterd instance.

## Troubleshooting

- **Seeder Issues**:
    - Verify that you've copied the log key correctly.
    - Ensure Node.js and npm are up to date.
    - Check your firewall settings if you encounter connection issues.
    - Make sure the `../seed/corestore` directory exists and contains the necessary data from the seed demo.

- **Import Issues**:
    - Ensure you're using the correct file hashes.
    - Check that the import tool has necessary permissions and network access.
    - If imports fail, verify that the seeder is running and connected successfully.

- **General Network Problems**:
    - Confirm your internet connection is stable.
    - If using a VPN, try disabling it temporarily.

For persistent issues with the import tool or `@lumeweb/portal-sync-simple-seeder`, refer to their respective project documentation or issue trackers.

Remember, this process demonstrates the resilience of the network. The continuous seeding ensures data availability, allowing imports to proceed even when the primary portal is down.
