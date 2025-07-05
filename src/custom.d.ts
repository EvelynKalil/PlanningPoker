// Módulo para que TypeScript entienda las importaciones de .png

declare module '*.png' {
  const value: string
  export default value
}
