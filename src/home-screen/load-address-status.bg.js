import { ipcMain } from "electron";
import {
  getCurrentSui,
  getCurrentOcean,
  getLatestClaimTx as getLatestClaimDate,
  getAccountLevelAndMultiple,
} from "../utility/balance.js";
import { getAccountList } from "../../config/account.js";
var TWO_HOUR = 2 * 60 * 60 * 1000;
async function refreshAddressStatus() {
  const accountList = await getAccountList();
  const accountData = await Promise.all(
    (
      await Promise.all(
        accountList.map(async ({ id, teleid, address }, index) => {
          const [sui, ocean, { level, multiple }] = await Promise.all([
            getCurrentSui(address),
            getCurrentOcean(address),
            getAccountLevelAndMultiple(address),
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
            index,
            id,
            teleid,
            address,
            lv: level,
            multiple,
            sui,
            ocean,
            ableToUpLvl,
          };
        })
      )
    )
      .filter((val) => val.sui != 0 || val.ocean != 0)
      .map(async (val) => {
        val.lastClaimDate = await getLatestClaimDate(val.address);
        if (val.lastClaimDate) {
          val.lastClaimDateStr = val.lastClaimDate.toLocaleString();
          val.nextTime = new Date(val.lastClaimDate);
          val.nextTime.setHours(val.nextTime.getHours() + 2);
          val.nextTime -= new Date();
          val.nextTime = (Math.abs(val.nextTime) / 36e5) * 60;
          val.nextTimeStr = `${val.nextTime.toFixed(0)} phút`;
          val.onTime = new Date() - val.lastClaimDate < TWO_HOUR;
        } else {
          val.onTime = true;
        }
        return val;
      })
  );
  accountData.sort((a, b) => {
    const ontimeA = a.onTime;
    const ontimeB = b.onTime;
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
