/// <reference types="vite/client" />

declare module "pdfjs-dist/build/pdf.worker?worker" {
  const workerSrc: string;
  export default workerSrc;
}
