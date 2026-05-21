/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEEPSEEK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
