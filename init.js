var world = null;
var collapse = false;

$(window).load(function () {
	initMenu();
});

function initMenu() {

    $('#calendar').click(function () {
        world = new WORLD();
    });

    $('#simulate').click(function () {
        world.simulate();
    });

    $('#menu').click(function () {
        displayMenu();
    });

    $('#timeline-standardmode').click(function (event) {
        event.preventDefault();
        $(document).trigger('timelinestandardmode');
    });

    $('#timeline-graphmode').click(function (event) {
        event.preventDefault();
        $(document).trigger('timelinegraphmode',[world]);
    });

    $('#network-collapse').click(function (event) {
        event.preventDefault();
        if (collapse == false) {
            drawNetworkCollapsed(world);
            collapse = true;
        }
        else {
            drawNetworkExpanded(world);
            collapse = false;
        }
    })
}