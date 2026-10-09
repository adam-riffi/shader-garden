// vite-plugin-glsl turns .glsl imports into source strings with #include directives resolved.
declare module "*.glsl" {
  const source: string;
  export default source;
}
