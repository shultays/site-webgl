function System(pos, r){
	this.r = r;
	this.pos = pos;
    this.pos[3] = 1.0;

    this.shader = getStardustShader();
	this.sunRadius = 4;

	var ball = new InfoBall(this, [1.0, 1.0, 1.0, 1.0]);
	guiList.push(ball);
	ball.objRadius = 4.0;
}


System.prototype.draw = function(){
    var shader = this.shader;
    if(gl.currentShader != shader){
        gl.currentShader = shader;
        gl.useProgram(shader);
    }

    gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
    gl.uniform3fv(shader.eyePos, pos);
    gl.uniform3fv(shader.sideVec, sideVec);
    gl.uniform3fv(shader.upVec, upVec);
	
	Math.seedrandom("seed"+this.r);
	
	var cnt = Math.floor(Math.random()*5 + 5);
	var d = 0.0;
	
	for(var i=0; i<cnt; i++){
		gl.uniform3fv(shader.sideVec, sideVec);
		gl.uniform3fv(shader.upVec, upVec);
		mvPushMatrix();
		var speed = Math.random()*0.5+1;
		if(Math.random()<0.5) speed *= -1;
		
		speed /= (i+1)/3;
		
		var scale = (Math.random()*0.8+0.2)*(i+1)/8;
		if(i==0) scale = this.sunRadius;
		
		var a = Math.random()*Math.PI*2+this.t*speed/1000.0;
		var disp = Math.random();
		
		mat4.translate(mvMatrix, [this.pos[0]+Math.sin(a)*d, this.pos[1]+Math.cos(a)*d*disp/10, this.pos[2]+Math.cos(a)*d]);
		var c = [Math.random()*0.2+0.8, Math.random()*0.2+0.8, Math.random()*0.2+0.8, 1.0];

	    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
        drawCircle(2, c, scale);	
			
		mvPopMatrix();
		if(i!=0){
		mvPushMatrix();
			
		a = 0;
		gl.uniform3fv(shader.sideVec, [Math.sin(a), Math.cos(a)*disp/10, Math.cos(a)]);
		a = Math.PI/2;;
		gl.uniform3fv(shader.upVec, [Math.sin(a), Math.cos(a)*disp/10, Math.cos(a)]);
		
		mat4.translate(mvMatrix, [this.pos[0], this.pos[1], this.pos[2]]);
		
		gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
	
	
		gl.uniform4fv(gl.currentShader.color, [c[0]*0.5, c[1]*0.5, c[2]*0.5, 1.0]);
		gl.uniform1f(gl.currentShader.starScale, d);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, orbitBuffer);
		gl.vertexAttribPointer(gl.currentShader.vertexPositionAttribute, 3, gl.FLOAT, false, 9*4, 0);
		gl.vertexAttribPointer(gl.currentShader.vShift, 1, gl.FLOAT, false, 9*4, 3*4);
		gl.vertexAttribPointer(gl.currentShader.hShift, 1, gl.FLOAT, false, 9*4, 4*4);
		gl.vertexAttribPointer(gl.currentShader.vColor, 4, gl.FLOAT, false, 9*4, 5*4);

		gl.drawArrays(gl.LINE_LOOP, 0, orbitBuffer.numItems);
		
		mvPopMatrix();
		}
		
		if(i==0) d+=5;
		d += 6*Math.random()+2;
	}
	
	
	
	
};



System.prototype.tick = function(diff, t){
	this.t = t;

};

System.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, this.sunRadius, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

System.prototype.fireMouseClick = function(c){
    var ret = spaceMove([this.pos[0], this.pos[1], this.pos[2]], 10*this.sunRadius);

}

