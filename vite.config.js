import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import { validateProductionApiOrigin } from './scripts/release-config.mjs'

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    validateProductionApiOrigin(process.env.VITE_API_URL || env.VITE_API_URL)
  }
  return { plugins: [react()] }
})
