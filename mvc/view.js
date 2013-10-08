// -*- Mode: Javascript; Syntax: js  -*-

//  This file contains code for the iTRANSFORM architectural
//  application
//
//			        KOKKALIS S. STYLIANOS
//		         ("geppeto" "@" "gmail.com")
//			           CHANIA, GREECE
//
// Copyright (C) 2013
//
// Permission is granted to any individual or institution to use, copy, modify,
// and distribute this software, provided that this complete copyright and
// permission notice is maintained, intact, in all copies and supporting
// documentation.
//
// Kokkalis Stylianos provides this software "as is" without
// express or implied warranty.
//

// Change history:
//
//   Date	  Author	Description
// -------------------------------------------------------------------------------------
// 05/09/13    S.K      Created
// 09/09/13    S.K      Threw KineticJS away in favor of CHAP libraries

//================================================
// CONTENTS:
//
//         0. GLOBAL VARIABLES
//
//         - CLASSES
//         1. OBJECT
//
//         - COLLECTIONS
//         1. POPULATION (PERSON)
//
//================================================


// =================================================
//  0. GLOBAL VARIABLES
// =================================================

function displayMenu () {

    var src = "<div class='white-popup mfp-with-anim'><form id='settings-form'>" +
        "<div class='input-prepend'>" +
        "<span class='add-on'><i class='icon-calendar'></i></span>" +
        "<input id='calendar-url' class='span2' type='text' placeholder='Enter your Google Calendar link'></div>" +
        "<a id='save-settings' class='btn' href='#'><i class='icon-save'></i> Save</a></form></div>";

    $.magnificPopup.open({
        items: {
            src: src,
            type: 'inline'
        },
        removalDelay: 500,
        mainClass: 'mfp-fade',//'mfp-move-from-top',
        closeBtnInside: true,
        midClick: true
    });

    $('#save-settings').click(function (event){
        event.preventDefault();
        calendar_url = $('#calendar-url').val();
        console.log(calendar_url);
    });
}

$(document).on('calendarloaded timelinestandardmode', function(){

    var data = [];
    data = world.get('timeline').eventsToJson();

    var options = {
        "width":  "100%",
        "height": "250px",
        "editable": true
    };

    $('.timeline-event').css('background', '#0088cc');
    var timeline = new links.Timeline(document.getElementById('timeline'));
    timeline.draw(data, options);

    $(document).trigger('timelineloaded',[world]);
});

$(document).on('timelinegraphmode',function(event,world){

    var data = [];
    var events = world.get('timeline').get('events');
    var index = 0;

    events.forEach(function (event){
        var spaceSizeLog = world.get('spaces')
            .at(index)
            .get('transformationLog')
            .map(function (log) { return log.w * log.d * log.h; });

        console.log(spaceSizeLog.toString());
        var maxSpaceSize = Math.round(_.max(spaceSizeLog));

        height = maxSpaceSize/10 + 20;
        var hue = Math.min(Math.max(height, 20), 80) * 1.2; // hue between 0 (red) and 120 (green)
        var color = hsv2rgb(hue, 0.95, 0.95);
        var borderColor = hsv2rgb(hue, 0.9, 0.9);
        style = 'height:' + height + 'px;' +
            'background-color: ' + color + ';' +
            'border-top: 2px solid ' + borderColor + ';';
        var actual = '<div class="bar" style="' + style + '" ' +
            ' title="Actual: ' + maxSpaceSize + ' size">' + event.get('activity') + '</div>';
        var item = {
            'group': 'Max Space',
            'start': event.get('start_time'),
            'end': event.get('end_time'),
            'content': actual
        };
        data.push(item);
        index++;
    });

    var options = {
        "width":  "100%",
        "height": "200px",
        "style": "box"
    };

    $('.timeline-event-range').css({"border": "none",
        "border-radius": "0",
        "height": "100px",
        "width": "100%",
        "position": "relative",
        "overflow": "visible"});

    var timeline = new links.Timeline(document.getElementById('timeline'));
    timeline.draw(data, options);

    $('.timeline-event').css('background', 'none');
});

$(document).on('simulationend',function(event, world){
    drawNetworkExpanded(world);
});

