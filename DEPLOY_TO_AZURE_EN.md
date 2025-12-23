# Guide to Deploying to Azure App Service

This guide will walk you through how to deploy the Shift Management System to Azure App Service.

---

## Deployment Steps

### 1. Preparation
*   Ensure you have an Azure account.
*   Ensure [VS Code](https://code.visualstudio.com/) and Node.js v20.xx installed locally。
*   Install the **Azure App Service** extension (ms-azuretools.vscode-azureappservice).

### 2. Build the Project
Before deploying, ensure the project builds successfully locally.
Open a terminal and run:
```bash
npm install
npm run build
```
If the build is successful, you will see a generated `.next` folder.

Open a terminal and run:
```bash
npm run dev
```
Go to http://localhost:3000 your site is started.

### 3. Create Azure App Service
1.  Open the Azure icon on the left side of VS Code.
2.  In the "App Service" area, click "+" (Create New Web App).
3.  **Name**: Enter a globally unique name (e.g., `my-shift-app-2025`).
4.  **Runtime Stack**: Select **Node.js 20 LTS** (or a newer version).
5.  **Pricing Tier**: Select **Free (F1)** for testing, or **Basic (B1)** for production.
6.  Wait for the resource creation to complete.

### 5. Deploy Code
**Method A: Using VS Code (Easiest)**
1.  In the VS Code Azure extension, right-click the Web App you just created.
2.  Select **"Deploy to Web App..."**.
3.  Select the current project folder (`shift-management-app`).
4.  Click "Yes" to confirm deployment.
5.  Wait for deployment to complete, then click "Browse Website" to view.

**Method B: Using Local Git**
1.  In the App Service in the Azure Portal, go to **Deployment Center**.
2.  Select **Local Git** and save.
3.  Get the Git Clone URL and deployment credentials.
4.  Add the remote repository locally and push:
    ```bash
    git remote add azure <deployment_url>
    git push azure main
    ```

**Configuration Steps**:

1.  Find your App Service in the Azure Portal.
2.  Go to **Settings** -> **Configuration** -> **Application Settings**.
3.  Add a new Application Setting:
    *   **Name**: `WEBSITES_ENABLE_APP_SERVICE_STORAGE`
    *   **Value**: `true`
4.  Save the settings and restart the app.

**Principle Explanation**:
Setting `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true` tells Azure to mount the `/home` directory as persistent storage. Since your project code (including the `data/` folder) is deployed under `/home/site/wwwroot/`, changes to JSON files in the `data/` directory will be preserved without needing to modify any code or configure extra Storage Mounts.

### 6. Configure Port
**Configuration Steps**:

1.  Find your App Service in the Azure Portal.
2.  Go to **Settings** -> **Configuration** -> **Application Settings**.
3.  Add a new Application Setting:
    *   **Name**: `PORT`
    *   **Value**: `3000`
4.  Save the settings and restart the app.
