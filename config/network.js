import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

const rpcUrl = getFullnodeUrl("mainnet");

export const client = new SuiClient({ url: rpcUrl });
export const SUI_COINTYPE = "0x2::sui::SUI";
export const OCEAN_COINTYPE =
  "0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN";
