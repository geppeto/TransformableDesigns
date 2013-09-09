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
// 17/06/13    S.K      Created
// 22/06/13    S.K      Object oriented design model
// 01/07/13    S.K      Switch to Backbone.js for model definition
// 09/07/13    S.K      Use of subspaces for different ages (model change)
// 13/07/13    S.K      Added removeRandomPerson() method
// 14/07/13    S.K      Added WORLD, SPACES classes

//================================================
// CONTENTS:
//        
//         0. GLOBAL VARIABLES
//
//         - CLASSES
//         1. OBJECT
//         2. PERSON
//         3. ACCESSORY
//         4. SPACE
//         5. SUBSPACE
//         6. RELATIONSHIP
//         7. CALENDAR_EVENT
//         8. TIMELINE
//         7. WORLD
//
//         - COLLECTIONS
//         1. POPULATION (PERSON)
//         2. SUBSPACES (SUBSPACE)
//         3. SPACES (SPACE)
//         4. CALENDAR_EVENTS (CALENDAR_EVENT)
//
//================================================


// =================================================
//  0. GLOBAL VARIABLES
// =================================================

var ACTIVITY_CONSTANTS = {};
ACTIVITY_CONSTANTS['socializing'] = {'population': {'1-10': {w:1.5, d:1.5, h:2.6},
                                                    '11-50': {w:1.3, d:1.3, h:3.0},
                                                    '51-200': {w:1.1, d:1.1, h:4.0},
                                                    '201-500': {w:0.9, d:0.9, h:5.5},
                                                    '501-1000': {w:0.8, d:0.8, h:7.0},
                                                    '1000+': {w:0.7, d:0.7, h:10.0}
                                                    },
                                     'mobility': true,
                                     'flexible': true,
                                     'position': true,
                                     'age': {'1-3': {w:0.5, d:0.5, h:0.5},
                                             '4-8': {w:1.2, d:1.2, h:0.7},
                                             '9-13': {w:1.4, d:1.4, h:0.9},
                                             '14-18': {w:1.5, d: 1.5, h:1.0},
                                             '19-25': {w:1.2, d: 1.2, h:1.0},
                                             '26-35': {w:1.1, d: 1.1, h:1.0},
                                             '36-50': {w:1.0, d: 1.0, h:1.0},
                                             '51-65': {w:1.2, d: 1.2, h:1.0},
                                             '65+': {w:1.5, d: 1.5, h:1.0}
                                             },
                                     'sex': true,
                                     'space': {'lighting': ['low','medium','high'],
                                               'ventilation': ['medium', 'high', 'very high'],
                                               'transparency': ['very low', 'low', 'medium'],
                                               'privacy': ['very low', 'low'],
                                               'sound volume': ['medium', 'high', 'very high'],
                                               'warmth': ['medium', 'high', 'very high'],
                                               'temperature moisture': ['low', 'medium'],
                                               'openness': ['medium', 'high', 'very high'],
                                               'tactility': ['very low', 'low', 'medium'],
                                               'softness': ['low', 'medium', 'high', 'very high'],
                                               'color': ['adrenaline'], // ???
                                               'current activity intensity': ['very low', 'low', 'fast', 'very fast'], // ???
                                               'stance': ['standing up', 'sitting low', 'sitting high', 'lying down']
                                               },
                                     'relationship': {'kinetic':true,
                                                      'visual':true,
                                                      'aural':false,
                                                      'distance': ['attached', 'interwined'],
                                                      'interrupted': false,
                                                      'flexible':true
                                                      }
                                    };
                                    
