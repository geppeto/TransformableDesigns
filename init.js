var world = null;
var collapse = false;
var snapper = null;

$(window).load(function () {

    initEvents();

    snapper = new Snap({element: document.getElementById('content'), disable: 'left', touchToDrag: false, tapToClose: false});

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
        snapper.close();
    })
}