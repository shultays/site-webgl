function ImageGUI(src, xWeight, xDisplace, yWeight, yDisplace, imageWeightX, imageWeightY){
	this.x = 0;
	this.y = 0;
	this.xWeight = xWeight;
	this.xDisplace = xDisplace;
	this.yWeight = yWeight;
	this.yDisplace = yDisplace;
	this.imageWeightX = imageWeightX;
	this.imageWeightY = imageWeightY;
	this.windowResized();
	
	
	this.img = new Image();
	this.loaded = false;
	this.alpha = 1.0;
	this.img.src = "./scripts/space/textures/"+src+".png";
	var _this = this;
	this.img.onload = function() {
		_this.loaded = true;
	};
}

ImageGUI.prototype.draw = function(){
	if(this.loaded){
		frontContext.globalAlpha  = this.alpha;
        frontContext.drawImage(this.img, this.x+this.img.width*this.imageWeightX, this.y+this.img.height*this.imageWeightY);
		frontContext.globalAlpha  = 1.0;
	}
}

ImageGUI.prototype.isMouseInside = function(mx, my){

    return false;
}

ImageGUI.prototype.mousePress = function(mx, my){

}
ImageGUI.prototype.tick = function(diff, t){
}
ImageGUI.prototype.mouseRelease = function(mx, my){

}
ImageGUI.prototype.mouseMove = function(oldmx, oldmy, mx, my){
	
	return true;
}

ImageGUI.prototype.windowResized = function(){
	this.x = width*this.xWeight + this.xDisplace;
	this.y = height*this.yWeight + this.yDisplace;
}