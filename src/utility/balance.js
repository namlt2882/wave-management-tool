import {
  EVENT_TYPE_UPGRADE_LEVEL,
  OCEAN_COINTYPE,
  SUI_COINTYPE,
  client,
} from "../../config/network.js";

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
  if (filterData.length > 0)
    return new Date(parseInt(filterData[0].timestampMs));
  if (tx.hasNextPage) return await getLatestClaimTx(address, tx.nextCursor);
  return null;
};

export const getAccountLevelAndMultiple = async (
  address,
  cursor,
  level = 1,
  multiple = 1
) => {
  const txs = await client.queryTransactionBlocks({
    limit: 500,
    filter: {
      FromAddress: address,
    },
    cursor,
    options: {
      showEvents: true,
    },
  });
  const upgradeLevelTxs = txs.data.filter((block) => {
    return block.events.find(
      (event) =>
        event.type == EVENT_TYPE_UPGRADE_LEVEL &&
        event.transactionModule == "game" &&
        event.parsedJson.type === 1
    );
  });
  if (upgradeLevelTxs.length > 0) level += upgradeLevelTxs.length;
  const upgradeMultipleTxs = txs.data.filter((block) => {
    return block.events.find(
      (event) =>
        event.type == EVENT_TYPE_UPGRADE_LEVEL &&
        event.transactionModule == "box"
    );
  });
  if (upgradeMultipleTxs.length > 0) multiple += upgradeMultipleTxs.length;
  if (txs.hasNextPage)
    return await getAccountLevelAndMultiple(
      address,
      txs.nextCursor,
      level,
      multiple
    );
  return { level, multiple };
};
