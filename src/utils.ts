import fs from "fs";
import path from "path";
import YAML from "yaml";

function resolveRelpath(rel) {
  return path.resolve(__dirname, "..", "..", rel).toString();
  // return path.resolve(__dirname, "..", rel).toString();
}

export function readText(ful) {
  return fs.readFileSync(ful, "utf8");
}

export function requireJSON(ful) {
  return JSON.parse(readText(ful));
}

export function requireYAML(ful) {
  return YAML.parse(readText(ful));
}

export function loadObject(rel) {
  return requireYAML(resolveRelpath(rel));
}

export function loadText(rel) {
  return readText(resolveRelpath(rel));
}
