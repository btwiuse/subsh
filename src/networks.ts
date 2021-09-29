import os from "os";
import path from "path";
import { loadObject, loadText, readText } from "./utils";
import fs from "fs";
import YAML from "yaml";

const NetworkRegistry = loadObject("networks.yaml");

var networkMap = {};
Object.keys(NetworkRegistry).forEach((a, i) => {
  networkMap[`${a}`] = `${a}`;
  networkMap[`${i}`] = `${a}`;
});

function showValidNetworks() {
  Object.keys(NetworkRegistry).forEach((a, i) => {
    console.log(i, a);
  });
}

function isValid(k) {
  return networkMap.hasOwnProperty(k);
}

function fromIndex(k) {
  return networkMap[k];
}

export { fromIndex, isValid, showValidNetworks, NetworkRegistry };
