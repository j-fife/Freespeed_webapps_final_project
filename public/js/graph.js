var ind1 = "elapsedTime";
var ind2 = "power";
var username = ""
var global_data = [];
var global_raw_data = [];
var global_gaps_data = [];
var global_gaps = [];
var toggle_vals = ["power","speedGPS","slip","wash","strokeRate","catch","finish","maxForceAngle","forceMax","forceAvg","work","distancePerStrokeGPS","heartRateBPM"];
var toggle_types = ["Power", "Speed", "Slip", "Wash", "Stroke/Min", "Catch Angle", "Finish Angle", "Max Force Angle", "Max Force", "Avg Force", "Work", "Distance/Stroke", "Heart Rate"];
var averages = [];
var cur_averages = [];
for (var i = 0; i < toggle_vals.length; i++){
  averages.push(0);
  cur_averages.push(0);
}

/*$.post("/test-python", {"data": data3, "gaps": "2000", "intIdx": "distance", "pieces": "2", "threshold": "0.1"}, function(res){
      console.log(res);
}); for 5/9 2x2k */

var margin = {top: 50, right: 100, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%H:%M:%S.%L"),
    bisectDate = d3.bisector(function(d) { return d[ind1]; }).left,
    formatValue = d3.format(",.2f"),
    formatTime = d3.timeFormat("%H:%M:%S"),
    formatCurrency = function(d) { return formatValue(d); };

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

var line = d3.line()
    .x(function(d) { return x(d[ind1]); })
    .y(function(d) { return y(d[ind2]); });

function getIntervals(){
  var gaps = global_gaps[username];
  var data = [];
  for (var j = 0; j < gaps.length; j++){
    var cur_gap = gaps[j];
    var gap_data = [];
    for (var i = cur_gap[0]; i < cur_gap[1]+ 1; i++){
      gap_data.push(global_data[username][i]);
    }
    data.push(gap_data);
  }
  global_gaps_data = data;
}

function d3Init(){
  var data = [];
  /*if (n==global_data.length){
    global_data.forEach(function(d){
      data = data.concat(d);
    });
  } else {
    data = global_data[n];
  }*/
  //data = [].concat.apply([], global_gaps_data);
  data = global_data[username];

  console.log("data", data);
  //console.log(username);
  //console.log(data);
  x.domain(d3.extent(data, function(d) { return d[ind1]; }));
  y.domain(d3.extent(data, function(d) { return d[ind2]; }));
  //console.log("x",x);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    //console.log("mouse", d3.mouse(this)[0]);
    //console.log("x0",x0);
    var i = bisectDate(data, x0, 1);
    //console.log("i",i);
    var d0 = data[i - 1];
    var d1 = data[i];
    //console.log("d1",d1);
    var d = x0 - d0[ind1] > d1[ind1] - x0 ? d1 : d0;
    var time =
    focus.attr("transform", "translate(" + x(d[ind1]) + "," + y(d[ind2]) + ")");
    focus.select("text").text(formatCurrency(d[ind2]) + ", " + formatTime(d[ind1]));
    //console.log("d",d);

  }

  var svg = d3.select("svg :first-child");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("fill", "none")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end");


      drawLines([data], svg);


  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", -50)
      .attr("y", -40)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

}

function drawLines(data,svg) {
  for (var dataIdx = 0; dataIdx < data.length; dataIdx++){
  svg.append("path")
      .datum(data[dataIdx])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }
}
/*
function makeUL() {
    $("#dataRadios").empty();
    var list = $("#dataRadios")[0];

    for(var i = 0; i < global_data.length + 1; i++) {
        var item = document.createElement('li');

        var x = document.createElement("INPUT");
        x.setAttribute("type", "radio");
        x.setAttribute("id", "radio_" + i);
        x.setAttribute("name", "data");
        x.setAttribute("value", i);
        if(i==0){
          x.setAttribute("checked", "checked");
        }
        item.appendChild(x);

        list.appendChild(item);
    }
    $(":radio").change(function() {
      $("svg :first-child").empty();
      d3Init(this.value);
    });
}*/

