$(document).ready(function(){
var w = window.innerWidth || document.documentElement.clientWidth;

var scrollX = 0;
var activeTouches = 0;
var dragTouchId = -1;
var rotating = false;
var clicked = false, animating = false; dragged = false, clickX = 0, oldCursorX = 0, cursorX = 0, idMin = 0, numImages = 0;
var grid = parseInt($(".object").css("width")) + parseInt($(".object").css("margin-left")) + parseInt($(".object").css("margin-right"));
var animationLoop;
var imgPerRow = 8;        //number of visible images per row
var colMin = -2;          //preload 2 images
var colMax = imgPerRow+1; //preload 2 images
var idMax = 3*colMax+2;
var numRows = $(".scrollContainer").length;
var items = [];
var numImages = 0;

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
		autoAddImages(800);
		updateScroll(1);
		setTimeout(function() {
			console.log("seconde");
			autoRemoveImages();
		},1000);
	}
);
$("#left").click(
	function() {
		animating = true;
		scrollX -= 800;
		autoAddImages(-800);
		updateScroll(1);
		setTimeout(function() {
			autoRemoveImages();
		},1000);
	}
);



//handle dragging with mouse & on touch screens
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
			//clicked = false;
			//dragTouchId = -1;
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
	scrollX -= dX;
	autoRemoveImages();
	autoAddImages();
	updateScroll(0);
	rotating = true;
	$(".rotate").css({"transform":"rotateY("+Math.min(10,Math.max(-10,(cursorX-clickX)/-20))+"deg)", "transition":"0s"});
	$(".wall").addClass("rotate");
}
var endDraggedScrolling = function() {
	if (rotating) {
		rotating = false;
		$(".rotate").prop('style').removeProperty("transition");
		$(".rotate").prop('style').removeProperty("transform");
		$(".wall").removeClass("rotate");
	}
}

var updateScroll = function(animationTime) {
	$(".object").each(function() {
		offset = parseInt($(this).attr("offset"));
		newX = (offset-scrollX);
		$(this).css({"transform":"translate(" + newX + "px,0)", "transition":animationTime+"s"});
	});
}

var autoAddImages = function(offset) {
	while (scrollX > (colMax - imgPerRow)*grid) {
		colMax++;
		$(".scrollContainer").each(function() {
			idMax++;
			if (idMax >= 0 && idMax < numImages) {
				var newDiv = $("<div/>")   // creates a div element
							 .addClass("object")  // add a class
							 .attr("id",(idMax))
							 .attr("offset",(colMax*grid))
							 .html("<img src=\""+ items[idMax].src + "\" draggable=\"false\">")
							 .css({"transform":"translate(" + (colMax*grid-scrollX+offset) + "px,0)"});
				
				 if (it == 2) {
					newDiv.addClass("bottom");
				}
				$(this).append(newDiv);
				newDiv.focus();
			}
			it++;
		});
	}
	while (scrollX < (colMin+1)*grid) {
		colMin--;
		$(".scrollContainer").each(function() {
			idMin--;
			if (idMin >= 0 && idMin < numImages) {
				var newDiv = $("<div/>")   // creates a div element
							 .addClass("object")  // add a class
							 .attr("id",(idMin))
							 .attr("offset",(colMin*grid))
							 .html("<img src=\""+ items[idMin].src + "\" draggable=\"false\">")
							 .css({"transform":"translate(" + (colMin*grid-scrollX+offset) + "px,0)"});
				 if (it == 2) {
					newDiv.addClass("bottom");
				}
				$(this).append(newDiv);
				newDiv.focus();
			}
			it++;
		});
	}
}

var autoRemoveImages = function() {
	console.log("scrollx" + scrollX + " colmin " + colMin);

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
	$(".object").each(function() {
		id = parseInt($(this).attr("id"));
		if (id < numImages) {
			$(this).html("<img src=\""+ items[id].src + "\" draggable=\"false\">");
		}
	});
});

//Load photoswipe element (full-screen photo viewer)
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