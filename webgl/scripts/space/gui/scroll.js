function ScrollBar(xWeight, xDisplace, yWeight, yDisplace, w){
	this.x = 0;
	this.y = 0;
	this.xWeight = xWeight;
	this.xDisplace = xDisplace;
	this.yWeight = yWeight;
	this.yDisplace = yDisplace;
	this.windowResized();
	this.w = w;
	this.t = 0;
}

ScrollBar.prototype.draw = function(){
	var x = this.x;
	var y = this.y;
	var w = this.w;
	var t = this.t;
	
	frontContext.strokeStyle="rgba(100, 0, 255, 0.4)";
	frontContext.fillStyle="rgba(100, 0, 255, 0.4)";
	frontContext.lineWidth=2;
	frontContext.beginPath();
	frontContext.arc(x-w/2+w*t, y, 12, 0, 2*Math.PI);
	
	if(w*t>12){
		frontContext.moveTo(x-w/2, y);
		frontContext.lineTo(x-w/2+w*t-12, y);
	}
	
	if(w*t<w-12){
		frontContext.moveTo(x-w/2+w*t+12, y);
		frontContext.lineTo(x+w/2, y);
	}
	
	
	frontContext.stroke();
	frontContext.fill();
}

ScrollBar.prototype.isMouseInside = function(mx, my){
	var x = this.x;
	var y = this.y;
	var w = this.w;
	var t = this.t;
	var mid = x-w/2+w*t;
	
	var xdiff = mid-mx;
	var ydiff = y-my;
	
	if(xdiff*xdiff + ydiff*ydiff < 12*12){
		return true;
	}
    return false;
}

ScrollBar.prototype.mousePress = function(mx, my){

}
ScrollBar.prototype.mouseRelease = function(mx, my){

}
ScrollBar.prototype.mouseMove = function(oldmx, oldmy, mx, my){
	var x = this.x;
	var w = this.w;

	if(mx<x-w/2) this.t = 0.0;
	else if(mx>x+w/2) this.t = 1.0;
	else this.t = (mx-x+w/2)/w;
	if(this.onScroll){
		this.onScroll(this.t);
	}
	return true;
}

ScrollBar.prototype.windowResized = function(){
	this.x = width*this.xWeight + this.xDisplace;
	this.y = height*this.yWeight + this.yDisplace;
}