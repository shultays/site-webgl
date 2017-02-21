
function InfoBall(obj, color){
	this.obj = obj;
	this.color = [Math.floor(color[0]*255), Math.floor(color[1]*255), Math.floor(color[2]*255)];
	this.angle = 0.0;
	this.radius = 12;
	this.objRadius = 1.0;
}


InfoBall.prototype.draw = function(){
	var pos = this.obj.pos;
	
	var center = [0, 0, 0, 1.0];
	convert3DTo2D(pos, center);

	var alpha = 1-(center[2]-350)/100;
	if(alpha>1.0) alpha = 1.0;
	if(center[2]<1 || alpha < 0 || center[0] < -200 || center[1] < -200 || center[0] > width+200 || center[1] > height+200 ){
		this.invis = true;
		return;
	}
	this.invis = false;

	var p3 = [pos[0]+sideVec[0]*this.objRadius,pos[1]+sideVec[1]*this.objRadius,pos[2]+sideVec[2]*this.objRadius, 1.0];
		
	var right =  [0, 0, 0, 1.0];
	convert3DTo2D(p3, right);
	var d = right[0]-center[0];
	frontContext.save();
	frontContext.translate(center[0], center[1]);
	
	
	var xDiff = mouseState[0].x-center[0];
	var yDiff = mouseState[0].y-center[1];
	var angle = Math.atan2(yDiff, xDiff);
	
	var distance = 40+d;
	var maxDistance = Math.sqrt(xDiff*xDiff+yDiff*yDiff);
	var cos = xDiff/maxDistance;
	var sin = yDiff/maxDistance;
	if(distance>maxDistance) distance = maxDistance;
	if(distance<d+this.radius) distance = d+this.radius;
	
	frontContext.fillStyle="rgba("+this.color[0]+", "+this.color[1]+", "+this.color[2]+", "+0.5*alpha+")";
	frontContext.strokeStyle="rgba("+this.color[0]+", "+this.color[1]+", "+this.color[2]+", "+1.0*alpha+")";

	frontContext.beginPath();
	frontContext.arc(cos*distance,sin*distance,this.radius,0,2*Math.PI);
	frontContext.fill();
	frontContext.stroke();
	
	frontContext.font="22px Arial bold";

	frontContext.fillStyle="rgba(0, 0, 0, "+alpha+")";
	frontContext.textAlign="center"; 
	frontContext.fillText("!",cos*distance,sin*distance+6);
	
	frontContext.beginPath();
	frontContext.moveTo(cos*(distance-this.radius),sin*(distance-this.radius));
	frontContext.lineTo(cos*d,sin*d);
	frontContext.stroke();
	 
	 
	frontContext.restore();
	this.x = cos*distance + center[0];
	this.y = sin*distance + center[1];
}


InfoBall.prototype.mouseMove = function(oldmx, oldmy, mx, my){

}
InfoBall.prototype.mousePress = function(mx, my){

    this.obj.fireMouseClick();
}
InfoBall.prototype.mouseRelease = function(mx, my){

}

InfoBall.prototype.isMouseInside = function( x, y){
	if(this.invis) return false;
	var xDiff = x-this.x;
	var yDiff = y-this.y;
    if(xDiff*xDiff + yDiff*yDiff < this.radius*this.radius){
        return true;
    }else{
        return false;
    }
}


InfoBall.prototype.windowResized = function(){
}