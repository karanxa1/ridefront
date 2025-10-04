import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Exclude node_modules from transformation
      exclude: /node_modules/,
    }),
  ],

  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
    cors: true,
    proxy: {
      // Proxy API requests to backend in development
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build optimizations
  build: {
    // Output directory
    outDir: "dist",
    // Generate sourcemaps for production debugging
    sourcemap: false,
    // Minify with esbuild (faster than terser)
    minify: "esbuild",
    // Target modern browsers
    target: "es2020",
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure compatibility with Vercel
    ssr: false,
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Firebase
          "firebase-vendor": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],
          // UI libraries
          "ui-vendor": ["lucide-react", "sonner"],
          // Map libraries
          "map-vendor": ["mapbox-gl"],
          // State management
          "state-vendor": ["zustand"],
        },
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          let extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || "")) {
            extType = "images";
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType || "")) {
            extType = "fonts";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        // Chunk file naming
        chunkFileNames: "assets/js/[name]-[hash].js",
        // Entry file naming
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
    // CSS code splitting
    cssCodeSplit: true,
    // Asset inline limit (10kb)
    assetsInlineLimit: 10240,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "mapbox-gl",
      "zustand",
    ],
    exclude: ["@mapbox/node-pre-gyp"],
  },

  // Environment variable prefix
  envPrefix: "VITE_",

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: "camelCase",
    },
  },

  // Performance optimizations
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    legalComments: "none",
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },

  // JSON handling
  json: {
    namedExports: true,
    stringify: false,
  },
});
