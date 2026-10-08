# 小支租车官网

基于 Figma「小支官网3」画板实现的单页网站。页面版心最大宽度为 1200px，包含桌面与移动端布局、导航、车型和比价 Tab、比价弹窗。

## 本地预览

```bash
pnpm install
pnpm dev
```

生产构建：`pnpm build`。构建结果在 `dist/`，可部署到任意静态网站服务。

页面使用的图片和图标已固化在 `public/assets/`，生产构建不依赖 Figma 临时资源链接。
