var world = null;

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

    $('#network-movement').click(function (event) {
        event.preventDefault();
        console.log('move!');
        drawNetworkWithSampleMovements(world);
    })
}