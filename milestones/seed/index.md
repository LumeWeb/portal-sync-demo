# Portal Sync Demo Guide: Seeding a Log with `simple-seeder`

This guide provides instructions on how to seed a log using the `simple-seeder` npm package with the hyperbee option. We'll cover how to retrieve the log key and use it with the `simple-seeder` tool.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Retrieving the Log Key](#retrieving-the-log-key)
3. [Installing and Running `simple-seeder`](#installing-and-running-simple-seeder)
4. [Monitoring the Seeding Process](#monitoring-the-seeding-process)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js and npm (Node Package Manager) installed on your system
- Internet connection
- Basic familiarity with command-line operations

## Retrieving the Log Key

1. Open a web browser and navigate to:
   ```
   https://sync.alpha.pinner.xyz/api/log/key
   ```

2. You should see a JSON response containing a "key" value, similar to:
   ```json
   {
     "key": "990f2e9a992f196e2e5342a880a223885a5257b9c428e630e4ea80feafe06ab"
   }
   ```

3. Copy this key value carefully. You'll need it for the seeding process. The key doesn't change, but be cautious to avoid copying errors.

## Installing and Running `simple-seeder`

1. Open a terminal or command prompt.

2. Run the following command to use npx to run `simple-seeder` without installing it globally:
   ```
   npx simple-seeder -b KEY
   ```
   Replace `KEY` with the log key you copied in the previous step.

3. If prompted to install the package, type 'y' and press Enter.

4. The seeder will start running, connecting to the hyperbee network and beginning to seed the log data.

## Monitoring the Seeding Process

- The `simple-seeder` tool will display progress information in the terminal.
- You may see connection messages, sync status, and other relevant information.
- The process will continue running until you stop it manually (usually with Ctrl+C).

## Troubleshooting

- **Package Installation Issues**:
    - Ensure you have the latest version of Node.js and npm installed.
    - If you encounter permission errors, you may need to run the command with sudo (on Linux/Mac) or as an administrator (on Windows).

- **Connection Problems**:
    - Check your internet connection.
    - Ensure that your firewall isn't blocking the connection.

- **Invalid Key Error**:
    - Double-check that you've copied the entire key correctly from the API response. The key doesn't change, so errors are likely due to incorrect copying.
    - If you're sure you've copied correctly but still have issues, try retrieving the key again to confirm.

- **Unexpected Behavior**:
    - Check the `simple-seeder` documentation for any specific error messages you encounter.
    - Consider updating to the latest version of `simple-seeder` if you're experiencing issues.

For persistent issues, refer to the `simple-seeder` project's issue tracker or seek support from the project maintainers.
