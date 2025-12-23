# EyesOnCalendar (Shift Management System)

这是一个基于 Next.js 构建的排班管理系统 (EOC)，旨在帮助团队轻松管理每月的排班、人员以及分组信息。

## 1. 初始配置与本地开发

### 初始数据修改
本项目使用本地 JSON 文件作为数据源，无需配置数据库。
*   **数据位置**: 项目根目录下的 `data/` 文件夹。
*   **主要文件**: `YYYYMMshift.json` (例如 `202512shift.json`)。
*   **修改方式**:
    1.  可以直接编辑 JSON 文件来初始化数据（如年份、月份、POD名称、初始人员列表）。
    2.  `shiftmapping.json` 用于存储一些映射关系（如需）。
    3.  **注意**: 系统启动时会自动检查并修复数据结构（如确保 "Default" 组包含所有人），因此手动修改时只需保证基本格式正确。

### 本地运行与调试
1.  **安装依赖**:
    确保已安装 Node.js，然后在终端运行：
    ```bash
    npm install
    ```

2.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

3.  **访问应用**:
    打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

4.  **调试**:
    *   代码修改后页面会自动热更新。
    *   可以在 VS Code 中使用调试终端查看 `console.log` 输出。

## 2. 功能指南

### 📅 排班日历 (Shift Calendar)
这是系统的主页，用于查看和管理日常排班。
*   **查看视图**:
    *   点击顶部的标签页（如 "Default", "Team A"）切换不同分组的视图。
    *   "Default" 组默认包含所有成员。
*   **编辑排班**:
    *   点击任意排班单元格，弹出编辑框。
    *   选择工作状态（W: 工作, O: 休假, L: 请假等）并保存。
    *   *灰色背景的日期为锁定日期，不可编辑。*

### 👥 人员管理 (People Management)
点击右上角的 **"Manage People & Groups"** 按钮进入。
*   **添加新用户**:
    *   输入 **Alias** (唯一ID) 和 **Display Name**。
    *   点击 "Add User"。
    *   *新用户会自动加入 "Default" 组，并初始化当月排班。*

### 📂 分组管理 (Group Management)
在管理页面进行分组操作。
*   **创建新组**: 输入组名并创建。
*   **添加成员到组**:
    *   选择成员 -> 选择目标组 -> 点击 **"Add to Group"**。
    *   **核心机制**: 这是一个 **复制 (Copy)** 操作。成员会被添加到新组，同时保留在原有的 "Default" 组和其他组中。
    *   *系统会自动防止重复添加。*

## 3. 部署说明
关于部署到 Azure App Service 的详细步骤，请参考: [DEPLOY_TO_AZURE.md](./DEPLOY_TO_AZURE.md)
