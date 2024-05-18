let $ = require("jquery");
let { ipcRenderer } = require("electron");
let snippets = [];
let searchData = [];

function onDataLoaded(addressStatusList) {
  var resultArea = $("#address-table");
  resultArea.html(null);
  snippets = [];
  searchData = addressStatusList;
  if (addressStatusList.length == 0) {
    resultArea.html(`<div>Không có acc nào bị delay</div>`);
  } else {
    resultArea.html([
      $(`<div>Cập nhật lần cuối vào lúc ${new Date().toLocaleString()}</div>`),
      $(`<table/>`).html([
        $(`<tr>
        <th>ID</th>
        <td>Địa chỉ</th>
        <th>Level mèo</th>
        <th>GAS</th>
        <th>OCEAN</th>
        <th>Trễ?</th>
        <th>Claim lần cuối</th>
        </tr>`),
        ...addressStatusList.map((addressStatus) =>
          renderResult(addressStatus)
        ),
      ]),
    ]);
  }
}

function renderResult(addressStatus) {
  const { id, address, lv, sui, ocean, onTime, lastClaimDateStr } =
    addressStatus;
  var content = $(`<tr style="${onTime ? "" : "background: red; color: white"}">
  <td>${id}</td>
  <td>${address}</td>
  <td>${lv}</td>
  <td>${sui}</td>
  <td>${ocean}</td>
  <td>${onTime ? "" : "Trễ"}</td>
  <td>${lastClaimDateStr}</td>
  </tr>`);
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
