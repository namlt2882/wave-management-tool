import {
  getAccountLevelAndMultiple,
} from "../src/utility/balance.js";

const main = async () => {
  const level = await getAccountLevelAndMultiple(
    "0x17ef16365ce3cdc1ecc9d3bc4446e43a59da65d5c50ac7a29238c53b11a3f3d3"
  );
  console.log(level);
};
main();
