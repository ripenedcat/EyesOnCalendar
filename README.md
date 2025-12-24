# EyesOnCalendar - 班表管理系统

一个基于 Next.js 的现代化班表管理系统，支持多人排班、分组管理和数据持久化。

## 功能特性

### 核心功能
- **月度班表管理**: 可视化的月度排班表，支持多种工作类型（工作日、周末、年假、病假、培训等）
- **人员管理**: 添加、删除和管理团队成员
- **分组管理**: 创建和管理不同的团队分组（如：Azure Monitor、SCEM等）
- **全局配置**: 统一的人员和分组配置，自动同步到所有月份
- **日期锁定**: 支持锁定特定日期，防止误修改
- **权限控制**: 通过环境变量配置的管理员权限系统

### 技术特性
- **数据持久化**: 使用 PostgreSQL 数据库存储数据
- **JSONB 存储**: 利用 PostgreSQL JSONB 类型存储复杂的班表数据
- **乐观更新**: 前端即时响应，提升用户体验
- **Docker 支持**: 可以轻松打包为 Docker 镜像部署
- **响应式设计**: 支持桌面和移动端访问

## 技术栈

- **前端框架**: Next.js 16.0.8 + React 19.2.1
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL (推荐使用 Azure PostgreSQL Flexible Server)
- **部署**: Docker + Standalone 模式

## 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL 数据库
- npm 或 pnpm

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd EyesOnCalendar
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件：
```env
# PostgreSQL 数据库配置
PGHOST=your-postgres-host.postgres.database.azure.com
PGUSER=your-username
PGPORT=5432
PGDATABASE=eyesoncalendar
PGPASSWORD=your-password

```

4. **初始化数据库**
```bash
# 连接到 PostgreSQL 并执行
psql -h <PGHOST> -U <PGUSER> -d <PGDATABASE> -f scripts/init-db.sql
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### Docker 部署

1. **构建镜像**
```bash
docker build -f Dockerfile -t your-org/eyesoncalendar:latest .
```

2. **运行容器**
```bash
docker run -d \
  -p 3000:3000 \
  -e PGHOST=your-postgres-host \
  -e PGUSER=your-username \
  -e PGPORT=5432 \
  -e PGDATABASE=eyesoncalendar \
  -e PGPASSWORD=your-password \
  your-org/eyesoncalendar:latest