ACTIVITY_CONSTANTS['sleeping'] = {'population': {'1-10': {w:1.2, d:2.0, h:2.0},
                                                 '11-50': {w:1.2, d:2.0, h:2.3},
                                                 '51-200': {w:1.1, d:2.0, h:3.0},
                                                 '201-500': {w:0.9, d:2.0, h:3.5},
                                                 '501-1000': {w:0.8, d:2.0, h:4.0},
                                                 '1000+': {w:0.6, d:2.0, h:5.0}
                                                 },
                                   'mobility': true,
                                   'flexible': true,
                                   'position': true,
                                   'age': {'1-3': {w:0.5, d:0.5, h:0.5},
                                             '4-8': {w:0.6, d:0.6, h:0.7},
                                             '9-13': {w:0.8, d:0.8, h:0.9},
                                             '14-18': {w:1.0, d: 1.0, h:1.0},
                                             '19-25': {w:1.0, d: 1.0, h:1.0},
                                             '26-35': {w:1.0, d: 1.0, h:1.0},
                                             '36-50': {w:1.0, d: 1.0, h:1.0},
                                             '51-65': {w:1.0, d: 1.0, h:1.0},
                                             '65+': {w:1.1, d: 1.1, h:1.0}
                                             },
                                   'sex': true,
                                   'space': {'lighting': ['very low', 'low'],
                                               'ventilation': ['very low', 'low'],
                                               'transparency': ['very low', 'low'],
                                               'privacy': ['high', 'very high'],
                                               'sound volume': ['very low', 'low'],
                                               'warmth': ['high', 'very high'],
                                               'temperature moisture': ['low', 'medium'],
                                               'openness': ['very low', 'low', 'medium', 'high', 'very high'],
                                               'tactility': ['high', 'very high'],
                                               'softness': ['medium', 'high', 'very high'],
                                               'color': ['soothing'], // ???
                                               'current activity intensity': ['very low'], // ???
                                               'stance': ['sitting low', 'lying down']
                                               },
                                   'relationship': {'kinetic':true,
                                                      'visual':false,
                                                      'aural':false,
                                                      'distance': ['attached', 'detached'],
                                                      'interrupted': true,
                                                      'flexible':true
                                                      }
                                 };
var RELATIONSHIP_CONSTANTS = {};

RELATIONSHIP_CONSTANTS['socializing'] = {'cooking': {}};

RELATIONSHIP_CONSTANTS['WC'] = {'*': {  'kinetic': true,
                                        'visual': false,
                                        'aural': false,
                                        'distance': ['detached', 'attached'],
                                        'interrupted': true,
                                        'flexible': false
                                     }
                               };

var calendar_url = 'https://www.google.com/calendar/feeds/e4im0nbrikcp500vh87geriabs%40group.calendar.google.com/public/full?alt=json&orderby=starttime';

Number.prototype.between = function (min, max) {
    return this >= min && this <= max;
};

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

// =================================================
//  1. OBJECT
// =================================================

var OBJECT = Backbone.Model.extend({

	// ---------------------------------------------
	// ATTRIBUTES
	// ---------------------------------------------
	defaults: {
		size: {w:0, d:0, h:0},
		surface: 0,
		volume: 0,
		position: {x:0, y: 0, z:0},
		mobility: false,
		flexible: false
	},
	
	// ---------------------------------------------
	// METHODS
	// ---------------------------------------------
    initialize: function() {
        
    },

    setSize: function(width, depth, height) {
        this.set({size: { w: width, d: depth, h:height }});
    },
	
	getSize: function () {
		this.get('size');
	},
	
    printSize: function() {
        console.log('{w:'+ this.get("size").w + ',d:' + this.get("size").d +',h:'+ this.get("size").h + '}');
    }
});

// =================================================
//  2. PERSON
// =================================================

var PERSON = OBJECT.extend({
	
	// ---------------------------------------------
	// ATTRIBUTES
	// ---------------------------------------------
	defaults: {
		age: 0,
		sex: null
	},
	
	// ---------------------------------------------
	// METHODS
	// ---------------------------------------------
	initialize: function () {

	},
	
	printPerson: function () {
		console.log('// Person '+ this.get('sex') + ' of age ' + this.get('age'));
	}
});

// =================================================
//  3. ACCESSORY
// =================================================

var ACCESSORY = OBJECT.extend({
	
	// ---------------------------------------------
	// ATTRIBUTES
	// ---------------------------------------------
	defaults: {
		name: null,
		type: 'surface' // Sitting (chairs, stools, benches)
	                  // Surfaces (Tables, bars, desk)
	   	               // Utilitarian (Bar, dj, pool, window/view)
	},
	
	// ---------------------------------------------
	// METHODS
	// ---------------------------------------------
	initialize: function () {
	
	}
});

// =================================================
//  4. SPACE
// =================================================

