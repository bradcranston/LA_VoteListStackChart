//import data from "./legislator";

window.loadData = (json) => {
  const data = JSON.parse(json);

  //add index element
  const formattedData = data.data.map((e) => Object(e.fieldData));
  formattedData.forEach(function (row, index) {
    row.index = index;
  });

  const finalData = formattedData;

  let filteredObj = {};

  filteredObj.party = false;
  filteredObj.vote = false;

  //break out the flip value
  let flip = data.flip;

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

    columns: [
      {
        data: "Cosponsor",
        name: "cosponsor",
        visible: false,
      },
      {
        data: "NameFirst",
        name: "NameLast",
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
        //Vote
        render: function (data, type, row) {
          const vote = document.createElement("div");
          vote.textContent = row.Vote;
          vote.classList.add("vote");
          if (row.Vote === "Aye" && flip !== 1) {
            voteClass = "voteGreen";
          } else if (row.Vote === "Aye" && flip === 1) {
            voteClass = "voteRed";
          } else if (row.Vote === "Nay" && flip !== 1) {
            voteClass = "voteRed";
          } else if (row.Vote === "Nay" && flip === 1) {
            voteClass = "voteGreen";
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
    },
    xAxis: { categories: ["Aye", "Nay", "Absent"] },
    yAxis: {
      min: 0,
      title: {
          text: 'Count trophies'
      },
      stackLabels: {
          enabled: true
      }
  },
    title: {
      text: "Votes",
    },
    subtitle: {
      text: "Showing All",
      align: "left",
    },
    plotOptions: {
      bar: {
        pointWidth: 35,
        stacking: 'normal',
        dataLabels: {
            enabled: true
        }
    }
    },
    series: generateChartData(table),
  });



  function generateChartData(table) {
    // Initialize an object to hold counts for 'Aye', 'Nay', and 'Absent' associated with 'R', 'D', 'I'
    let counts = {
      'R': [null, null, null], // Array for 'R': [Aye, Nay, Absent]
      'D': [null, null, null], // Array for 'D': [Aye, Nay, Absent]
      'I': [null, null, null]  // Array for 'I': [Aye, Nay, Absent]
    };
  
    // Get the data for column 4 ('Aye', 'Nay', 'Absent')
    table.column(4, { search: "applied" })
      .data()
      .each(function (val) {
        switch (val) {
          case 'Aye':
            counts['R'][0] += 1; // Increment 'Aye' count for 'R'
            break;
          case 'Nay':
            counts['R'][1] += 1; // Increment 'Nay' count for 'R'
            break;
          case 'Absent':
            counts['R'][2] += 1; // Increment 'Absent' count for 'R'
            break;
        }
      });
  
    // Get the data for column 3 ('D', 'R', 'I')
    table.column(3, { search: "applied" })
      .data()
      .each(function (val) {
        switch (val) {
          case 'D':
            counts['D'][0] += 1; // Increment 'Aye' count for 'D'
            break;
          case 'R':
            counts['R'][0] += 1; // Increment 'Aye' count for 'R'
            break;
          case 'I':
            counts['I'][0] += 1; // Increment 'Aye' count for 'I'
            break;
        }
      });
  
    // Convert counts object into the desired array format
    let result = [
      { name: 'R', data: counts['R'], color: '#FF0000', point:{events:{click:function () {filterParty('R');filterVote(this.category);}} }},
      { name: 'D', data: counts['D'], color: '#0000FF', point:{events:{click:function () {filterParty('D');filterVote(this.category);},} } },
      { name: 'I', data: counts['I'], color: '#D3D3D3', point:{events:{click:function () {filterParty('I');filterVote(this.category);},} } }
    ];
  console.log(result)
    return result;
  };
  
    
    
  
  

};
