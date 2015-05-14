"use strict";

var quake_table = document.getElementById("quake_table");
var quake_tbody = quake_table.getElementsByTagName("tbody")[0];
var dropdown=document.getElementById("duration");

var quakes = [];
var prevIndex=0;
var interval = 5; // in minutes
var howlong=["earthquakes in the past day.",
             "earthquakes in the past week.",
             "earthquakes since the one on April 25,2015"];

//API Links
var base_url="http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&minlatitude=26.116&maxlatitude=31.279&minlongitude=79.453&maxlongitude=88.690&starttime=2015-04-25";
var past_hour_url="http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson";

function addRow(quake_info) {
    var row = document.createElement("tr");
    addColumn(row, quake_info.mag);
    addColumn(row, quake_info.place);
    var time_since = timeSince(quake_info.time) + " ago";
    addColumn(row, time_since);
    quake_tbody.appendChild(row);
}

function addColumn(row, data) {
    var col = document.createElement("td");
    col.appendChild(document.createTextNode(data));
    row.appendChild(col);
}


function drawTable() {
    quake_tbody.innerHTML = "";
    var count=0;
    var postfix="";
    if (dropdown.selectedIndex==2){
        quakes.forEach(addRow);
        count=quakes.length;
    }
    else{
        var now=new Date();
        var days=dropdown.selectedIndex===0?1:7;
        for(var i=0;i<quakes.length;i++){
            var hours=parseInt((now - quakes[i].time)/36e5);
            if (hours>days*24){
                break;
            }
            addRow(quakes[i]);
            count++;
        }
    }
    document.getElementById("count").innerHTML=count;
    document.getElementById("howlong").innerHTML=howlong[dropdown.selectedIndex];
}

function initTable(page) {
    addQuakes(page);
    drawTable();
}

function addQuakes(page) {
    var init_quakes = JSON.parse(page);
    var features = init_quakes.features;
    for (var i = 0; i < features.length; i++) {
        var id = features[i].id;
        if (quakes.length > 0 && id == quakes[quakes.length - 1].id) {
            alert("New earthquake detected!");
            return;
        }
        var prop = features[i].properties;
        var place = prop.place;
        var end_idx = place.indexOf(", Nepal");
        if (end_idx != -1) {
            var begin_idx = place.indexOf(" of ") + 4;
            place = place.substring(begin_idx, end_idx);
            quakes.push({
                id: id,
                mag: prop.mag,
                place: place,
                time: new Date(parseInt(prop.time))
            });
        }
    }
    show();
}

function show() {
    quake_table.style.display = "block";
}

function hide() {
    quake_table.style.display = "none";
}

function getPage(url, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 && httpRequest.status == 200)
                callback(httpRequest.responseText);
        };

        httpRequest.open("GET", url, true);
        httpRequest.send(null);
    }
    //Time since code, courtesy of Sky Sanders
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

dropdown.onchange=function() {
    console.log(prevIndex);
    if (prevIndex!==dropdown.selectedIndex){
        prevIndex=dropdown.selectedIndex;
        drawTable();
    }
};

hide();
console.log("Getting page");
getPage(base_url,initTable);

setInterval(function() {
    console.log("Updated page");
    getPage(past_hour_url, initTable);
}, interval * 1000 * 60);