function drawNetworkExpanded(world){
    console.log('draw START');

    var nodes = [];
    var connections = [];

    world.get('spaces').forEach(function (space) {

        var groupID = space.get('ID');

        nodes.push({'id': groupID,
                    'group': groupID,
                    'text': space.get('activity'),
                    'radius': 20,
                    'style': 'dot'});

        space.get('subspaces').forEach(function (subspace) {

            nodes.push({'id': subspace.get('ID'),
                        'text': subspace.get('age'),
                        'group': groupID,
                        'fontColor': 'darkgray',
                        'value': subspace.get('persons').length,
                        'style': 'dot'});
            connections.push({  'from': subspace.get('ID'),
                                'to': groupID,
                                'color': 'lightgray',
                                'style': 'line',
                                'length': 30});
        });
    });

    world.get('spaces').forEach(function (space) {
        world.get('spaces').forEach(function (spaceinner) {
            if (spaceinner.get('activity') != space.get('activity') &&
                spaceinner.get('ID') != space.get('ID') &&
                Math.round(Math.random()*100)%(world.get('spaces').length*4)==0) {
                connections.push({  'from': space.get('ID'),
                    'to': spaceinner.get('ID'),
                    'color': 'darkgray',
                    'style': Math.round(Math.random()*10)%8==0?'moving-arrows':'line',
                    'length': 500
                });
            }
            if (spaceinner.get('activity') == space.get('activity') &&
                spaceinner.get('ID') != space.get('ID')) {
                connections.push({  'from': space.get('ID'),
                    'to': spaceinner.get('ID'),
                    'color': 'darkgray',
                    'style': 'line',
                    'length': 200
                });
            }
        });
    });

    var options = {
        "width":  "100%",
        "height": "100%",
        "backgroundColor": {
            "strokeWidth": 0
        },
        "stabilize": false
    };

    var network = new links.Network(document.getElementById('network'));
    network.draw(nodes,connections,options);

    links.events.addListener(network, 'select', function () {onselect(network,world,nodes);});
    console.log('draw END');
}

function drawNetworkCollapsed(world){
    console.log('draw START');

    var nodes = [];
    var connections = [];
    var activities = [];

    // we group the spaces by activity and we treat each
    // group as one space that is created and modified

    world.get('spaces').forEach(function (space) {
        var activity = space.get('activity');
        if (activities[activity] == undefined) {
            activities[activity] = new Array(space);
        }
        else {
            activities[activity].push(space);
        }
    });

    // we create node entries for the drawn network
    // one for every event. we just consider all
    // spaces in an activity group to be UPDATE
    // nodes for that activity.

    for (var activity in activities) {

        var activityspaces = activities[activity];

        activityspaces.forEach(function (space) {
            var spaceSize = space.get('subspaces').
                map(function (ss) { return ss.get('width')*ss.get('depth'); /* TODO: ss.get('height') */}).
                reduce(function (memo, num) { return memo+num;},0);

            // we get the timestamp from the corresponding event
            // remember an event that corresponds to a space
            // has the same ID attribute as that space

            var timestamp = world.get('timeline').
                get('events').
                findWhere({ID: space.get('ID')}).
                get('start_time');

            nodes.push({'id': activity,
                        'action': 'update',
                        'text': activity,
                        'radius': Math.round(spaceSize),
                        'backgroundColor': 'salmon',
                        'borderColor': 'lightsalmon',
                        'timestamp': timestamp,
                        'style': 'dot'});
        });
    }

    var options = {
        "width":  "100%",
        "height": ($(window).height() - 250)+"px",
        "backgroundColor": {
            "strokeWidth": 0
        },
        "stabilize": false
    };

    var network = new links.Network(document.getElementById('network'));
    network.draw(nodes.reverse(),connections,options);

    links.events.addListener(network, 'select', function () {onselect(network,world,nodes);});

    $('#info-drawer').animate({left: '-250px'},100);

    console.log('draw END');
}


