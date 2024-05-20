import fetch from "node-fetch";

export const dieList = [];
let accountList = [];

export const getAccountList = async () => {
  if (accountList.length > 0) return accountList;
  const resp = await fetch(
    "https://raw.githubusercontent.com/namlt2882/wave-management-tool/master/config/address.csv",
    { method: "GET" }
  );
  const addressCsv = await resp.text();
  const [_, ...data] = addressCsv.split("\n");
  accountList = data
    .map((val) => val.split(","))
    .map(([id, teleid, address]) => ({
      id: id.trim(),
      teleid: teleid.trim(),
      address: address.trim(),
    }));
  return accountList;
};

export const isAccountDied = (address) => dieList.find((val) => val == address);

export const MIN_SUI_PER_ACCOUNT = 0.015;
export const AIRDROP_SUI_PER_ACCOUNT = 0.1;
export const MIN_OCEAN_TO_SWAP = 1;
export const MIN_SUI_TO_SEND = 0.1;
