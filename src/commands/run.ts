import { readText } from "../utils";
import { NodeVM, VMScript, NodeVMOptions } from "vm2";
import { isValid } from "../networks";
import { GlobalContext, createNetworkContext } from "../context";

export async function runScript(network, script) {
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

  let vm = new NodeVM({
    sandbox: {
      ...GlobalContext,
      ...ctx,
      createNetworkContext,
      import: require,
    },
    console: "inherit",
    require: {
      external: ["*"],
      builtin: ["*", "yaml"],
    },
  });

  // vm.setGlobals(ctx);
  let vms = new VMScript(asyncWrap(stripShebang(readText(script))));
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
