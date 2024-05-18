import { parse } from "csv-parse/.";

export const level2List = [
  "0x3a1520d5ac44e51c645e238e4f268e72b1a8fec2712fec038100db83757fddda",
  "0x4294ce377a3355dd4d66a086bebc82573f766fc59ce3dc422488f9aced939043",
  "0x03c6f705e83a890e1479ed42759a777f58c24ac7a75f9975cc7e9a9e774327aa",
  "0xe80a291c59b94b950f9c7993da13a2433dd63bfa8f88e07f0615580ba08f25cc",
  "0xa83fddf040df982a82059491e4d500bc9a3810056a99a0371bfb9beafa89041d",
  "0x92f8ef5d928c35d2a95e0911dc8785a61d0439e121b15a1f3c603c7a8f1eabab",
  "0xf5e84162e778fb466fb022d42a7a6f2c2acf7ebdbaa2378a8e321953daa50087",
  "0x2faffa1ebd8e4070b0fdd7b00a83f9c80debdc704e06fc5cd14f3dc63b029fd2",
  "0x032da6425795b58b24835f848fb5547085d04741d8fc2cc662383f777d59f903",
  "0x877e3136d971265be2618324221b63f3061e6b9c8b80a0e21e2efdd107b28552",
  "0x402c3602ff7335a2eb77efb2f78cc4e333113301da1fadb50fbc83b7d2dd5d53",
  "0x2e0fb8b4594438ff081d9c5ba6e6796fd34fc7111ec28768be91f001d1f72f32",
  "0x1d6edccf46909632f4c63cbfb1698110270222ced989751e6317898f0bb4b591",
];

export const dieList = [];
const accountList = [];

export const getAccountList = async() => {
  if(accountList) return accountList
  const parser = parse({
    delimiter: ','
  });
}

export const isLevel2 = (address) => level2List.find((val) => val == address);
export const isAccountDied = (address) => dieList.find((val) => val == address);

export const MIN_SUI_PER_ACCOUNT = 0.015;
export const AIRDROP_SUI_PER_ACCOUNT = 0.1;
export const MIN_OCEAN_TO_SWAP = 1;
export const MIN_SUI_TO_SEND = 0.1;
