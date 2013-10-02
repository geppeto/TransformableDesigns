var world = null;
var collapse = false;
var ID = 0;
var timelineToggle = true;

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

    $('#network-draw-collapsed').click(function () {
        drawNetworkCollapsed(world);
    });

    $('#network-draw-expanded').click(function () {
        drawNetworkExpanded(world);
    });

    $('#info-drawer-close').click(function (event) {
        $('#info-drawer').animate({left: '-250px'}, 100);
    });

    $('.btn-group').click(function (event) {
        $(this).toggleClass('open');
    });

    $('#timeline-toggle').click(function () {
        if (timelineToggle == true){
            $('#timeline').slideUp();
            $('#timeline-toolbar').animate({bottom: '0px'}, 100);
            timelineToggle = false;
        }
        else {
            $('#timeline').slideDown();
            $('#timeline-toolbar').animate({bottom: '250px'}, 100);
            timelineToggle = true;
        }
    });

    $('#btn-simulation').prop('disabled',true);
}