var SPACE = OBJECT.extend({

	// ---------------------------------------------
	// ATTRIBUTES
	// ---------------------------------------------
	defaults: {
        transformationLog: null,
		lighting: null, // [very low, low, medium, high, very high]
		ventilation: null, // [very low, low, medium, high, very high]
		transparency: null, // [very low, low, medium, high, very high]
		privacy: null, // [very low, low, medium, high, very high]
		sound_volume: null, // [very low, low, medium, high, very high]
		warmth: null, // (cozy to cool) [very low, low, medium, high, very high]
		temperature_moisture: null, //  [very low, low, medium, high, very high]
		openness: null, // [very low, low, medium, high, very high]
		tactility: null, // [very low, low, medium, high, very high]
		soft: null, // [very low, low, medium, high, very high]
		color: null, // [red, green, blue, yellow, magenta, cyan, black, white]
		activity: null, // [socializing, fornicating, sleeping, cooking, reading, leisure, eating, wc, working]
		current_activity_intensity: null, // [very low, low, medium, fast, very fast]
		stance: null, // [standing up, sitting low, sitting high, lying down]
		subspaces: null // holds PERSON instances in an age indexed associative array {'1-10': [object, object], '20-50':....}
	},

	// ---------------------------------------------
	// METHODS
	// ---------------------------------------------
	initialize: function () {
		var __ss = new SUBSPACES();
        this.set('transformationLog', new Array({w: 0, d:0, h:0}));
		this.set({subspaces: __ss});
		this.get('subspaces').on('change add', function (s) {
			console.log('++ Edit subspaces **');
		});
	},

	addPerson: function (person) {
		var age = person.get('age');
		var agecat = '';


		if ( age.between(1,3) ){
			agecat = '1-3';
		}
		else if ( age.between(4,8) ){
			agecat = '4-8';
		}
		else if ( age.between(9,13) ){
			agecat = '9-13';
		}
		else if ( age.between(14,18) ){
			agecat = '14-18';
		}
		else if ( age.between(19,25) ){
			agecat = '19-25';
		}
		else if ( age.between(26,35) ){
			agecat = '26-35';
		}
		else if ( age.between(36,50) ){
			agecat = '36-50';
		}
		else if ( age.between(51,65) ){
			agecat = '51-65';
		}
		else if ( age > 65 ){
			agecat = '65+';
		}
		else {
			alert('Unknown age range');
		}

		// Subspace creation

        // Subspace for this age group does not exist or no space is empty
		if ( (this.get('subspaces').length == 0) || (this.get('subspaces').get(agecat) == undefined) ) {
			console.log('! subspace bucket created ['+agecat+']');
			var _ss = new SUBSPACE({age: agecat});
			_ss.get('persons').add(person);
			this.get('subspaces').add(_ss);
		}
        // Subspace exists for this age group
		else if (this.get('subspaces').get(agecat)) {
			console.log('! subspace bucket exists');
			this.get('subspaces').get(agecat).get('persons').add(person);
		}
		else {
			alert('bucket check error');
		}
	},

	addRandomPerson: function () {
		var sex = '';
		var age = 0;
		var rand = Math.random();
		var p = null;

		sex = Math.floor((rand*10)) % 2 == 0 ? 'male':'female';
		age = Math.floor(rand*100)+1;
		person = new PERSON({age: age,sex: sex});
		this.addPerson(person);
	},

    removeRandomPerson: function () {
        var subspaces = this.get('subspaces');

        // Prune empty subspaces
        subspaces.map(function (ss) {
            if (ss.get('persons').length == 0) {
                console.log('- SUBSPACE (removing empty subspace)');
                subspaces.remove(ss.get('age'));
            }
        });

        // Remove the last person from a random subspace
        var randomSubspaceNumber = Math.floor((Math.random()*this.get('subspaces').length));
        var randomSubspace = this.get('subspaces').at(randomSubspaceNumber);
        if (randomSubspace != undefined){
            return randomSubspace.get('persons').pop();
        }
    },

	printPersons: function () {
		var totalpopulation = this.get('subspaces')
							.map(function(ss){ return ss.get('persons').length;})
							.reduce(function (memo, num) { return memo + num; },0);

		console.log('/////////// POPULATION ///////////');
		console.log('Total : '+totalpopulation);
		console.log('');
		this.get('subspaces').each( function (ss) {
			var agepercent = (ss.get('persons').length / totalpopulation)*100;
			console.log('AGE '+ss.get('age')+'-------------['+agepercent+'%]');
			ss.get('persons').each( function (p) {
				console.log(p.get('sex') + ' age ' + p.get('age'));
			});
		});
		console.log('//////////////////////////////////');
	},

	printSpace: function () {
		var totalpopulation = this.get('subspaces')
							.map(function(ss){ return ss.get('persons').length;})
							.reduce(function (memo, num) { return memo + num; },0);

		console.log('///////////// SPACES /////////////');
		console.log('Total : '+totalpopulation);
		console.log('');
		this.get('subspaces').each( function (ss) {
			console.log('SUBSPACE '+ss.get('age')+': W:'+ss.get('width')+': D:'+ss.get('depth')+': H:'+ss.get('height'));
		});
		console.log('//////////////////////////////////');
	},

    populationToRange: function (population) {
        if ( population.between(0,10) ){
            return '1-10';
        }
        else if ( population.between(11,50) ){
            return '11-50';
        }
        else if ( population.between(51,200) ){
            return '51-200';
        }
        else if ( population.between(201,500) ){
            return '201-500';
        }
        else if ( population.between(501,1000) ){
            return '501-1000';
        }
        else if ( population > 1000){
            return '1000+';
        }
        else {
            alert('Unknown population range');
            return null;
        }
    },

	adapt: function () {
        var _space = this;

        var constants = ACTIVITY_CONSTANTS[this.get('activity')];
		var population = this.get('subspaces')
							 .map(function(ss){ return ss.get('persons').length;})
							 .reduce(function (memo, num) { return memo + num; },0);
        var population_modifier = constants['population'][this.populationToRange(population)];

        // calculate the width, depth, height of each subspace
        // according to each subspace's population and the constants
        // given for the activity taking place in the enclosing space
		this.get('subspaces').each( function (ss) {
			var subspace_age = ss.get('age');
			var subspace_population = ss.get('persons').length;
            var subspace_population_range = _space.populationToRange(subspace_population);
            var age_modifier = constants['age'][subspace_age];
            var subspace_population_modifier = constants['population'][subspace_population_range];

			ss.set('width' , subspace_population * subspace_population_modifier.w * age_modifier.w);
			ss.set('depth' , subspace_population * subspace_population_modifier.d * age_modifier.d);
			ss.set('height', population_modifier.h * age_modifier.h);
		});

        // width is the sum of the widths of the subspaces
        this.set('width', this.get('subspaces')
                                .map(function(ss) { return ss.get('width'); })
                                .reduce(function (memo, num) { return memo + num; },0));
        // depth is the sum of the depths of the subspaces
        this.set('depth', this.get('subspaces')
                              .map(function(ss) { return ss.get('depth'); })
                              .reduce(function (memo, num) { return memo + num; },0));
        // height is the maximum of the subspaces' heights
        this.set('height', _.max(this.get('subspaces')
                                     .map(function(ss) { return ss.get('height'); }).concat([0])));

        this.get('transformationLog').push({w:this.get('width'),d:this.get('depth'),h:this.get('height')});

        console.log('!! ADAPT w: ' + this.get('width')
                          + ' d: ' + this.get('depth')
                          + ' h: ' + this.get('height')
                          + ' **');

		return {w: this.get('width'), d: this.get('depth'), h: this.get('height')};
	}

});