function onselect (network,world,nodes) {

    // Network Graph time view

    if ($('.network-slider-title').length != 0) {

    }

    // Network Graph expanded view

    else {

        $('#info-drawer').animate({left: '0px'},100);

        var sel = network.getSelection();
        var info = '';
        var space = world.get('spaces').findWhere({ID: nodes[sel[0].row].id});

        if ( space == undefined ){

            // node is a subspace

            var subspace = undefined;
            world.get('spaces').forEach(function (space) {
                var _subspace = space.get('subspaces').findWhere({ID: nodes[sel[0].row].id});
                subspace = _subspace != undefined? _subspace: subspace;
            })

            $('#info-space').hide();
            $('#info-subspace').show();
            $('#info-width').text(Math.round(subspace.get('width')));
            $('#info-depth').text(Math.round(subspace.get('depth')));
            $('#info-height').text(Math.round(subspace.get('height')));
            $('#info-population').text(subspace.get('persons').length);
            $('#info-age').text(subspace.get('age'));
        }
        else {
            var population = space.get('subspaces')
                .map(function(ss){ return ss.get('persons').length;})
                .reduce(function (memo, num) { return memo + num; },0);

            $('#info-space').show();
            $('#info-subspace').hide();
            $('#info-width').text(Math.round(space.get('width')));
            $('#info-depth').text(Math.round(space.get('depth')));
            $('#info-height').text(Math.round(space.get('height')));
            $('#info-population').text(population);
            $('#info-activity').text(space.get('activity'));
            $('#info-color').text(space.get('color'));
            $('#info-stance').text(space.get('stance'));
            $('.info-bar').each(function () {
                var quality = $(this).attr('id').replace('info-','');
                var quality_value = qualityValueToNumber(space.get(quality));
                var barwidth = (quality_value * 20) + '%';
                $(this).animate({width: barwidth}, 2000, function () {});
            });
        }

    }
}

function generateReport (world) {
    var data = [];
    var activities = [];

    //
    // STREAM CHART ACTIVITY/SPACE/TIME
    //

    // we group the spaces by activity and we treat each
    // group as one space that is created and modified

    world.get('spaces').forEach(function (space) {
        var activity = space.get('activity');
        if (activities[activity] == undefined) {
            activities[activity] = new Array(space);
        }
        else {
            activities[activity].push(space);
        }
    });

    for (var activity in activities) {

        var values = [];
        var activityspaces = activities[activity];

        activityspaces.forEach(function (space) {
            var spaceSize = space.get('subspaces').
                map(function (ss) { return ss.get('width')*ss.get('depth'); /* TODO: ss.get('height') */}).
                reduce(function (memo, num) { return memo+num;},0);

            // we get the timestamp from the corresponding event
            // remember an event that corresponds to a space
            // has the same ID attribute as that space

            var timestamp = world.get('timeline').
                get('events').
                findWhere({ID: space.get('ID')}).
                get('start_time');

            timestamp = timestamp.getTime();

            values.push([timestamp, spaceSize]);
        });

        values = _.sortBy(values, function (d) { return d[0]; });
        data.push({"key": activity, "values": values});
    }

    // interpolate time and space data to create
    // equal length arrays for the chart

    var alldates = data.map(function (d) { return d["values"]})
        .reduce(function (k,l) { return k.concat(l)}, [])
        .map(function (v) { return v[0]; });
    var mindate = _.min(alldates);
    var maxdate = _.max(alldates);

    data = data.map(function (d) {
        var values = d["values"];
        var dates = [];
        var sizes = [];
        dates = dates.concat([mindate], values.map(function (v) {return v[0];}), [maxdate]);
        sizes = sizes.concat([0], values.map(function (v) {return v[1];}), [0]);
        var interpolatedValues = interpolateSizes(sizes, dates, [mindate, maxdate],10000000);

        return {"key": d["key"], "values": _.zip(interpolatedValues["dates"],interpolatedValues["sizes"])};
    });


    nv.addGraph(function (){
        var chart = nv.models.stackedAreaChart()
            .x(function (d) {return d[0];})
            .y(function (d) {return d[1];})
            ;

        chart.xAxis
            .tickFormat(function (d) { return d3.time.format('%x')(new Date(d))});

        chart.yAxis
            .tickFormat(d3.format(',d'));

        d3.select('#stream')
            .datum(data)
            .transition().duration(3000).call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });

    /*
    //
    // ACTIVITY/SPACE PIE CHART
    //

    var piedata = [];

    for (var activity in activities) {

        var activityspaces = activities[activity];
        var size = activityspaces.map(function (space) {
                        return space.get('subspaces').
                                map(function (ss) { return ss.get('width')*ss.get('depth'); }).
                                reduce(function (memo, num) { return memo+num;},0);})
            .reduce(function (memo, num) {return memo+num},0);

        piedata.push({"label": activity, "value": size});
    }

    nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showLabels(false)
            .donut(true);

        d3.select("#pie-report")
            .datum(piedata)
            .transition().duration(3000)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
    */

    //
    // QUALITIY/TIME CHART
    //

    // we group the spaces by activity and we treat each
    // group as one space that is created and modified
    var qualities = [];
    var qualitiesdata = [];
    var _QUALITIES = _.without(QUALITIES, 'stance', 'color');

    _QUALITIES.forEach( function (quality) {

        world.get('spaces').forEach(function (space) {
            var timestamp = world.get('timeline').
                get('events').
                findWhere({ID: space.get('ID')}).
                get('start_time');

            timestamp = timestamp.getTime();

            if (qualities[quality] == undefined) {
                qualities[quality] = new Array({y: qualityValueToNumber(space.get(quality)), x: timestamp});
            }
            else {
                qualities[quality].push({y: qualityValueToNumber(space.get(quality)), x: timestamp});
            }
        });

        qualitiesdata.push({"key":quality, "values":qualities[quality]});

    });

    qualitiesdata = qualitiesdata.map(function (q) {
        var _v = [];
        return {"key":q["key"], "values":_v.concat([{x: maxdate+1, y: 0}], q["values"], [{x: mindate-1, y: 0}])};
    })

    // interpolate time and space data to create
    // equal length arrays for the chart
    /*
    qualitiesdata = qualitiesdata.map(function (d) {
        var values = d["values"];
        var dates = [];
        var sizes = [];
        dates = dates.concat([mindate], values.map(function (v) {return v[1];}), [maxdate]);
        sizes = sizes.concat([0], values.map(function (v) {return v[0];}), [0]);
        var interpolatedValues = interpolateSizes(sizes, dates, [mindate, maxdate],10000000);

        return {"key": d["key"], "values": _.zip(interpolatedValues["dates"],interpolatedValues["sizes"])};
    });

    */

    nv.addGraph(function (){
        var chart = nv.models.lineChart();

        chart.xAxis
            .tickFormat(function (d) { return d3.time.format('%x')(new Date(d))});

        chart.yAxis
            .tickFormat(d3.format(',r'));

        d3.select('#qualities-chart')
            .datum(qualitiesdata)
            .transition().duration(3000).call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });

}

