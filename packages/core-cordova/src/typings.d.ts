// Workaround to be able to import JSON in TS files.
declare module "*.json" {
  const value: any;
  export default value;
}