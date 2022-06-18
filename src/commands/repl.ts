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
import { Package } from "../meta";
// import figlet from "figlet-promised";
import { showAsciiBanner } from "../banner";
import fs from "fs";
import YAML from "yaml";
import { fromIndex, isValid, showValidNetworks } from "../networks";
import { GlobalContext, createNetworkContext } from "../context";

async function chainInfo(api) {
  let chain = await api.rpc.system.chain();
  let name = await api.rpc.system.name();
  let version = await api.rpc.system.version();
  let properties = await api.rpc.system.properties();
  console.log(chain.toString(), name.toString(), version.toString());
  if (properties.size > 0) {
    console.log("Node specific properties:");
    properties.forEach((value, key) => {
      console.log(key, value.toString());
    });
  } else {
    console.log("No specific chain properties found.");
  }
}

function setReplContext(ctx, repl) {
  let keys = Object.keys(ctx);
  for (let key of keys) {
    repl.context[key] = ctx[key];
  }
  repl.context.repl = repl;
}

function updateReplPrompt(name, repl) {
  process.stdout.write("\r" + " ".repeat(repl._prompt.length));
  process.stdout.write("\r" + toPrompt(name));
  repl.setPrompt(toPrompt(name));
}

function useChain(repl) {
  return async (name) => {
    let ctx = await createNetworkContext(name);
    if (ctx) {
      let prompt = typeof name === "string" ? name : name.provider;
      setReplContext(ctx, repl);
      updateReplPrompt(prompt, repl);
    }
  };
}

async function setReplNetwork(name, repl) {
  let ctx = await createNetworkContext(name);
  setReplContext(ctx, repl);
  let prompt = typeof name === "string" ? name : name.provider;
  updateReplPrompt(prompt, repl);
}

function setReplCommand(replServer) {
  replServer.defineCommand("ls", {
    help: "ls`.",
    action: async function (network) {
      showValidNetworks();
      this.displayPrompt();
    },
  });

  replServer.defineCommand("info", {
    help: "info`.",
    action: async function (network) {
      await chainInfo(this.context.api);
      this.displayPrompt();
    },
  });

  replServer.defineCommand("connect", {
    help: "connect`.",
    action: async function (network) {
      if (!isValid(network)) {
        showValidNetworks();
      } else {
        await setReplNetwork(fromIndex(network), replServer);
      }
      this.displayPrompt();
    },
  });
}

function progInfo() {
  /* print program info from package.json */

  const info = {
    "🪨 Node.js version ": process.version,
    "🐚 Subshell version ": Package.version,
    "📖 Documentation": Package.documentation,
    "❔ Issues ": Package.repository.url+'/issues',
  };

  return Object.keys(info)
    .map((k) => {
      const prop = k;
      const value = info[k];
      return `${chalk.blue(prop)} ${chalk.green(value)}`;
    })
    .join("\n");
}

function toPromptUnready(prompt) {
  return `🌑 ${chalk.white(prompt)} > `;
}

function toPrompt(prompt) {
  return `🌕 ${chalk.green(prompt)} > `;
}

async function showBanner() {
  showAsciiBanner();
  console.log(progInfo());
  console.log();
}

async function createReplServer(prompt) {
  let replServer = noderepl.start({
    prompt: toPromptUnready(prompt),
  });

  replServer.on("exit", () => process.exit());

  setReplHistory(replServer);

  setReplCommand(replServer);

  setReplContext(
    {
      repl: replServer,
      useChain: useChain(replServer),
      ...GlobalContext,
    },
    replServer
  );

  return replServer;
}

function setReplHistory(repl) {
  const historyFile = path.join(os.homedir(), ".subrepl_history");
  replHistory(repl, historyFile);
}

export async function startRepl(network) {
  if (typeof network === "string" && network && !isValid(network)) {
    throw `Error: unsupported network: ${network}`;
  }

  // network is either unset or valid

  await showBanner();

  let initialPrompt = "bob";
  if (typeof network === "string") {
    initialPrompt = network;
  }
  if (typeof network === "object" && network.provider) {
    initialPrompt = network.provider;
  }
  let replServer = await createReplServer(initialPrompt);

  // console.log('createReplServer', network)
  if (network && (isValid(network) || network.provider)) {
    setReplNetwork(network, replServer);
    // await setReplNetwork(network, replServer);
  }
  // console.log('setReplNetwork')
}

export class ReplServer {
  private replServer;
  private apiContext;
  constructor() {}
  async startRepl() {}
}