function qualityValueToNumber (value) {
    switch (value) {
        case 'very low':
            return 1;
        case 'low':
            return 2;
        case 'medium':
            return 3;
        case 'high':
            return 4;
        case 'very high':
            return 5;
        default:
            return 0;
    }
}

var hsv2rgb = function(H, S, V) {
    var R, G, B, C, Hi, X;

    C = V * S;
    Hi = Math.floor(H/60);  // hi = 0,1,2,3,4,5
    X = C * (1 - Math.abs(((H/60) % 2) - 1));

    switch (Hi) {
        case 0: R = C; G = X; B = 0; break;
        case 1: R = X; G = C; B = 0; break;
        case 2: R = 0; G = C; B = X; break;
        case 3: R = 0; G = X; B = C; break;
        case 4: R = X; G = 0; B = C; break;
        case 5: R = C; G = 0; B = X; break;

        default: R = 0; G = 0; B = 0; break;
    }

    return "RGB(" + parseInt(R*255) + "," + parseInt(G*255) + "," + parseInt(B*255) + ")";
};

var createInterpolant = function(xs, ys) {
    var i, length = xs.length;

    // Deal with length issues
    if (length != ys.length) { throw 'Need an equal count of xs and ys.'; }
    if (length === 0) { return function(x) { return 0; }; }
    if (length === 1) {
        // Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
        // Impl: Unary plus properly converts values to numbers
        var result = +ys[0];
        return function(x) { return result; };
    }

    // Rearrange xs and ys so that xs is sorted
    var indexes = [];
    for (i = 0; i < length; i++) { indexes.push(i); }
    indexes.sort(function(a, b) { return xs[a] < xs[b] ? -1 : 1; });
    var oldXs = xs, oldYs = ys;
    // Impl: Creating new arrays also prevents problems if the input arrays are mutated later
    xs = []; ys = [];
    // Impl: Unary plus properly converts values to numbers
    for (i = 0; i < length; i++) { xs.push(+oldXs[indexes[i]]); ys.push(+oldYs[indexes[i]]); }

    // Get consecutive differences and slopes
    var dys = [], dxs = [], ms = [];
    for (i = 0; i < length - 1; i++) {
        var dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i];
        dxs.push(dx); dys.push(dy); ms.push(dy/dx);
    }

    // Get degree-1 coefficients
    var c1s = [ms[0]];
    for (i = 0; i < dxs.length - 1; i++) {
        var m = ms[i], mNext = ms[i + 1];
        if (m*mNext <= 0) {
            c1s.push(0);
        } else {
            var dx = dxs[i], dxNext = dxs[i + 1], common = dx + dxNext;
            c1s.push(3*common/((common + dxNext)/m + (common + dx)/mNext));
        }
    }
    c1s.push(ms[ms.length - 1]);

    // Get degree-2 and degree-3 coefficients
    var c2s = [], c3s = [];
    for (i = 0; i < c1s.length - 1; i++) {
        var c1 = c1s[i], m = ms[i], invDx = 1/dxs[i], common = c1 + c1s[i + 1] - m - m;
        c2s.push((m - c1 - common)*invDx); c3s.push(common*invDx*invDx);
    }

    // Return interpolant function
    return function(x) {
        // The rightmost point in the dataset should give an exact result
        var i = xs.length - 1;
        if (x == xs[i]) { return ys[i]; }

        // Search for the interval x is in, returning the corresponding y if x is one of the original xs
        var low = 0, mid, high = c3s.length - 1;
        while (low <= high) {
            mid = Math.floor(0.5*(low + high));
            var xHere = xs[mid];
            if (xHere < x) { low = mid + 1; }
            else if (xHere > x) { high = mid - 1; }
            else { return ys[mid]; }
        }
        i = Math.max(0, high);

        // Interpolate
        var diff = x - xs[i], diffSq = diff*diff;
        return ys[i] + c1s[i]*diff + c2s[i]*diffSq + c3s[i]*diff*diffSq;
    };
};

