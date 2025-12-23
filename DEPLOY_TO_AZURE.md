# 部署到 Azure App Service 指南

本指南将指导你如何将 Shift Management System 部署到 Azure App Service。

---

## 部署步骤

### 1. 准备工作
*   确保你拥有一个 Azure 账号。
*   确保本地安装了 [VS Code](https://code.visualstudio.com/) 和 Node.js v20.xx版本。
*   安装 **Azure App Service** 扩展 (ms-azuretools.vscode-azureappservice)。

### 2. 构建项目
在部署之前，确保项目可以在本地成功构建。
打开终端运行：
```bash
npm run build
```
如果构建成功，你会看到生成的 `.next` 文件夹。
打开终端运行：
```bash
npm install
npm run dev
```
访问http://localhost:3000能看到网站成功启动。

### 3. 创建 Azure App Service
1.  打开 VS Code 左侧的 Azure 图标。
2.  在 "App Service" 区域，点击 "+" (Create New Web App)。
3.  **Name**: 输入一个全局唯一的名称 (例如 `my-shift-app-2025`)。
4.  **Runtime Stack**: 选择 **Node.js 20 LTS** (或更高版本)。
5.  **Pricing Tier**: 选择 **Free (F1)** 用于测试，或 **Basic (B1)** 用于生产。
6.  等待资源创建完成。

### 5. 部署代码
**方法 A: 使用 VS Code (最简单)**
1.  在 VS Code Azure 插件中，右键点击刚才创建的 Web App。
2.  选择 **"Deploy to Web App..."**。
3.  选择当前项目文件夹 (`shift-management-app`)。
4.  点击 "Yes" 确认部署。
5.  等待部署完成，点击 "Browse Website" 查看。

**方法 B: 使用 Local Git**
1.  在 Azure Portal 的 App Service 中，进入 **Deployment Center**。
2.  选择 **Local Git** 并保存。
3.  获取 Git Clone URL 和部署凭证。
4.  在本地添加远程仓库并推送:
    ```bash
    git remote add azure <deployment_url>
    git push azure main
    ```

**配置步骤**:

1.  在 Azure Portal 中找到你的 App Service。
2.  进入 **Settings** -> **Configuration** -> **Application Settings**。
3.  添加一个新的 Application Setting:
    *   **Name**: `WEBSITES_ENABLE_APP_SERVICE_STORAGE`
    *   **Value**: `true`
4.  保存设置并等待应用重启。

**原理说明**:
设置 `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true` 后，Azure 会将 `/home` 目录挂载为持久化存储。由于你的项目代码（包括 `data/` 文件夹）部署在 `/home/site/wwwroot/` 下，因此 `data/` 目录中的 JSON 文件修改将会被保留，无需修改任何代码或配置额外的 Storage Mount。

### 6. 配置端口
**配置步骤**:

1.  在 Azure Portal 中找到你的 App Service。
2.  进入 **Settings** -> **Configuration** -> **Application Settings**。
3.  添加一个新的 Application Setting:
    *   **Name**: `PORT`
    *   **Value**: `3000`
4.  保存设置并等待应用重启。