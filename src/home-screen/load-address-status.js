let $ = require("jquery");
let { ipcRenderer, clipboard } = require("electron");

function onDataLoaded(addressStatusList) {
  var resultArea = $("#address-table");
  resultArea.html(null);
  const {
    totalAccount,
    totalActive,
    totalLate,
    totalUpLvl,
    totalLv1,
    totalLv2,
    totalSui,
    totalOcean,
  } = addressStatusList.reduce(
    (acc, { lv, sui, ocean, onTime, ableToUpLvl }) => {
      acc.totalAccount += 1;
      if (onTime) {
        acc.totalActive += 1;
      } else {
        acc.totalLate += 1;
      }
      if (ableToUpLvl) {
        acc.totalUpLvl += 1;
      }
      switch (lv) {
        case 2:
          acc.totalLv2 += 1;
          break;
        default:
          acc.totalLv1 += 1;
          break;
      }
      acc.totalSui += sui;
      acc.totalOcean += ocean;
      return acc;
    },
    {
      totalAccount: 0,
      totalActive: 0,
      totalLate: 0,
      totalUpLvl: 0,
      totalLv1: 0,
      totalLv2: 0,
      totalSui: 0,
      totalOcean: 0,
    }
  );
  if (addressStatusList.length == 0) {
    resultArea.html(`<div>Cập nhật lần cuối vào lúc ${new Date().toLocaleString()}</div>
    <div>Không thấy acc nào</div>`);
  } else {
    resultArea.html([
      $(`<div>Cập nhật lần cuối vào lúc ${new Date().toLocaleString()}</div>`),
      $(`<table id="main-table" border="1"/>`).html([
        $(`<tr>
        <th>ID</th>
        <td>Địa chỉ</th>
        <th>Level mèo</th>
        <th>GAS</th>
        <th>OCEAN</th>
        <th>Claim lần cuối</th>
        <th>Thời gian claim tiếp theo</th>
        <th>Ghi chú</th>
        </tr>`),
        ...addressStatusList.map((addressStatus) =>
          renderResult(addressStatus)
        ),
      ]),
    ]);
    $("#statistic").html(`
    <table>
      <tr>
        <th>Acc đang sống:</th>
        <td>${totalActive}/${totalAccount}</td>
      </tr>
      <tr>
        <th>Acc trễ:</th>
        <td>${totalLate}/${totalAccount}</td>
      </tr>
      <tr>
        <th>Số lượng mèo:</th>
        <td>Lv2=${totalLv2} Lv1=${totalLv1} (Có thể nâng ${totalUpLvl} acc)</td>
      </tr>
      <tr>
        <th>Số lượng coin:</th>
        <td>SUI=${totalSui.toFixed(3)} OCEAN=${totalOcean.toFixed(3)}</td>
      </tr>
    </table>
    `);
  }
}

function renderResult(addressStatus) {
  const {
    id,
    address,
    lv,
    sui,
    ocean,
    onTime,
    ableToUpLvl,
    lastClaimDateStr,
    nextTimeStr,
  } = addressStatus;
  let style = "",
    note = "";
  if (!onTime) {
    style = "background: red; color: white";
    note = "Trễ " + nextTimeStr;
  } else if (ableToUpLvl) {
    style = "background: green; color: white";
    note = "Có thể nâng mèo";
  }
  var content = $(`<tr style="${style}">
  <td>${id}</td>
  <td>${address} <i class="fa fa-copy"></i></td>
  <td>${lv}</td>
  <td>${sui.toFixed(3)}</td>
  <td>${ocean.toFixed(3)}</td>
  <td>${lastClaimDateStr}</td>
  <td>${onTime ? nextTimeStr : ""}</td>
  <td>${note}</td>
  </tr>`);
  content.first(`i`).on("click", () => {
    clipboard.writeText(address);
  });
  return content;
}

setInterval(() => ipcRenderer.send("load-address-status"), 15 * 60 * 1000);

var loadButton;
$(function () {
  var area = $("#searchTimezone");
  loadButton = area.find("button[name='load-btn']");
  console.log(loadButton);
  loadButton.on("click", () => {
    ipcRenderer.send("load-address-status");
  });
});
ipcRenderer.on("load-address-status", (event, data) => {
  onDataLoaded(data);
});
// first load
ipcRenderer.send("load-address-status");

module.exports = {};
