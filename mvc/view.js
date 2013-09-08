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
        "height": "200px",
        "editable": true
    };

    $('.timeline-event').css('background', '#0088cc');
    var timeline = new links.Timeline(document.getElementById('timeline'));
    timeline.draw(data, options);

    /*$('.timeline-event-range').css({"border": "solid",
        "border-radius": "1px",
        "height": "auto",
        "width": "auto",
        "position": "relative",
        "overflow": "auto"});*/

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
            .map(function (log) { return log.w + log.d + log.h; });

        console.log(spaceSizeLog.toString());
        var maxSpaceSize = Math.round(_.max(spaceSizeLog));

        height = maxSpaceSize/2 + 20;
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
    console.log('draw START');
    var groupID = 0;
    var subspaceID = 1000000;
    var nodes = [];
    var connections = [];

    world.get('spaces').forEach(function (space) {
        space.set('groupID', groupID);
        nodes.push({'id': groupID,
                    'group': groupID,
                    'text': space.get('activity'),
                    'value': space.get('subspaces').length,
                    'style': 'dot'});

        space.get('subspaces').forEach(function (subspace) {
            subspace.set('subspaceID', subspaceID);
            nodes.push({'id': subspaceID,
                        'text': subspace.get('age'),
                        'group': groupID,
                        'fontColor': 'darkgray',
                        'value': subspace.get('persons').length,
                        'style': 'dot'});
            connections.push({  'from': subspaceID,
                                'to': groupID,
                                'color': 'lightgray',
                                'style': 'line',
                                'length': 30});
            subspaceID++;
        });

        if (groupID != 0) {
            connections.push({  'from': groupID,
                                'to': groupID-1,
                                'color': 'darkgray'});
        }

        groupID++;
    });

    var options = {
        "width":  "100%",
        "height": "350px",
        "backgroundColor": {
            "strokeWidth": 0
        },
        "stabilize": false
    };

    var network = new links.Network(document.getElementById('network'));
    network.draw(nodes,connections,options);

    links.events.addListener(network, 'select', function () {onselect(network,world,nodes);});

    console.log('draw END');
});

function drawNetworkWithSampleMovements (world){
    console.log('draw START');
    var groupID = 0;
    var subspaceID = 1000000;
    var nodes = [];
    var connections = [];

    world.get('spaces').forEach(function (space) {
        space.set('groupID', groupID);
        nodes.push({'id': groupID,
            'group': groupID,
            'text': space.get('activity'),
            'value': space.get('subspaces').length,
            'style': 'dot'});

        space.get('subspaces').forEach(function (subspace) {
            subspace.set('subspaceID', subspaceID);
            var connection_style = '';
            if (subspaceID%3==0) {
                connection_style = 'moving-dot';
            }
            else if (subspaceID%4==0) {
                connection_style = 'moving-arrows';
            }
            else {
                connection_style = 'line';
            }
            nodes.push({'id': subspaceID,
                'text': subspace.get('age'),
                'group': groupID,
                'fontColor': 'darkgray',
                'value': subspace.get('persons').length,
                'style': 'dot'});
            connections.push({  'from': subspaceID,
                'to': groupID,
                'color': 'lightgray',
                'style': connection_style,
                'length': 30});
            subspaceID++;
        });

        if (groupID != 0) {
            connections.push({  'from': groupID,
                'to': groupID-1,
                'color': 'darkgray'});
        }

        groupID++;
    });

    var options = {
        "width":  "100%",
        "height": "350px",
        "backgroundColor": {
            "strokeWidth": 0
        },
        "stabilize": true
    };

    var network = new links.Network(document.getElementById('network'));
    network.draw(nodes,connections,options);

    links.events.addListener(network, 'select', function () {onselect(network,world,nodes);});

    console.log('draw END');
};

function onselect (network,world,nodes) {

    $.magnificPopup.open({
        items: {
            src: '<div class="white-popup  mfp-with-anim">hello there</div>',
            type: 'inline'
        },
        removalDelay: 500,
        mainClass: 'mfp-fade',
        closeBtnInside: true,
        midClick: true
    });

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
