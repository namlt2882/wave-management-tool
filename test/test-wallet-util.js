import {
  getLatestClaimTx,
} from "../src/utility/balance.js";

const main = async () => {
  const date = await getLatestClaimTx(
    "0x9649cf4eafb77ff67fd4456be217b86074cb6fb70b4497645b4fa80c0e5b67dc"
  );
  console.log(date.toLocaleString());
};
main();
