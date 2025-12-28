# Setup Instructions

## Create Vite Project
```bash
npm create vite@latest
```
Select **React + TypeScript** template.

## Install Tailwind CSS
```bash
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node
```

## Configure Files

### src/index.css
```css
@import "tailwindcss";
```

### tsconfig.json
Add `baseUrl` and `paths` to `compilerOptions`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tsconfig.app.json
Add `baseUrl` and `paths` to `compilerOptions`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### vite.config.ts
```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## Initialize shadcn/ui
```bash
npx shadcn@latest init
```
Select **Neutral** as the base color (or your preferred color).

## Run
```bash
npm install
npm run dev
```
