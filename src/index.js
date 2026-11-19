//import data from "./legislator";
import Highcharts from 'highcharts';

window.loadData = (json, f) => {
  const data = JSON.parse(json);

  flip = JSON.parse(f);

  //add index element
  const formattedData = data.data.map((e) => Object(e.fieldData));
  
  // Filter out objects where NameLast equals "Vacant"
  const filteredData = formattedData.filter(row => row.NameLast !== "Vacant");
  
  filteredData.forEach(function (row, index) {
    row.index = index;
  });

  const finalData = filteredData;

  let filteredObj = {};

  filteredObj.party = false;
  filteredObj.vote = false;

  const table = $("#table").DataTable({
    data: finalData,
    dom: "lrt",
    paging: false,
    scrollResize: true,
    scrollCollapse: true,
    scrollY: "30000px",
    fixedHeader: false,
    ordering: true,
    info: false,
    order: [[2, 'asc'],[1, 'asc']],
    columns: [
      {
        data: "Cosponsor",
        name: "cosponsor",
        visible: false,
      },
      {
        data: "NameFirst",
        name: "NameFirst",
        visible: false,
      },
      {
        data: "NameLast",
        name: "NameLast",
        visible: false,
      },
      {
        data: "Party",
        name: "party",
        visible: false,
      },
      {
        data: "Vote",
        name: "Vote",
        visible: false,
      },
      {
        //Party Icon
        render: function (data, type, row) {
          if (row.Party === "R") {
            var partyClass = "i-circle-red";
          } else {
            var partyClass = "i-circle-blue";
          }
          const $party = document.createElement("div");
          $party.classList.add(partyClass);
          $party.textContent = row.Party;
          return $party;
        },
        orderable: false,
      },
      {
        //Info
        render: function (data, type, row) {
          const name = document.createElement("div");
          name.onclick = function () {
            let result = (({ Legislators_ID }) => ({ Legislators_ID }))(row);
            result.action = "navigate";
            callFM(result);
            event.stopPropagation();
          };
          name.classList.add("bold");
          name.textContent = row.NameFirst + " " + row.NameLast;
          return name;
        },
        orderable: false,
      },
      {
        //Cosponsor
        render: function (data, type, row) {
          const cosp = document.createElement("div");
          cosp.classList.add("cosp");
          if (row.Cosponsor) {
            cosp.textContent = "Cosponsor";
          }

          return cosp;
        },
        orderable: false,
      },
      {
        // Vote
        render: function (data, type, row) {
          const vote = document.createElement("div");
          vote.textContent = row.Vote;
          vote.classList.add("vote");

          let voteClass = "";
          if (row.Vote === "Aye") {
            voteClass = flip ? "voteRed" : "voteGreen";
          } else if (row.Vote === "Nay") {
            voteClass = flip ? "voteGreen" : "voteRed";
          } else if (row.Vote === "Absent") {
            voteClass = "voteYellow";
          }
          vote.classList.add(voteClass);
          return vote;
        },
        orderable: false,
      },
    ],
  });

  window.sortNames = function () {
    //   table.columns([11,12,13]).visible(false);
    extraData = null;
    table.column(3).cells().invalidate();
    table.column(3).render();
    table
      .order([
        { name: "NameLast", dir: "asc" },
        { name: "NmaeFirst", dir: "asc" },
      ])
      .draw();
  };

  window.filterParty = function (value) {
    if (filteredObj.party) {
      table.columns([3]).search("").draw();
      filteredObj.party = false;
      filteredObj.partyName = '';
    } else {
      table.columns([3]).search(value).draw();
      filteredObj.party = true;
      filteredObj.partyName = value;
    };
    subtitle();
  };

  window.filterPartyClear = function () {
    table.columns([3]).search("").draw();
  };

  window.filterVote = function (value) {
    if (filteredObj.vote) {
      table.columns([4]).search("").draw();
      filteredObj.vote = false;
      filteredObj.voteName = '';
    } else {
      table.columns([4]).search(value).draw();
      filteredObj.vote = true;
      filteredObj.voteName = value;
    };
    subtitle();
  };



  window.subtitle = function (){
    const subT = document.getElementsByClassName("highcharts-subtitle")[0];
  if(filteredObj.vote === false && filteredObj.party === false ){
    subT.textContent = "Showing All";
  } else if (filteredObj.vote === true && filteredObj.party === true ){
    subT.textContent = 'Party: ' + filteredObj.partyName + ' | Vote: ' + filteredObj.voteName;
  } else if ( filteredObj.party === true ){
    subT.textContent = 'Party: ' + filteredObj.partyName;
  } else if (filteredObj.vote === true ){
    subT.textContent = 'Vote: ' + filteredObj.voteName;
  }

  };


  window.addEventListener("DOMContentLoaded", function() {
    const subT = document.getElementsByClassName("highcharts-subtitle")[0];
      subT.addEventListener("click", filterAll);
  });

  window.filterVoteClear = function () {
    table.columns([4]).search("").draw();
  };

  window.filterAll = function () {
    table.search("").columns().search("").draw();
  };

  window.callFM = function (result) {
    FileMaker.PerformScript("wv_runScript", JSON.stringify(result));
  };

  window.refreshRow = function (row) {
    table.column(row).cells().invalidate();
    table.column(row).render();
  };

  //custom format of Search boxes
  $("[type=search]").each(function () {
    $(this).attr("placeholder", "Search...");
    //  $(this).before('<span class="fa fa-search"></span>');
  });

  window.exportFM = function () {
    let dataExport = table.buttons.exportData();
    dataExport = dataExport.body;
    let data = dataExport.map((subArr) => subArr[11]);
    data = JSON.stringify(data);
    FileMaker.PerformScriptWithOption("wv_Export", data, "0");
  };

  // Create chart
  const chart = Highcharts.chart("chart", {
    chart: {
      type: "bar",
      height: 155,
      spacing: [5, 0, 5, 0],
    },
    xAxis: {
      categories: ["", ""],
      labels: { enabled: false },
      tickLength: 0,
      lineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: { text: null },
      labels: { enabled: false },
      gridLineWidth: 0,
      maxPadding: 0,
      endOnTick: false,
    },
    title: {
      text: "Votes",
    },
    subtitle: {
      text: "Showing All",
      align: "left",
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        pointWidth: 35,
        pointPadding: 0,
        groupPadding: 0.01,
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          style: { textOutline: 'none', color: '#ffffff', fontWeight: 'bold' },
          formatter: function () {
            return this.y > 0 ? this.y : null;
          }
        }
      }
    },
    series: generateChartData(table),
  });



  function generateChartData(table) {
    let overall = { Aye: 0, Nay: 0, Absent: 0 };
    let byParty = { DemAye: 0, RepAye: 0, DemNay: 0, RepNay: 0, DemAbsent: 0, RepAbsent: 0 };

    table.rows({ search: "applied" }).every(function () {
      let data = this.data();
      let vote = data.Vote;
      let party = data.Party;

      if (vote === 'Aye')        overall.Aye += 1;
      else if (vote === 'Nay')   overall.Nay += 1;
      else if (vote === 'Absent') overall.Absent += 1;

      if (party === 'D') {
        if (vote === 'Aye')        byParty.DemAye += 1;
        else if (vote === 'Nay')   byParty.DemNay += 1;
        else if (vote === 'Absent') byParty.DemAbsent += 1;
      } else if (party === 'R') {
        if (vote === 'Aye')        byParty.RepAye += 1;
        else if (vote === 'Nay')   byParty.RepNay += 1;
        else if (vote === 'Absent') byParty.RepAbsent += 1;
      }
    });

    // Bar 0 = overall votes, Bar 1 = by party breakdown
    return [
      {
        name: 'Aye',
        data: [overall.Aye, null],
        color: '#3CB371',
        legendIndex: 0,
        point: { events: { click: function () { filterVote('Aye'); } } }
      },
      {
        name: 'Nay',
        data: [overall.Nay, null],
        color: '#E05555',
        legendIndex: 1,
        point: { events: { click: function () { filterVote('Nay'); } } }
      },
      {
        name: 'Absent',
        data: [overall.Absent, null],
        color: '#CCCCCC',
        legendIndex: 2,
        point: { events: { click: function () { filterVote('Absent'); } } }
      },
      {
        name: 'Dem Aye',
        data: [null, byParty.DemAye],
        color: '#1F77B4',
        legendIndex: 3,
        point: { events: { click: function () { filterAll(); filterParty('D'); filterVote('Aye'); } } }
      },
      {
        name: 'Rep Aye',
        data: [null, byParty.RepAye],
        color: '#E05555',
        legendIndex: 4,
        point: { events: { click: function () { filterAll(); filterParty('R'); filterVote('Aye'); } } }
      },
      {
        name: 'Dem Nay',
        data: [null, byParty.DemNay],
        color: '#7FB3D3',
        legendIndex: 5,
        point: { events: { click: function () { filterAll(); filterParty('D'); filterVote('Nay'); } } }
      },
      {
        name: 'Rep Nay',
        data: [null, byParty.RepNay],
        color: '#F4A4A4',
        legendIndex: 6,
        point: { events: { click: function () { filterAll(); filterParty('R'); filterVote('Nay'); } } }
      },
      {
        name: 'Dem Absent',
        data: [null, byParty.DemAbsent],
        color: '#D6E8F5',
        borderColor: '#7FB3D3',
        borderWidth: 1,
        legendIndex: 7,
        point: { events: { click: function () { filterAll(); filterParty('D'); filterVote('Absent'); } } }
      },
      {
        name: 'Rep Absent',
        data: [null, byParty.RepAbsent],
        color: '#FAE0E0',
        borderColor: '#F4A4A4',
        borderWidth: 1,
        legendIndex: 8,
        point: { events: { click: function () { filterAll(); filterParty('R'); filterVote('Absent'); } } }
      }
    ];
  }

  
    
    
  
  

};
