import os from "os";
import path from "path";
import noderepl from "repl";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { loadObject, loadText, readText } from "../utils";
import util from "@polkadot/util";
import hashing from "@polkadot/util-crypto";
import fetch from "node-fetch";
import replHistory from "@btwiuse/repl.history";
import chalk from "chalk";
import { NodeVM, VMScript, NodeVMOptions } from "vm2";
import fs from "fs";
import YAML from "yaml";
import { fromIndex, isValid, showValidNetworks } from "../networks";
import { GlobalContext, createNetworkContext } from "../context";
import express from "express";

export async function runSidecar(network, port) {
  let ctx = {};

  if (network && !isValid(network)) {
    throw `Error: unsupported network: ${network}`;
  }

  if (network) {
    ctx = await createNetworkContext(network);
  }

  const app = express();

  app.set("views", path.join(__dirname, "..", "views"));
  app.set("view engine", "ejs");

  app.get("/", (req, res) => {
    res.render("index", { pallets: ["a", "b"] });
  });

  app.listen(port, () => {
    console.log(`server started at http://127.0.0.1:${port}`);
  });
}
