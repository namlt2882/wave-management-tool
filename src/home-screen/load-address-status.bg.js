import { ipcMain } from "electron";
import {
  getCurrentSui,
  getCurrentOcean,
  getLatestClaimTx as getLatestClaimDate,
} from "../utility/balance.js";
import { getAccountList } from "../../config/account.js";
var TWO_HOUR = 2 * 60 * 60 * 1000;
async function refreshAddressStatus() {
  const accountList = await getAccountList();
  console.log("fetching account status...");
  const accountData = await Promise.all(
    (
      await Promise.all(
        accountList.map(async ({ id, address, lv }, index) => {
          const [sui, ocean] = await Promise.all([
            getCurrentSui(address),
            getCurrentOcean(address),
          ]);
          return { index, id, address, lv, sui, ocean };
        })
      )
    )
      .filter((val) => val.sui != 0 || val.ocean != 0)
      .map(async (val) => {
        val.lastClaimDate = await getLatestClaimDate(val.address);
        if (val.lastClaimDate) {
          val.lastClaimDateStr = val.lastClaimDate.toLocaleString();
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
    if (ontimeA && ontimeB) return a.index - b.index;
    if (!ontimeA && ontimeB) return -1;
    if (ontimeA && !ontimeB) return 1;
    if (!ontimeA && !ontimeB) return a.lastClaimDate - b.lastClaimDate;
  });

  return accountData;
}
export const setup = () => {
  ipcMain.on("load-address-status", async (event) => {
    var accountData = await refreshAddressStatus();
    event.sender.send("load-address-status", accountData);
  });
};
