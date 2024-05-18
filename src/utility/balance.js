import { TransactionBlock } from "@okxweb3/coin-sui";
import { OCEAN_COINTYPE, SUI_COINTYPE, client } from "../../config/network.js";

export const getBalance = async (address, coinType) => {
  const balance = await client.getBalance({ owner: address, coinType });
  return balance;
};

export const getBalanceNumber = async (address, coinType) => {
  const { totalBalance } = await getBalance(address, coinType);
  return totalBalance / 1_000_000_000;
};

export const getCurrentSui = async (address) => {
  return await getBalanceNumber(address, SUI_COINTYPE);
};

export const getCurrentOcean = async (address) => {
  return await getBalanceNumber(address, OCEAN_COINTYPE);
};

export const getCoinType = async (
  address,
  coinType,
  nextCursor = undefined
) => {
  const coins = await client.getCoins({
    owner: address,
    cursor: nextCursor,
    limit: 500,
    coinType: coinType,
  });
  return coins.data;
};

export const getAllCoin = async (address, nextCursor = undefined) => {
  const coins = await client.getAllCoins({
    owner: address,
    cursor: nextCursor,
    limit: 500,
  });
  return coins;
};

export const getCoin = async (address) => {
  const coins = await client.getCoins({
    owner: address,
    limit: 500,
  });
  return coins.data;
};

export const getGasPerSendTx = async () => {
  const gasPrice = await client.getReferenceGasPrice();
  const gasBudget = (gasPrice * 10_000n) / 1_000_000_000n;
  return Number(gasBudget);
};

export const sendCoin = async (
  coinType,
  sender = { address: "", privateKey: "", keyPair: null },
  receiverAddress,
  amount
) => {
  const suiCoins = await getCoin(sender.address);
  const tx = new TransactionBlock();
  const finalAmount = parseInt(amount * 1_000_000_000);

  const gasPrice = await client.getReferenceGasPrice();
  const gasBudget = gasPrice * 10_000n;
  tx.setGasBudget(gasBudget);
  tx.setGasPrice(gasPrice);
  tx.setGasPayment(
    suiCoins.map((coin) => ({
      version: coin.version,
      digest: coin.digest,
      objectId: coin.coinObjectId,
    }))
  );
  if (coinType == SUI_COINTYPE) {
    tx.setGasPayment(
      suiCoins.map((coin) => ({
        version: coin.version,
        digest: coin.digest,
        objectId: coin.coinObjectId,
      }))
    );
    const [coinIn] = tx.splitCoins(tx.gas, [tx.pure(finalAmount)]); // lấy phần cần chuyển
    tx.transferObjects([coinIn], tx.pure(receiverAddress, "address")); // chuyển đến người nhận
  } else {
    const coins = await getCoinType(sender.address, coinType);
    if (!coins) {
      console.log("[ERR] no coin found");
      return null;
    }
    const [primaryCoinX, ...restCoinXs] = coins;
    tx.mergeCoins(
      tx.object(primaryCoinX.coinObjectId),
      restCoinXs.map((coin) => tx.object(coin.coinObjectId))
    );
    const [coinIn] = tx.splitCoins(tx.object(primaryCoinX.coinObjectId), [
      tx.pure(finalAmount),
    ]);
    tx.transferObjects([coinIn], tx.pure(receiverAddress, "address"));
  }

  let rs = await client.signAndExecuteTransactionBlock({
    transactionBlock: tx,
    signer: sender.keyPair,
    requestType: "WaitForLocalExecution",
    options: {
      showBalanceChanges: true,
      showEffects: true,
    },
  });
  return rs;
};

export const sendSui = async (
  sender = { address: "", privateKey: "" },
  receiverAddress,
  amount
) => {
  return await sendCoin(SUI_COINTYPE, sender, receiverAddress, amount);
};

export const sendOcean = async (
  sender = { address: "", privateKey: "" },
  receiverAddress,
  amount
) => {
  return await sendCoin(OCEAN_COINTYPE, sender, receiverAddress, amount);
};

export const getLatestClaimTx = async (address, cursor) => {
  const tx = await client.queryTransactionBlocks({
    limit: 10,
    cursor,
    filter: {
      FromAddress: address,
    },
    options: {
      showBalanceChanges: true,
    },
  });
  const filterData = tx.data
    .filter((block) => {
      return block.balanceChanges.find(
        (balance) =>
          balance.owner.AddressOwner == address &&
          balance.coinType == OCEAN_COINTYPE &&
          parseInt(balance.amount) >= 1 * 1_000_000_000
      );
    })
    .sort((a, b) => parseInt(b.timestampMs) - parseInt(a.timestampMs));
  if (filterData.length > 0) return new Date(parseInt(filterData[0].timestampMs));
  if (tx.hasNextPage) return await getLatestClaimTx(address, tx.nextCursor)
  return null
};
