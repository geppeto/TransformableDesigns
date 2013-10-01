var world = null;
var collapse = false;
var ID = 0;

$(window).load(function () {

    initEvents();

});

function initEvents() {

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
    });

    $('#info-drawer-close').click(function (event) {
        $('#info-drawer').animate({left: '-250px'}, 100);
    })
}