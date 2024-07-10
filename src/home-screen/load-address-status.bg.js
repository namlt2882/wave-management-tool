import { ipcMain } from "electron";
import {
  getCurrentSui,
  getCurrentOcean,
  getLatestClaimTx as getLatestClaimDate,
  getAccountLevelAndMultiple,
  getClaimHour,
} from "../utility/balance.js";
import { getAccountList, isBankAccount } from "../../config/account.js";
import exec from "../utility/worker.js";
import { newSemaphore } from "../utility/semaphore.js";

const MAX_RETRY = 3;
const { exec: reqExec } = newSemaphore(5)

async function refreshAddressStatus() {
  const accountList = await getAccountList();
  const accountData = (
    await Promise.all(
      (
        await Promise.all(
          accountList.map(({ id, teleid, address }) => exec(async () => {
            let retry = 1;
            while (retry < MAX_RETRY) {
              try {
                const [sui, ocean, { level, multiple, boat: boatLevel }] =
                  await Promise.all([
                    reqExec(() => getCurrentSui(address)),
                    reqExec(() => getCurrentOcean(address)),
                    reqExec(() => getAccountLevelAndMultiple(address)),
                  ]);
                let ableToUpLvl = false;
                switch (level) {
                  case 1:
                    if (ocean >= 20) ableToUpLvl = true;
                    break;
                  case 2:
                    if (ocean >= 100) ableToUpLvl = true;
                    break;
                }
                return {
                  id,
                  teleid,
                  address,
                  lv: level,
                  boatLv: boatLevel,
                  claimHour: getClaimHour(boatLevel),
                  multiple,
                  sui,
                  ocean,
                  ableToUpLvl,
                };
              } catch (e) {
                console.error(`${id} ${address} ${e?.message}`)
                retry++
              }
            }
            return null
          }))
        )
      )
        .filter((val) => val)
        .filter((val) => val.sui != 0 || val.ocean != 0)
        .map(async (val) => {
          val.lastClaimDate = await reqExec(() => getLatestClaimDate(val.address));
          if (val.lastClaimDate) {
            val.lastClaimDateStr = val.lastClaimDate.toLocaleString();
            val.nextTime = new Date(val.lastClaimDate);
            val.nextTime.setHours(val.nextTime.getHours() + val.claimHour);
            val.nextTime -= new Date();
            val.nextTime = (Math.abs(val.nextTime) / 36e5) * 60;
            val.nextTimeStr = `${val.nextTime.toFixed(0)} phút`;
            val.onTime =
              new Date() - val.lastClaimDate < val.claimHour * 60 * 60 * 1000;
          } else {
            val.onTime = true;
          }
          if (isBankAccount(val.id)) {
            val.onTime = true;
          }
          return val;
        })
    )
  ).sort((a, b) => {
    const ontimeA = a.onTime;
    const ontimeB = b.onTime;
    if (isBankAccount(a.id) && isBankAccount(b.id)) return 0;
    if (isBankAccount(a.id) && !isBankAccount(b.id)) return -1;
    if (!isBankAccount(a.id) && isBankAccount(b.id)) return 1;
    if (ontimeA && ontimeB) {
      const ableToUpLvlA = a.ableToUpLvl;
      const ableToUpLvlB = b.ableToUpLvl;
      if (!ableToUpLvlA && ableToUpLvlB) return 1;
      if (ableToUpLvlA && !ableToUpLvlB) return -1;
      return a.nextTime - b.nextTime;
    }
    if (!ontimeA && ontimeB) return -1;
    if (ontimeA && !ontimeB) return 1;
    if (!ontimeA && !ontimeB) return b.nextTime - a.nextTime;
  });

  return accountData;
}
export const setup = () => {
  ipcMain.on("load-address-status", async (event) => {
    var accountData = await refreshAddressStatus();
    event.sender.send("load-address-status", accountData);
  });
};