// =================================================
//  5. SUBSPACE
// =================================================

var SUBSPACE = OBJECT.extend({
	
	// ---------------------------------------------
	// ATTRIBUTES
	// ---------------------------------------------
	idAttribute: 'age',
	
	defaults: {
		age: '1-3',
		persons: null
	},
	
	// ---------------------------------------------
	// METHODS
	// ---------------------------------------------
	initialize: function () {
		var __population = new POPULATION();
		this.set({persons: __population});

        // debugging methods that observe people entering
        // and leaving a subspace
		this.get('persons').on('add', function (model) {
			console.log('++ Added new '+ model.get('sex') +
                                ' age ' + model.get('age') +
                                ' in SUBSPACE '+ this.get('age') +
                                ' **');
		});
        this.get('persons').on('remove', function (model) {
            console.log('-- Removed '+ model.get('sex') +
                ' age ' + model.get('age') +
                ' from SUBSPACE '+ this.get('age') +
                ' **');
        });
	},

	addPerson: function (person) {
		this.get('persons').add(person);
	}
	
});

// =================================================
//  6. RELATIONSHIP
// =================================================

var RELATIONSHIP = Backbone.Model.extend({
	
	// ---------------------------------------------
	// ATTRIBUTES
	// ---------------------------------------------
	defaults: {
		kinetic: false,
		visual: false,
		aural: false,
		spaces: [],
		distance: 0,
		interrupted: false,
		flexible: false
	},
	
	// ---------------------------------------------
	// METHODS
	// ---------------------------------------------
	initialize: function () {
	
	}
});

// =================================================
//  7. CALENDAR_EVENT
// =================================================

var CALENDAR_EVENT = Backbone.Model.extend({

    defaults: {
        day: null,
        start_time: 0,
        end_time: 0,
        start_time_index: 0,
        end_time_index: 0,
        activity: null,
        persons: 0,
        duration: 0
    },

    initialize: function () {

    }

});

