import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    // saturn-l2 depends on this path
    base: '/webui',
    plugins: [react()],
    server: {
        port: 3010,
        strictPort: true
    }
})
