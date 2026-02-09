#!/bin/bash
set -e

cd /opt/VyVy-ERP

# Initialize git
git init

# Add all files
git add -A

# Commit
git commit -m "docs: thêm tài liệu dự án ERP Warehouse Module v0.1.0

- 01_DATABASE_SCHEMA.md: Schema 24 bảng PostgreSQL
- 02_API_DOCUMENTATION.md: REST API endpoints
- 03_UI_UX_DESIGN.md: Thiết kế UI/UX (Vuexy)
- 04_DATA_DICTIONARY.md: Data dictionary chi tiết
- 05_BUSINESS_LOGIC.md: Nghiệp vụ và workflows
- 06_PROMPTS_FOR_ANTIGRAVITY.md: Implementation prompts
- 07_PROJECT_STRUCTURE.md: Cấu trúc dự án và roadmap
- 08_ARCHITECTURE_DESIGN.md: Kiến trúc Clean Architecture
- 09_CODING_STANDARDS.md: Coding standards Go/React
- 10_TECH_STACK_DECISIONS.md: Tech stack decisions
- CHANGELOG.md: Changelog v0.1.0
- README.md: Tổng quan dự án"

# Set main branch
git branch -M main

# Add remote
git remote add origin git@github.com:Chinsusu/VyVy-ERP.git

# Push
git push -u origin main

echo "✅ Đã push thành công lên GitHub!"
