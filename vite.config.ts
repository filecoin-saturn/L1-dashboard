import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // saturn-l2 depends on this path
        assetsDir: 'webui'
    },
    plugins: [react()],
    server: {
        port: 3010,
        strictPort: true
    }
})