```

## 项目结构

```
EyesOnCalendar/
├── app/
│   ├── [year]/[month]/        # 月度班表页面
│   ├── api/                   # API 路由
│   │   ├── mapping/          # 映射配置 API
│   │   ├── shifts/           # 班表数据 API
│   │   ├── people/           # 人员管理 API
│   │   ├── groups/           # 分组管理 API
│   │   └── management/       # 管理页面 API
│   ├── components/           # React 组件
│   │   ├── ShiftGrid.tsx    # 班表网格组件
│   │   ├── PeopleManager.tsx # 人员管理组件
│   │   └── MonthNavigation.tsx # 月份导航组件
│   ├── management/           # 管理页面
│   └── page.tsx             # 首页（自动跳转到当前月）
├── lib/
│   ├── db.ts                # 数据库连接池
│   └── data.ts              # 数据访问层
├── types/
│   └── index.ts             # TypeScript 类型定义
├── scripts/
│   └── init-db.sql          # 数据库初始化脚本
└── public/                  # 静态资源
```

## 使用指南

### 创建新月份

1. 访问任意月份页面（如：`/2025/1`）
2. 如果该月数据不存在，点击"创建月份数据"按钮
3. 系统会从全局配置自动创建该月的班表数据

### 管理人员和分组

1. 点击右上角的"⚙️ Manage People & Groups"按钮
2. **添加成员**：输入 alias（用户标识）和显示名称
3. **删除成员**：点击成员旁边的删除按钮（会从所有月份删除）
4. **创建分组**：输入分组名称并创建
5. **删除分组**：点击分组旁边的删除按钮（"All"分组不可删除）
6. **分配成员到分组**：选择成员和目标分组，点击"Add to Group"（注意："All"分组不会出现在下拉列表中，因为所有成员自动属于"All"分组）

### 编辑班表

1. 在月度班表页面，点击任意单元格
2. 选择工作类型（W=工作日、AL=年假、SL=病假等）
3. 修改会立即保存到数据库

### 锁定日期

1. 点击日期列的锁定图标
2. 已锁定的日期会显示锁定标记
3. 只有 POWER_USERS 中的用户可以锁定/解锁日期

## 工作类型说明

| 代码 | 标签 | 含义 | 是否在岗 |
|------|------|------|----------|
| W | - | 工作日 | 是 (1.0) |
| MS | MS | 早班 | 是 (1.0) |
| NS | NS | 夜班 | 是 (1.0) |
| T | T | 培训 | 否 (0.0) |
| AL | AL | 年假 | 否 (0.0) |
| HMAL | H(M) | 上午年假 | 半天 (0.5) |
| HAAL | H(A) | 下午年假 | 半天 (0.5) |
| SL | SL | 病假 | 否 (0.0) |
| HMSL | H(M) | 上午病假 | 半天 (0.5) |
| HASL | H(A) | 下午病假 | 半天 (0.5) |
| PO | PO | 节假日值班 | 是 (1.0) |
| PM | PM | 节假日早班 | 是 (1.0) |
| PH | PH | 公共假期 | 否 (0.0) |
| WD | WD | 周末 | 否 (0.0) |
| TFL | TFL | 学习时间 | 否 (0.0) |

## 数据库架构

### shift_mapping 表
存储全局配置，包括：
- `day_types`: 工作类型定义（JSONB）
- `tag_groups`: 全局分组配置（JSONB）
- `global_people`: 全局人员列表（JSONB）

### shift_data 表
存储月度班表数据，包括：
- `year`, `month`: 年月标识
- `pod`: 团队名称
- `lockdate`: 锁定的日期数组
- `people`: 人员及其排班数据（JSONB）
- `tag_arrangement`: 月度分组配置（JSONB，自动从全局同步）

## 全局配置机制

系统采用全局配置 + 月度数据的双层架构：

1. **全局配置**（存储在 `shift_mapping` 表）：
   - 全局人员列表（`global_people`）
   - 全局分组配置（`tag_groups`）
   - 工作类型定义（`day_types`）

2. **月度数据**（存储在 `shift_data` 表）：
   - 每月的具体排班信息
   - 从全局配置自动同步人员和分组

3. **同步机制**：
   - 添加/删除人员：自动同步到所有现有月份
   - 创建/删除分组：自动同步到所有现有月份
   - 移动成员到不同分组：自动同步到所有现有月份
   - 创建新月份：自动从全局配置初始化

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| PGHOST | PostgreSQL 主机地址 | `postgresql-sea.postgres.database.azure.com` |
| PGUSER | 数据库用户名 | `admin` |
| PGPORT | 数据库端口 | `5432` |
| PGDATABASE | 数据库名称 | `eyesoncalendar` |
| PGPASSWORD | 数据库密码 | `your-password` |

## API 接口

### GET /api/mapping
获取全局配置（工作类型、分组、人员）

### GET /api/management
获取全局人员和分组配置（用于管理页面）

### GET /api/shifts?year=YYYY&month=MM
获取指定月份的班表数据

### POST /api/shifts
创建新月份的班表数据
```json
{
  "year": 2025,
  "month": 1
}
```

### PUT /api/shifts
更新班表数据（修改工作类型或锁定状态）

### POST /api/people
添加新成员（自动同步到全局配置和所有月份）
```json
{
  "alias": "johndoe",
  "name": "John Doe"
}
```

### DELETE /api/people
删除成员（从全局配置和所有月份删除）
```json
{
  "alias": "johndoe"
}
```

### PUT /api/groups
更新分组配置（自动同步到所有月份）
```json
{
  "tag_arrangement": [
    {
      "full_name": "All",
      "member": [...]
    },
    {
      "full_name": "Azure Monitor",
      "member": [...]
    }
  ]
}
```

## 开发指南

### 添加新的工作类型

1. 修改 `scripts/init-db.sql` 中的 `day_types` 定义
2. 或通过数据库直接更新 `shift_mapping` 表的 `day_types` 字段

### 自定义样式

项目使用 Tailwind CSS，可以在 `tailwind.config.ts` 中自定义主题。

### 修改数据库连接

编辑 `lib/db.ts` 文件，调整连接池配置。

## 常见问题

### Q: 如何重置数据库？
A: 删除所有数据并重新执行 `scripts/init-db.sql`。

### Q: 为什么删除的分组还在显示？
A: 刷新页面清除缓存，系统已自动同步删除。

### Q: 如何备份数据？
A: 使用 `pg_dump` 工具备份 PostgreSQL 数据库：
```bash
pg_dump -h <PGHOST> -U <PGUSER> -d <PGDATABASE> > backup.sql
```

### Q: 可以在没有数据库的情况下运行吗？
A: 不可以，系统依赖 PostgreSQL 进行数据持久化。

### Q: "All"分组有什么特殊之处？
A: "All"分组是系统默认分组，包含所有成员，不能删除。新增成员时会自动加入"All"分组。在添加成员到其他分组时，"All"分组不会出现在下拉列表中。


## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过 Issue 联系我们。
