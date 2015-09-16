$(document).ready(function(){
var w = window.innerWidth || document.documentElement.clientWidth;

var activeTouches = 0;
var dragTouchId = -1;
var clicked = false, animating = false; dragged = false, clickX = 0, oldCursorX = 0, cursorX = 0, idMin = 0, numImages = 0;
var grid = parseInt($(".object").css("width")) + parseInt($(".object").css("margin-left")) + parseInt($(".object").css("margin-right"));
var animationLoop;
var imgPerRow = 10;
var idMax = 3*imgPerRow-1;
var numRows = $(".scrollContainer").length;

var items = [];
var numImages = 0;

$(".wall").css({"max-width":((imgPerRow-2)*grid)+"px"});
$(".object").css({"transform":"translate(0px,0)"});
$(".object").attr("offset",0);

it = 0;
$(".scrollContainer").each(function() {
	for (var i = 1; i < imgPerRow; i++) {
		var newDiv = $("<div/>")   // creates a div element
					 .addClass("object")  // add a class
					 .attr("id",(it+i*numRows))
					 .attr("offset",(i*grid))
					 .css({"transform":"translate(" + (i*grid) + "px,0)"});
		if (it == 2) {
			newDiv.addClass("bottom");
		}
		$(this).append(newDiv);
	}
	it++;
});

$(".scrollContainer").on({
	'mousemove': function(e) {
		oldCursorX = cursorX;
		cursorX = e.pageX;
		if (clicked) {
			dragged = true;
			updateDraggedScroll();
		}
	},
	'mousedown': function(e) {
		clicked = true;
		clickX = e.pageX;
		cursorX = e.pageX;
	},
	'mouseup': function() {
		clicked = false;
		endDraggedScrolling();
	},
	'touchmove': function(e) {
		var touches = e.originalEvent.touches;
		for (var i = 0; i < touches.length; i++) {
			alert(touches[i].identifier);
			if (touches[i].identifier == dragTouchId) {
				oldCursorX = cursorX;
				cursorX = touches[i].pageX;
				if (clicked) {
					dragged = true;
					updateDraggedScroll();
				}
			}
		}
	},
	'touchstart': function(e) {
		if (++activeTouches == 1) {
			var touches = e.originalEvent.touches;
			dragTouchId = touches[0].identifier;
			clicked = true;
			clickX = touches[0].pageX;
			cursorX = touches[0].pageX;
		} else {
			clicked = false;
			dragTouchId = -1;
		}
	},
	'touchend': function() {
		if (--activeTouches == 0) {
			clicked = false;
			endDraggedScrolling();	
		}
	}
});

var updateDraggedScroll = function() {
	dX = cursorX-oldCursorX;
	
	gridOffset = Math.round($(".object").first().attr("offset")) % grid;
	if (!gridOffset) {
		gridOffset = 1;
	}	
	$(".object").each(function() {
		oldX = parseInt($(this).attr("offset"));
		correction = (gridOffset - (oldX % grid)) % grid;
		if (correction < grid*-0.5) {
			correction += grid;
		} else if (correction > grid*0.5) {
			correction -= grid;
		}
		oldX += correction;

		
		newX = (oldX+dX);
		if (newX < -200 && idMax < numImages-1) {
			idMin++;
			idMax++;
			newX += (imgPerRow*grid);
			animTime = 0;
			$(this).html("<img src=\""+ items[idMax].src + "\" draggable=\"false\">");
			$(this).attr("id", idMax);
		} else if (newX > imgPerRow*grid-200 && idMin > 0) {
			idMin--;
			idMax--;
			newX -= (imgPerRow*grid);
			animTime = 0;
			$(this).html("<img src=\""+ items[idMin].src + "\" draggable=\"false\">");
			$(this).attr("id", idMin);
		}
		$(this).attr("offset",newX);
		$(this).css({"transform":"translate(" + newX + "px,0)", "transition":"0s", "transition-timing-function":"linear"});
	});

	
	$(".rotate").css({"transform":"rotateY("+Math.min(10,Math.max(-10,(cursorX-clickX)/-20))+"deg)", "transition":"0s"});
	$(".wall").addClass("rotate");
}
var endDraggedScrolling = function() {
	$(".rotate").prop('style').removeProperty("transition");
	$(".rotate").prop('style').removeProperty("transform");
	$(".wall").removeClass("rotate");
}

$.get("images.php", function(data){
	items = jQuery.parseJSON(data);
	numImages = items.length;
	$(".object").each(function() {
		id = parseInt($(this).attr("id"));
		if (id < numImages) {
			$(this).html("<img src=\""+ items[id].src + "\" draggable=\"false\">");
		}
	});
});

var pswpElement = document.querySelectorAll('.pswp')[0];

$(".object").click(function() {
	var options = {// define options (if needed)
		index: (parseInt($(this).attr("id"))) // start at first slide
	};
	if (!dragged) {
		// Initializes and opens PhotoSwipe
		var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
		gallery.init();
	}
	dragged = false;
});



});