var quakes = [];
var interval = 5; // in minutes
var quake_table = document.getElementById('quake_table');
var quake_tbody = quake_table.getElementsByTagName('tbody')[0];
var colors = { //ignore green
    "yellow": "#F4FA58",
    "orange": "#FFBF00",
    "red": "#FF0000"
};

var init_url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2015-04-25&orderby=time"
var loading = document.getElementById('loading');

function addRow(quake_info) {
    var row = document.createElement('tr');
    var mag_col = addColumn(row, quake_info["mag"]);
    if (colors[quake_info["alert_"]] !== undefined) {
        mag_col.style.background = colors[quake_info["alert_"]];
    }
    addColumn(row, quake_info["place"]);
    var time_since = timeSince(new Date(parseInt(quake_info["time"]))) + "ago";
    addColumn(row, time_since);
    quake_tbody.appendChild(row);
}

function addColumn(row, data) {
    col = document.createElement('td');
    col.innerText = data;
    row.appendChild(col);
    return col;
}

function drawTable() {
    quake_tbody.innerHTML = "";
    quakes.forEach(addRow);
}

function initTable(page) {
    addQuakes(page);
    drawTable();
}

function addQuakes(page) {
    init_quakes = JSON.parse(page);
    var features = init_quakes["features"];
    for (var i = 0; i < features.length; i++) {
        var id = features[i]["id"];
        if (quakes.length > 0 && id == quakes[quakes.length - 1]["id"]) {
            alert("New earthquake detected!");
            return;
        }
        var prop = features[i]["properties"];
        var place = prop["place"];
        var end_idx = place.indexOf(", Nepal");
        if (end_idx != -1) {
            begin_idx = place.indexOf(" of ") + 4;
            place = place.substring(begin_idx, end_idx);
            quakes.push({
                id: id,
                alert_: prop["alert"],
                mag: prop["mag"],
                place: place,
                time: prop["time"]
            });
        }
    }
    show();
}

function show() {
    quake_table.style.display = "block";
    loading.style.display = "none";
}

function hide() {
    quake_table.style.display = "none";
    loading.innerText = "Please wait, loading data..";
}

function getPage(url, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 && httpRequest.status == 200)
                callback(httpRequest.responseText);
        }

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

hide();

//remove notice
setTimeout(function() {
    notice = document.getElementById("notice");
    notice.style.visibility = "hidden";
}, 3000);

getPage(init_url, initTable);

setInterval(function() {
    console.log("Updated page");
    getPage(init_url, initTable)
}, interval * 1000 * 60);