// =================================================
//  8. TIMELINE
// =================================================

var TIMELINE = Backbone.Model.extend({

    defaults: {
        calendar: calendar_url,
        events: null,
        availability: null,
        history: null
    },

    initialize: function () {
        this.set('events', new CALENDAR_EVENTS());
        var events = this.get('events');

        $.getJSON(this.get('calendar'), function (data) {
            for(var i = 0; i < data.feed.entry.length; i++){
                var _start_time = new Date(data.feed.entry[i].gd$when[0].startTime);
                var _start_time_index = (_start_time.getHours()*60)+
                                        (_start_time.getMinutes())+
                                        ((_start_time.getDay())*1440);
                var _end_time = new Date(data.feed.entry[i].gd$when[0].endTime);
                var _end_time_index =   (_end_time.getHours()*60)+
                                        (_end_time.getMinutes())+
                                        ((_end_time.getDay())*1440);
                var _activity = (data.feed.entry[i].title.$t).split(' ')[0];
                var _persons = parseInt((data.feed.entry[i].title.$t).split(' ').filter(function(e) {return e!=""})[1]);
                var _durationMs = _end_time.getTime() - _start_time.getTime();
                var _duration = Math.floor(_durationMs/60000);

                console.log('start' + _start_time + ' end '+_end_time + ' duration '+_duration);

                var new_event = new CALENDAR_EVENT({
                    start_time: _start_time,
                    end_time: _end_time,
                    start_time_index: _start_time_index,
                    end_time_index: _end_time_index,
                    activity: _activity,
                    persons: _persons,
                    duration: _duration
                });
                events.add(new_event);
            }
            $(document).trigger('calendarloaded');
        });
    },

    eventsToJson: function () {
        var result = [];

        this.get('events').forEach(function (event) {
            result.push({'start': event.get('start_time'),
            'end': event.get('end_time'),
            'content': event.get('activity')});
        });

        return result;
    },

    printCalendar: function () {
        this.get('events').forEach(function (event){
            console.log('>> CALENDAR : '+event.get('activity')+' '+event.get('persons')+' persons');
        });
        console.log(this.get('availability'));
    }
});

// =================================================
//  9. WORLD
// =================================================

var WORLD = Backbone.Model.extend({

    // ---------------------------------------------
    // ATTRIBUTES
    // ---------------------------------------------
    defaults: {
        timeline: null,
        time: 0,
        spaces: null,
        canvas: null
    },

    // ---------------------------------------------
    // METHODS
    // ---------------------------------------------
    initialize: function () {
        this.set('timeline', new TIMELINE());
        this.set('spaces', new SPACES());
    },

    simulate: function () {

        var ID = 0;

        // Create as many spaces as events

        var _ss = this.get('spaces');
        _.times(this.get('timeline').get('events').length,
            function(i) { _ss.add(new SPACE());});

        // we ran adapt for each space once when it's full of
        // people and once when it empties.

        for (var i = 0; i < this.get('timeline').get('events').length ; i++){

            console.log('EVENT '+ i +' START');
            var _event = this.get('timeline').get('events').at(i);
            var _space = this.get('spaces').at(i);
            var _transformation = {};

            // connect each event with its corresponding space
            // by giving them the same ID attribute

            _event.set('ID', ID);
            _space.set('ID', ID);

            // all persons of an event enter the space
            // at the same time at the beginning of the event

            _.times(_event.get('persons'), function (person) {
                _space.set('activity', _event.get('activity'));
                _space.addRandomPerson();
            });
            _transformation = _space.adapt();

            // all persons of an event leave the space
            // at the same time at the end of the event

            /*
            while(_space.removeRandomPerson()){}
            _transformation = _space.adapt();
            */

            ID++;

            console.log('EVENT '+ i +' END');
        }

        $(document).trigger('simulationend',[this]);
    }
});

// =================================================
//  1. POPULATION
// =================================================

var POPULATION = Backbone.Collection.extend({
    model: PERSON
});

// =================================================
//  2. SUBSPACES
// =================================================

var SUBSPACES = Backbone.Collection.extend({
    model: SUBSPACE
});

// =================================================
//  3. SPACES
// =================================================

var SPACES = Backbone.Collection.extend({
    model: SPACE
});

// =================================================
//  4. CALENDAR_EVENTS
// =================================================

var CALENDAR_EVENTS = Backbone.Collection.extend({
    model: CALENDAR_EVENT
});
