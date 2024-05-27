let $ = require("jquery");
let { ipcRenderer, clipboard } = require("electron");

function onDataLoaded(addressStatusList) {
  var resultArea = $("#address-table");
  resultArea.html(null);
  const {
    totalActive,
    totalLate,
    totalUpLvl,
    totalLv1,
    totalLv2,
    totalLv3,
    totalLv4,
    totalLv5,
    totalLv6,
    totalBoatLv1,
    totalBoatLv2,
    totalBoatLv3,
    totalMultiple1,
    totalMultiple2,
    totalMultiple3,
    totalSui,
    totalOcean,
    claimPerHour,
  } = addressStatusList.reduce(
    (acc, { lv, boatLv, multiple, sui, ocean, onTime, ableToUpLvl }) => {
      if (onTime) {
        acc.totalActive += 1;
      } else {
        acc.totalLate += 1;
      }
      if (ableToUpLvl) {
        acc.totalUpLvl += 1;
      }
      let claimPerHour = 0.5;
      switch (lv) {
        case 6:
          acc.totalLv6 += 1;
          claimPerHour = 1.75;
          break;
        case 5:
          acc.totalLv5 += 1;
          claimPerHour = 1.5;
          break;
        case 4:
          acc.totalLv4 += 1;
          claimPerHour = 1.25;
          break;
        case 3:
          acc.totalLv3 += 1;
          claimPerHour = 1;
          break;
        case 2:
          acc.totalLv2 += 1;
          claimPerHour = 0.75;
          break;
        default:
          acc.totalLv1 += 1;
          break;
      }
      switch (boatLv) {
        case 3:
          acc.totalBoatLv3 += 1;
          break;
        case 2:
          acc.totalBoatLv2 += 1;
          break;
        default:
          acc.totalBoatLv1 += 1;
          break;
      }
      switch (multiple) {
        case 3:
          acc.totalMultiple3 += 1;
          claimPerHour *= 1.5;
          break;
        case 2:
          acc.totalMultiple2 += 1;
          claimPerHour *= 1.25;
          break;
        default:
          acc.totalMultiple1 += 1;
          break;
      }
      acc.claimPerHour += claimPerHour;
      acc.totalSui += sui;
      acc.totalOcean += ocean;
      return acc;
    },
    {
      totalActive: 0,
      totalLate: 0,
      totalUpLvl: 0,
      totalLv1: 0,
      totalLv2: 0,
      totalLv3: 0,
      totalLv4: 0,
      totalLv5: 0,
      totalLv6: 0,
      totalBoatLv1: 0,
      totalBoatLv2: 0,
      totalBoatLv3: 0,
      totalMultiple1: 0,
      totalMultiple2: 0,
      totalMultiple3: 0,
      claimPerHour: 0,
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
        <th>TeleID</th>
        <th>Địa chỉ</th>
        <th>Level mèo</th>
        <th>Level cua</th>
        <th>Level thuyền</th>
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
        <td>${totalActive}/${addressStatusList.length}</td>
      </tr>
      <tr>
        <th>Acc trễ:</th>
        <td>${totalLate}/${addressStatusList.length}</td>
      </tr>
      <tr>
        <th>Số lượng mèo:</th>
        <td>Lv6=${totalLv6} Lv5=${totalLv5} Lv4=${totalLv4}<br/> Lv3=${totalLv3} Lv2=${totalLv2} Lv1=${totalLv1} (Có thể nâng ${totalUpLvl} acc)</td>
      </tr>
      <tr>
        <th>Số lượng cua:</th>
        <td>Lv3=${totalMultiple3} Lv2=${totalMultiple2} Lv1=${totalMultiple1}</td>
      </tr>
      <tr>
        <th>Số lượng thuyền:</th>
        <td>Lv3=${totalBoatLv3} Lv2=${totalBoatLv2} Lv1=${totalBoatLv1}</td>
      </tr>
      <tr>
        <th>Số lượng coin:</th>
        <td>SUI=${totalSui.toFixed(3)} OCEAN=${totalOcean.toFixed(3)}</td>
      </tr>
    </table>
    <table>
      <tr>
        <th>Tổng sản lượng 1 giờ:</th>
        <td>${claimPerHour.toFixed(2)} OCEAN</td>
      </tr>
      <tr>
        <th>Tổng sản lượng 1 ngày:</th>
        <td>${(claimPerHour * 24).toFixed(2)} OCEAN</td>
      </tr>
      <tr>
        <th>Tổng sản lượng 1 tháng:</th>
        <td>${(claimPerHour * 24 * 30).toFixed(2)} OCEAN</td>
      </tr>
    </table>
    `);
  }
}

function renderResult(addressStatus) {
  const {
    id,
    teleid,
    address,
    lv,
    boatLv,
    multiple,
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
    note = `Có thể nâng mèo ${lv + 1}`;
  }
  var content = $(`<tr style="${style}">
  <td>${id}</td>
  <td>${teleid} ${teleid ? `<i class="fa fa-copy teleid">` : ""}</td>
  <td>${address} <i class="fa fa-copy address"></i></td>
  <td>${lv}</td>
  <td>${multiple}</td>
  <td>${boatLv}</td>
  <td>${sui.toFixed(3)}</td>
  <td>${ocean.toFixed(3)}</td>
  <td>${lastClaimDateStr}</td>
  <td>${onTime ? nextTimeStr : ""}</td>
  <td>${note}</td>
  </tr>`);
  content.find(`i.teleid`).on("click", () => {
    clipboard.writeText(teleid);
  });
  content.find(`i.address`).on("click", () => {
    clipboard.writeText(address);
  });
  return content;
}

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
