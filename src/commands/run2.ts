import { readText } from "../utils";
import { NodeVM, VMScript, NodeVMOptions } from "vm2";
// import vm from "vm";
import jsEvents from "jsEvents";
import { isValid } from "../networks";
import { GlobalContext, createNetworkContext } from "../context";
import { build, Plugin } from "esbuild";
import { httpPlugin } from "./utils/esbuild-http";
import { yamlPlugin } from "esbuild-plugin-yaml";
import { SimpleCache } from "./utils/simple-cache";
import os from "os";
import path from "path";
import fs from "fs";
import parser from "yargs-parser";

export async function run2Script(network, script, args) {
  // console.log(script);
  // console.log(stripShebang(readText(script)))

  let bundle = await build({
    entryPoints: [script],
    bundle: true,
    write: false,
    loader: {
      ".ts": "ts",
      ".js": "js",
    },
    format: "esm",
    platform: "node",
    plugins: [
      httpPlugin({
        cache: await SimpleCache.create(
          path.join(os.homedir(), ".cache", "bob")
        ),
      }),
      yamlPlugin({}),
    ],
  });

  // console.log(bundle)
  const out = asyncWrap(stripShebang(bundle.outputFiles[0].text));
  // console.log(out)

  let ctx = {};

  if (typeof network === "string" && network && !isValid(network)) {
    throw `Error: unsupported network: ${network}`;
  }

  if (
    (typeof network === "string" && network) ||
    (typeof network === "object" && network.provider)
  ) {
    ctx = await createNetworkContext(network);
  }

  /*
console.log(1)
  const vms = new vm.Script(out)

console.log(2)
  vm.createContext(ctx);

console.log(3)

  let m = '/tmp/abc.mjs'
  fs.writeFileSync(m, out)

console.log('written to ${m}')

  await import(m)

  return

try {
  vms.runInContext(ctx);
} catch (e) {
  console.log(e)
}

  return
*/

  // vm.setGlobals(ctx);
  let vms = new VMScript(out);

  let vm = new NodeVM({
    env: process.env,
    argv: args,
    sandbox: {
      ...GlobalContext,
      ...ctx,
      createNetworkContext,
      import: require,
      // yargs,
      __opts: parser(args),
    },
    console: "inherit",
    require: {
      external: ["*"],
      builtin: ["*", "yaml"],
      mock: {
        events: jsEvents,
      },
    },
  });

  let vmscript = vm.run(vms);
  vmscript()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
}

function stripShebang(maybe_shebang) {
  if (maybe_shebang.startsWith("#!")) {
    return "//" + maybe_shebang;
  }
  return maybe_shebang;
}

function asyncWrap(async_code) {
  return `

async function useChain(name) {
  let ctx = await createNetworkContext(name);
  setGlobalContext(ctx);
}

function setGlobalContext(ctx) {
  let keys = Object.keys(ctx);
  for (let key of keys) {
    global[key] = ctx[key];
  }
}

exports.__esModule = true;

module.exports = (async ()=>{
${async_code}
})`;
}
