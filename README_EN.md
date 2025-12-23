# EyesOnCalendar (Shift Management System)

This is a Shift Management System (EOC) built with Next.js, designed to help teams easily manage monthly shifts, personnel, and group information.

## 1. Initial Configuration & Local Development

### Initial Data Modification
This project uses local JSON files as the data source, so no database configuration is required.
*   **Data Location**: The `data/` folder in the project root directory.
*   **Main File**: `YYYYMMshift.json` (e.g., `202512shift.json`).
*   **How to Modify**:
    1.  You can directly edit the JSON file to initialize data (such as year, month, POD name, initial personnel list).
    2.  `shiftmapping.json` is used to store some mapping relationships (if needed).
    3.  **Note**: The system automatically checks and repairs the data structure upon startup (e.g., ensuring the "Default" group contains everyone), so when manually modifying, just ensure the basic format is correct.

### Local Run & Debug
1.  **Install Dependencies**:
    Ensure Node.js is installed, then run in the terminal:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Access the App**:
    Open your browser and visit [http://localhost:3000](http://localhost:3000).

4.  **Debugging**:
    *   The page will automatically hot-reload after code changes.
    *   You can use the debug terminal in VS Code to view `console.log` output.

## 2. Feature Guide

### 📅 Shift Calendar
This is the main page of the system, used for viewing and managing daily shifts.
*   **View Modes**:
    *   Click the tabs at the top (e.g., "Default", "Team A") to switch views for different groups.
    *   The "Default" group contains all members by default.
*   **Edit Shift**:
    *   Click on any shift cell to open the edit popup.
    *   Select a work status (W: Work, O: Off, L: Leave, etc.) and save.
    *   *Dates with a gray background are locked and cannot be edited.*

### 👥 People Management
Click the **"Manage People & Groups"** button in the top right corner to enter.
*   **Add New User**:
    *   Enter **Alias** (Unique ID) and **Display Name**.
    *   Click "Add User".
    *   *New users are automatically added to the "Default" group, and their shifts for the current month are initialized.*

### 📂 Group Management
Manage groups on the management page.
*   **Create New Group**: Enter the group name and create it.
*   **Add Member to Group**:
    *   Select Member -> Select Target Group -> Click **"Add to Group"**.
    *   **Core Mechanism**: This is a **Copy** operation. The member will be added to the new group while remaining in the original "Default" group and any other groups.
    *   *The system automatically prevents duplicate additions.*

## 3. Deployment Instructions
For detailed steps on deploying to Azure App Service, please refer to: [DEPLOY_TO_AZURE_EN.md](./DEPLOY_TO_AZURE_EN.md)
