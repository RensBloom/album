$(document).ready(function(){
var w = window.innerWidth || document.documentElement.clientWidth;

var scrollX = 0;
var activeTouches = 0;
var dragTouchId = -1;
var rotating = false;
var clicked = false, animating = false; dragged = false, clickX = 0, oldCursorX = 0, cursorX = 0, numImages = 0;
var grid = parseInt($(".object").css("width")) + parseInt($(".object").css("margin-left")) + parseInt($(".object").css("margin-right"));
var animationLoop;
var imgPerRow = 8;        //number of visible images per row
var colMin = -2;          //preload 2 images
var colMax = imgPerRow+1; //preload 2 images
var idMin = -6;
var idMax = 3*colMax+2;
var numRows = $(".scrollContainer").length;
var items = [];
var numImages = 0;
var scrollMax = 0;
var eTime1 = 0;
var eTime2 = 0;
var eX1 = 0;
var eX2 = 0;

$(".wall").css({"max-width":(imgPerRow*grid)+"px"});
$(".object").css({"transform":"translate(0px,0)"});
$(".object").attr("offset",0);

it = 0;
$(".scrollContainer").each(function() {
	for (var i = 1; i < imgPerRow+2; i++) {
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

//handle left/right button presses
$("#right").click(
	function() {
		animating = true;
		scrollX += 800;
		if (scrollX > scrollMax) {
			scrollX = scrollMax;
		}
		autoAddImages(800);
		updateScroll(1);
		setTimeout(function() {
			autoRemoveImages();
		},1000);
	}
);
$("#left").click(
	function() {
		animating = true;
		scrollX -= 800;
		if (scrollX < -2*grid) {
			scrollX = -2*grid;
		}
	}
);

//handle dragging with mouse & touch events
$("body").on({
	'mousemove': function(e) {
		oldCursorX = cursorX;
		cursorX = e.pageX;
		if (clicked) {
			dragged = true;
			updateDraggedScroll();
		}
		eTime1 = eTime2;
		eX1 = eX2;
		eX2 = cursorX;
		eTime2 = $.now();
		if (clicked) {
			dragged = true;
			updateDraggedScroll();
		}
		
	},
	'mousedown': function(e) {
		clicked = true;
		clickX = e.pageX;
		cursorX = e.pageX;
		eX1 = cursorX;
		eX2 = cursorX;
		eTime1 = eTime2 = $.now();
	},
	'mouseup': function() {
		clicked = false;
		endDraggedScrolling();
		dragged = false;
		eTime2 = $.now();
		dT = Math.max(0.001, (eTime2 - eTime1)/500);
		dX = -Math.round((eX2 - eX1)/dT);
		scrollX += dX;
		autoAddImages(dX);
		updateScroll(1);
		setTimeout(function() {
			autoRemoveImages();
		},1000);
	},
	'mousewheel': function(e) {
		updateScrolledScroll(Math.floor(e.originalEvent.wheelDelta));
	},
	'touchmove': function(e) {
		var touches = e.originalEvent.touches;
		for (var i = 0; i < touches.length; i++) {
			if (touches[i].identifier == dragTouchId) {
				oldCursorX = cursorX;
				cursorX = touches[i].pageX;
				eTime1 = eTime2;
				eX1 = eX2;
				eX2 = cursorX;
				eTime2 = $.now();
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
			eX1 = cursorX;
			eX2 = cursorX;
			eTime1 = eTime2 = $.now();
		} else {
			//clicked = false;
			//dragTouchId = -1;
		}
	},
	'touchend': function() {
		if (--activeTouches == 0) {
			clicked = false;
			endDraggedScrolling();
			dragged = false;
			eTime2 = $.now();
			dT = Math.max(0.001, (eTime2 - eTime1)/500);
			dX = -Math.round((eX2 - eX1)/dT);
			scrollX += dX;
			autoAddImages(dX);
			updateScroll(1);
			setTimeout(function() {
				autoRemoveImages();
			},1000);
	
		}
	}
});

var updateScrolledScroll = function(dX) {
	scrollX -= dX;
	updateToScrollX();
}

var updateDraggedScroll = function() {
	dX = cursorX-oldCursorX;
	scrollX -= dX;
	updateToScrollX();
	rotating = true;
	//$(".rotate").css({"transform":"rotateY("+Math.min(10,Math.max(-10,(cursorX-clickX)/-20))+"deg)", "transition":"0s"});
	$(".wall").addClass("rotate");
}

var updateToScrollX = function() {
	if (scrollX < -2*grid) {
		scrollX = -2*grid;
	} else if (scrollX > scrollMax) {
		scrollX = scrollMax;
	}
	autoRemoveImages();
	autoAddImages();
	updateScroll(0);
}

var endDraggedScrolling = function() {
	if (rotating) {
		rotating = false;
		//$(".rotate").prop('style').removeProperty("transition");
	//	$(".rotate").prop('style').removeProperty("transform");
		$(".wall").removeClass("rotate");
	}
}

//scroll all images to their correct positions
var updateScroll = function(animationTime) {
	$(".object").each(function() {
		offset = parseInt($(this).attr("offset"));
		newX = (offset-scrollX);
		$(this).css({"transform":"translate(" + newX + "px,0)", "transition":animationTime+"s"});
	});
}

//scroll all images to their correct positions
var updateScroll2 = function(animationTime) {
	$(".object").each(function() {
		offset = parseInt($(this).attr("offset"));
		newX = (offset-scrollX);
		$(this).css({"transform":"translate(" + newX + "px,0)", "transition":animationTime+"s", "transition-timing-function":"linear"});
	});
}


//add images that will be visible in shorthand
var autoAddImages = function(offset) {
	while (scrollX > (colMax - imgPerRow)*grid) {
		colMax++;
		it = 0;
		$(".scrollContainer").each(function() {
			idMax++;
			if (idMax >= 0 && idMax < numImages) {
				var newDiv = $("<div/>")   // creates a div element
							 .addClass("object")  // add a class
							 .attr("id",(idMax))
							 .attr("offset",(colMax*grid))
							 .html("<img src=\""+ items[idMax].msrc + "\" draggable=\"false\">")
							 .css({"transform":"translate(" + (colMax*grid-scrollX+offset) + "px,0)"});
				
				 if (it == 2) {
					newDiv.addClass("bottom");
				}
				$(this).append(newDiv);
				newDiv.focus();
				newDiv.click(function() {
					openPswp(parseInt($(this).attr("id")));
				});
			}
			it++;
		});
	}
	while (scrollX < (colMin+1)*grid) {
		colMin--;
		it = 0;
		$(".scrollContainer").each(function() {
			idMin--;
			if (idMin >= 0 && idMin < numImages) {
				var newDiv = $("<div/>")   // creates a div element
							 .addClass("object")  // add a class
							 .attr("id",(idMin))
							 .attr("offset",(colMin*grid))
							 .html("<img src=\""+ items[idMin].msrc + "\" draggable=\"false\">")
							 .css({"transform":"translate(" + (colMin*grid-scrollX+offset) + "px,0)"});
				 if (it == 2) {
					newDiv.addClass("bottom");
				}
				$(this).append(newDiv);
				newDiv.focus();
				newDiv.click(function() {
					openPswp(parseInt($(this).attr("id")));
				});
			}
			it++;
		});
	}
}

//remove photo objects far outside screen
var autoRemoveImages = function() {
	while (scrollX <= (colMax - imgPerRow-2)*grid) {
		colMax--;
		idMax -= 3;
		$(".object").each(function() {
			offset = parseInt($(this).attr("offset"));
			if (offset > (colMax*grid)) {
				$(this).remove();			
			}
		});
	}
	while (scrollX >= (colMin+3)*grid) {
		colMin++;
		idMin += 3;
		$(".object").each(function() {
			offset = parseInt($(this).attr("offset"));
			if (offset < (colMin*grid)) {
				$(this).remove();			
			}
		});
	}
}

//Load image filenames
$.get("images.php", function(data){
	items = jQuery.parseJSON(data);
	numImages = items.length;
	scrollMax = (numImages/3-2)*grid;
	$(".object").each(function() {
		id = parseInt($(this).attr("id"));
		if (id < numImages) {
			$(this).html("<img src=\""+ items[id].msrc + "\" draggable=\"false\">");
		}
	});
});

//Load photoswipe element (full-screen photo viewer)
var pswpElement = document.querySelectorAll('.pswp')[0];

//open PhotoSwipe with photo-id
var openPswp = function(id) {
	if (!dragged) {
		var options = {// define options
			index: (id) // start at correct slide
		};
		// Initializes and opens PhotoSwipe
		var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
		gallery.init();
	}
}

$(".object").click(function() {
	openPswp(parseInt($(this).attr("id"))); // start at first slide
});



});