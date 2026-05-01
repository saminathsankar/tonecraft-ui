// Shim for Node.js 'url' module to prevent browser errors
export function pathToFileURL(path) { return path; }