var interpolateSizes = function(sizes, dates, range, step) {
    var f = createInterpolant(dates, sizes);

    var resultsizes = [], resultdates = [];
    var firstdate = range[0], lastdate = range[1];
    for (var x = firstdate; x <= lastdate; x=x+step) {
        resultsizes.push(Math.round(f(x)));
        resultdates.push(x);
    }

    return { sizes: resultsizes, dates: resultdates };
};
/*

 / /BACKUP THIS FUNCTION IN CASE NETWORK LIBRARY IS UPDATED (in network.js)

 links.Network.Slider = function(container) {
 if (container === undefined) throw "Error: No container element defined";

 this.container = container;

 this.frame = document.createElement("DIV");
 //this.frame.style.backgroundColor = "#E5E5E5";
 this.frame.style.width = "80%";
 this.frame.style.position = "relative";

 this.title = document.createElement("DIV");
 this.title.className = "network-slider-title";
 this.title.style.margin = "2px";
 this.title.style.marginBottom = "5px";
 this.title.innerHTML = "";
 this.container.appendChild(this.title);

 this.frame.prev = document.createElement("i");
 this.frame.prev.className = "network-slider-prev btn icon-backward";
 this.frame.appendChild(this.frame.prev);

 this.frame.play = document.createElement("i");
 this.frame.play.className = "network-slider-play btn icon-play";
 this.frame.appendChild(this.frame.play);

 this.frame.next = document.createElement("i");
 this.frame.next.className = "network-slider-next btn icon-forward";
 this.frame.appendChild(this.frame.next);

 this.frame.bar = document.createElement("INPUT");
 this.frame.bar.type = "BUTTON";
 this.frame.bar.className = "network-slider-bar";
 this.frame.bar.style.position = "absolute";
 this.frame.bar.style.border = "1px solid red";
 this.frame.bar.style.width = "100px";
 this.frame.bar.style.height = "6px";
 this.frame.bar.style.borderRadius = "2px";
 this.frame.bar.style.MozBorderRadius = "2px";
 this.frame.bar.style.border = "1px solid #7F7F7F";
 this.frame.bar.style.backgroundColor = "#E5E5E5";
 this.frame.appendChild(this.frame.bar);

 this.frame.slide = document.createElement("INPUT");
 this.frame.slide.type = "BUTTON";
 this.frame.slide.className = "network-slider-slide";
 this.frame.slide.style.margin = "0px";
 this.frame.slide.value = " ";
 this.frame.slide.style.position = "relative";
 this.frame.slide.style.left = "-100px";
 this.frame.appendChild(this.frame.slide);

 // create events
 var me = this;
 this.frame.slide.onmousedown = function (event) {me._onMouseDown(event);};
 this.frame.prev.onclick = function (event) {me.prev(event);};
 this.frame.play.onclick = function (event) {me.togglePlay(event);};
 this.frame.next.onclick = function (event) {me.next(event);};

 this.container.appendChild(this.frame);

 this.onChangeCallback = undefined;

 this.playTimeout = undefined;
 this.framerate = 20; // frames per second
 this.duration = 10; // seconds
 this.doLoop = true;

 this.start = 0;
 this.end = 0;
 this.value = 0;
 this.step = 0;
 this.rangeIsDate = false;

 this.redraw();
 };
*/