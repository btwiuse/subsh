import { Command } from "commander";
// import figlet from "figlet-promised";
import { startRepl, runScript, run2Script, runSidecar } from "./src/commands";
import { Package } from "./src/meta";
import { subshellBanner } from "./src/banner";

async function main() {
  const program = new Command();
  program.name("bob");
  program.version(Package.version);
  program.description(
    `The missing Polkadot.js API scripting environment that lets you have SLACK while BUIDLing around Substrate.`
  );
  // program.addHelpText("before", await figlet("SubGenius"));
  program.addHelpText("before", subshellBanner);
  program
    .option(
      "--chain <chain>",
      "initialize polkadot api using default provider and types"
    )
    .option("--provider <provider>", "set custom ws/http provider")
    .option(
      "--types <types>",
      "path to json file containing custom type definitions"
    )
    .arguments("[script] [args...]")
    .action((script, args, opts) => {
      if (script) {
        run2Script(opts.chain || {provider: opts.provider, types: opts.types}, script, args);
      } else {
        // console.log(opts.chain || {provider: opts.provider, types: opts.types});
        startRepl(opts.chain || {provider: opts.provider, types: opts.types});
      }
    });
  program
    .command("run")
    .description("run <ts|mjs|js> script")
    .arguments("<script> [args...]")
    .action((script, args, _opts, { parent: { _optionValues: opts } }) => {
      run2Script(opts.chain, script, args);
    });
//program
//  .command("run")
//  .description("run script against network")
//  .arguments("<script>")
//  .action((script, _opts, { parent: { _optionValues: opts } }) => {
//    runScript(opts.chain, script);
//  });
  program
    .command("repl")
    .description("start repl")
    .option("--provider <provider>", "set custom ws/http provider")
    .option(
      "--types <types>",
      "path to json file containing custom type definitions"
    )
    .arguments("[script]")
    .action((script, _opts, { parent: { _optionValues: opts } }) => {
      if (script) {
        runScript(opts.chain, script);
      } else {
        startRepl(opts.chain);
      }
    });
  program
    .command("sidecar")
    .description("run api sidecar")
    .option("--provider <provider>", "set custom ws/http provider")
    .option(
      "--types <types>",
      "path to json file containing custom type definitions"
    )
    .option("--provider <provider>", "set custom ws/http provider")
    .option("--port <port>", "listening port", '8080')
    .action(({port}, { parent: { _optionValues: {chain} } }) => {
      console.log(`serving ${chain} on ${port}`);
      runSidecar(chain, port);
    });
  program
    .command("deno")
    .description("start repl in deno (if found in PATH)")
    .option("--provider <provider>", "set custom ws/http provider")
    .option(
      "--types <types>",
      "path to json file containing custom type definitions"
    )
    .arguments("[script]")
    .action((script, _opts, { parent: { _optionValues: opts } }) => {
      if (script) {
        runScript(opts.chain, script);
      } else {
        startRepl(opts.chain);
      }
    });
  program
    .command("fuse")
    .description("mount blockchain storage to a local dir")
    .action((opts) => {});
  program
    .command("upload")
    .description("upload file or dir to ipfs")
    .action((opts) => {});
  program
    .command("fmt")
    .description("format source code")
    .action((opts) => {});
  program
    .command("complete")
    .description("generate standalone ts script")
    .action((opts) => {});
  program
    .command("keyring")
    .description("manage local keyring")
    .action((opts) => {});
  program
    .command("version")
    .description("display version info")
    .action((opts) => {});
  program
    .command("update")
    .description("check for update")
    .action((opts) => {});
  try {
    program.parse(process.argv);
  } catch (e) {
    console.error(e);
  }
}

void main();
