# Docker 部署指南

## 构建 Docker 镜像

```bash
docker build -f Dockerfile -t lucaslifes/lucasprivatehub:eyesoncalendar .
```

## 运行容器

### 使用环境变量运行

```bash
docker run -d \
  --name eyesoncalendar \
  -p 3000:3000 \
  -e PGHOST=postgresql-sea.postgres.database.azure.com \
  -e PGUSER=huanggua \
  -e PGPORT=5432 \
  -e PGDATABASE=eyesoncalendar \
  -e PGPASSWORD=your_password_here \
  -e POWER_USERS=huanggua,anikshen \
  lucaslifes/lucasprivatehub:eyesoncalendar
```

### 使用 .env 文件运行

创建 `.env` 文件：
```env
PGHOST=postgresql-sea.postgres.database.azure.com
PGUSER=huanggua
PGPORT=5432
PGDATABASE=eyesoncalendar
PGPASSWORD=your_password_here
POWER_USERS=huanggua,anikshen
```

运行容器：
```bash
docker run -d \
  --name eyesoncalendar \
  -p 3000:3000 \
  --env-file .env \
  lucaslifes/lucasprivatehub:eyesoncalendar
```

## 推送到 Docker Hub

```bash
docker push lucaslifes/lucasprivatehub:eyesoncalendar
```

## 从 Docker Hub 拉取

```bash
docker pull lucaslifes/lucasprivatehub:eyesoncalendar
```

## 查看容器日志

```bash
docker logs eyesoncalendar
```

## 停止和删除容器

```bash
docker stop eyesoncalendar
docker rm eyesoncalendar
```

## 数据库迁移

首次部署后，需要运行数据库迁移：

```bash
# 进入容器
docker exec -it eyesoncalendar sh

# 运行迁移
node scripts/migrate-to-db.js

# 退出
exit
```

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| PGHOST | PostgreSQL 主机地址 | postgresql-sea.postgres.database.azure.com |
| PGUSER | 数据库用户名 | huanggua |
| PGPORT | 数据库端口 | 5432 |
| PGDATABASE | 数据库名称 | eyesoncalendar |
| PGPASSWORD | 数据库密码 | your_password |
| POWER_USERS | 管理员用户别名（逗号分隔） | huanggua,anikshen |

## 注意事项

1. **安全性**: 不要在镜像中硬编码敏感信息，始终使用环境变量
2. **数据持久化**: 数据存储在 PostgreSQL 数据库中，容器重启不会丢失数据
3. **端口映射**: 容器内部使用 3000 端口，可以映射到宿主机的任意端口
4. **健康检查**: 确保数据库可访问，否则应用无法正常工作
