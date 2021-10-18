import os from "os";
import path from "path";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { loadObject, loadText, readText, requireYAML } from "./utils";
import { createInterface } from "readline";
import * as util from "@polkadot/util";
import * as hashing from "@polkadot/util-crypto";
import * as polkaapi from "@polkadot/api";
import * as polkaapicontract from "@polkadot/api-contract";
import * as polkakeyring from "@polkadot/keyring";
import * as polkakeyringpair from "@polkadot/keyring/pair";
import * as apiderive from "@polkadot/api-derive";
import * as rpccore from "@polkadot/rpc-core";
import * as rpcprovider from "@polkadot/rpc-provider";
import * as polkatypes from "@polkadot/types";
import * as typesknown from "@polkadot/types-known";
import * as wasmcrypto from "@polkadot/wasm-crypto";
// import * as appsconfig_endpoints from "@polkadot/apps-config/endpoints";
// import * as appsconfig_api from "@polkadot/apps-config/api";
import * as lodash from "lodash";
import * as bip39 from "bip39";
import { typesBundle as moonbeamTypesBundle } from "moonbeam-types-bundle";
import { typesBundleForPolkadot as acalaTypesBundle } from "@acala-network/type-definitions";
import { typesBundleForPolkadot as crustTypesBundle } from "@crustio/type-definitions";
import fetch from "node-fetch";
import fs from "fs";
import YAML from "yaml";
import {
  fromIndex,
  isValid,
  showValidNetworks,
  NetworkRegistry,
} from "./networks";

// (polkakeyring as any).pair = polkakeyringpair;

const GlobalContext = {
  // polkadot require
  polkadot: {
    api: polkaapi,
    api_contract: polkaapicontract,
    util_crypto: hashing,
    keyring: polkakeyring,
    util: util,
    types: polkatypes,
    api_derive: apiderive,
    rpc_core: rpccore,
    rpc_provider: rpcprovider,
    types_known: typesknown,
    wasm_crypto: wasmcrypto,
    // apps_config_endpoints: appsconfig_endpoints,
    // apps_config_api: appsconfig_api,
  },
  util,
  bip39,
  hashing,
  // node require
  fetch,
  fs,
  path,
  lodash,
  YAML,
};

type ApiConfig = {
  provider: string;
  types?: string;
  typesBundle?: string;
};

type ChainSpec = ApiConfig | string;

async function createNetworkContext(name: ChainSpec) {
  // console.log('connecting to', name);
  let api;
  let provider;
  let types;
  let typesBundle;
  if (typeof name === "string") {
    let network = NetworkRegistry[name];
    provider = new WsProvider(network.provider);
    types = network.types ? loadObject(network.types) : undefined;
    // typesBundle = network.typesBundle ? loadObject(network.typesBundle) : undefined;
    // console.log(typesBundle)
    if (name === "moonriver") {
      typesBundle = moonbeamTypesBundle;
    }
    if (name === "acala") {
      typesBundle = acalaTypesBundle;
    }
    if (name === "crust") {
      typesBundle = crustTypesBundle;
    }
  } else {
    // 'object'
    provider = new WsProvider(name.provider);
    types = name.types ? requireYAML(name.types) : undefined;
  }
  // let api = ApiPromise.create({ provider, types });
  api = new ApiPromise({ provider, types, typesBundle });
  try {
    await api.isReadyOrError;
  } catch (e) {
    console.error("Failed to create api context:", e);
    return null;
  }
  let keyring = new Keyring({
    type: "sr25519",
    ss58Format: api.registry.chainSS58,
  });
  return {
    // global object
    api,
    keyring,
    types,
    provider,
  };
}

export { GlobalContext, createNetworkContext };
