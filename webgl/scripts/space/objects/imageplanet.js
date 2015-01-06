
function ImagePlanet(src, pos, color, center){
	this.pos = pos;
    this.pos[3] = 1.0;
	this.color = color;
    this.planetCenter = center;

    this.src = src;
    this.alpha = 0;
    this.show = 0;
    this.loaded = false;
    this.loadStarted = false;
    this.oldLoadsReady = false;
    this.loadTexture();
	
	var ball = new InfoBall(this, color);
	guiList.push(ball);
	
}

ImagePlanet.prototype.loadTexture = function(){
    this.loadStarted = true;
    var texture = gl.createTexture();
    this.texture = texture;
    var _this = this;
    texture.image = new Image();
    texture.image.onload = function() {
        handleLoadedTexture(texture);
        _this.shiftCenter = [ (_this.planetCenter[0] - this.width/2)/this.width, 
                              (_this.planetCenter[1] - this.height/2)/this.height];
        _this.scale = this.width/_this.planetCenter[2];
        _this.loaded = true;
    }
    texture.image.src = "scripts/space/textures/" + this.src;

}
ImagePlanet.prototype.draw = function(){
    var shader;
    if(!this.alpha)
        shader = getStardustShader();
    else
        shader = getTexturedStardustShader();

    if(gl.currentShader != shader){
        gl.currentShader = shader;
        gl.useProgram(shader);
		gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
		gl.uniform3fv(shader.eyePos, pos);
		gl.uniform3fv(shader.sideVec, sideVec);
		gl.uniform3fv(shader.upVec, upVec);
    }


    mvPushMatrix();
    if(this.alpha > 0){
	    mat4.translate(mvMatrix, this.pos);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture);

	    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		
		gl.depthMask(false);
        drawCircleTextured(2,  this.color);
        gl.depthMask(true);

	    mat4.translate(mvMatrix, [sideVec[0]*this.shiftCenter[0], sideVec[1]*this.shiftCenter[0], sideVec[2]*this.shiftCenter[0]]);
	    mat4.translate(mvMatrix, [upVec[0]*this.shiftCenter[1], upVec[1]*this.shiftCenter[1], upVec[2]*this.shiftCenter[1]]);
        mat4.scale(mvMatrix, [this.scale, this.scale, this.scale]);

	    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        drawRectangle(2,  [1.0, 1.0, 1.0, this.alpha]);
    }else{
	    mat4.translate(mvMatrix, this.pos);
	    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
        drawCircle(2, this.color);
    }

	mvPopMatrix();
};

ImagePlanet.prototype.tick = function(diff, t){
    var loadsReady = this.loaded && whiteTextureReady;

    if(moved || loadsReady != this.oldLoadsReady){
        this.distance = vec3.distance(this.pos, pos);
        this.show = this.distance < 100;

    }
    this.oldLoadsReady = loadsReady;
    var drawTexture = (this.show && this.loaded && whiteTextureReady);
    if(drawTexture) if(this.alpha < 1.0) this.alpha += diff/500.0;
    if(!this.show) if(this.alpha > 0.0) this.alpha -= diff/500.0;
    if(this.alpha < 0) this.alpha = 0;
    if(this.alpha > 1) this.alpha = 1;
};

ImagePlanet.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 1.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

ImagePlanet.prototype.fireMouseClick = function(c){
    spaceMove([this.pos[0], this.pos[1], this.pos[2]]);
}