function cleanData(){
  //var clean_data = [];
  global_data.forEach(function(piece) {
    //var clean_piece = [];
    piece.elapsedTime = parseDate(piece.elapsedTime + "00")
    piece.splitGPS = parseDate(piece.splitGPS + "00")

    //clean_data.push(clean_piece);
  });
  //global_data = clean_data;
}

function updateGraph(){
  if ($(".rower_selected").length > 0) {
    ind2 = $("#dropdown_button").val();
    username = $(".rower_selected")[0].id;
    $("#svg1 :first-child").empty();
    d3Init();
  } else {
  }
}

function groupByUsername(){
  partitionedData = {};
  for(var i = 0; i < global_data.length; i++){
    if (!partitionedData[global_data[i].email]){
      partitionedData[global_data[i].email] = [];
    }
    partitionedData[global_data[i].email].push(global_data[i]);
  }
  for (var username in partitionedData){
    partitionedData[username].sort(function(a, b){
      if(a["id"] > b["id"]) return 1;
      if(a["id"] < b["id"]) return -1;
      return 0;
    });
  }
  global_data = partitionedData
}
function populateUsersList(){

  var ul = $("#rowers_list");


       for (var username in global_data){
        console.log("username", username);
          var li = document.createElement('li');
          li.id = username;
          li.classList.add('rower');
          li.onclick = function(){selectRower(this.id)};
          li.innerHTML = decodeURI(global_data[username][0].firstName) + ' ' +  decodeURI(global_data[username][0].lastName);
          ul.append(li);
          }

          if ($("#rowers_list :first-child")[0]) {
           $("#rowers_list :first-child")[0].classList.add("rower_selected");
          // $("#rowers_list").first().click();

        }
}

function updateCurAverages(){
  if (global_data[username]) {
  for (var i = 0; i < global_data[username].length; i++){
    for(var j = 0; j < toggle_vals.length; j++){
      cur_averages[j]+= global_data[username][i][toggle_vals[j]];
    }
  }
  var trHTML = '';
    trHTML += '<tr><th>Stat</th><th>Workout Average</th><th>Your Average</th><th>+/-</th></tr>';

  for(var j = 0; j < toggle_vals.length; j++){
    cur_averages[j]/= global_data[username].length;
    var difference = (Math.round((cur_averages[j].toFixed(2) - averages[j].toFixed(2)) * 100) / 100);
    difference = calcDifference(difference);
    trHTML += '<tr><td>' + toggle_types[j] + '</td><td>' + averages[j].toFixed(2)
      + '</td><td>' + cur_averages[j].toFixed(2) + '</td><td id=\"' + difference.sign + '\">' +
      difference.difference + '</td></tr>';

  }
  $('#averages_table').empty();
  $('#averages_table').append(trHTML);
}
}

function updateAverages(){
  if (global_raw_data.length > 0){
  for (var i = 0; i < global_raw_data.length; i++){
    for(var j = 0; j < toggle_vals.length; j++){
      averages[j]+= global_raw_data[i][toggle_vals[j]];
    }
  }
  for(var j = 0; j < toggle_vals.length; j++){
    averages[j]/= global_raw_data.length;
  }
}
}

function getData(){
    console.log("workout selected");
    var chosen_workout = $('#workout_button');
    $.post("/get-workout-data", {workoutID: chosen_workout.val()}, function(res){
      console.log(res.data);
      //console.log(res);
      global_raw_data = res.data;
      global_data = res.data;
      cleanData();
      groupByUsername();
      $("#rowers_list").empty();
      populateUsersList();
      updateAverages();
      updateGraph();
      updateCurAverages();
    });
  }

$( document ).ready(function() {
    var svg = d3.select("#d3Graph").append("svg")
    .attr("id", "svg1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  $("#workouts").on("change", getData);
  /*$("#submitData").click(function() {
    ind2 = parseInt($("#idxToGraphX").val());
    ind2 = parseInt($("#idxToGraphY").val());
      $("svg :first-child").empty();
      console.log(global_data);
      cleanData();
      makeUL();
      d3Init(0);
  }}); */
  console.log( "ready!" );
  //parseCsvInit(path, d3Init)


});

function calcDifference(difference) {
  if (difference > 0) {
    return {difference: "+" + difference, sign : "positive"};
  } else {
    return {difference: difference, sign: "negative"};
  }
}
