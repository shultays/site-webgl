
function MusicPlanet(src, pos, color, center, audioSrc){
	this.pos = pos;
	this.audioSrc = "../audios/"+audioSrc;
	
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
	
	var _this = this;
	var ball = new InfoBall(this, color);
	guiList.push(ball);
	
	this.isPlaying = 0;
	
	getBinaryData("./out.bin", 
		function getXHR(data){		
			_this.data = data;
		}
	);
	
}

MusicPlanet.prototype.loadTexture = function(){
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
MusicPlanet.prototype.draw = function(){
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

MusicPlanet.prototype.tick = function(diff, t){
    var loadsReady = this.loaded && whiteTextureReady;

    if(moved || loadsReady != this.oldLoadsReady){
        this.distance = vec3.distance(this.pos, pos);
        this.show = this.distance < 100;

		if(this.isPlaying){
			this.isPlaying = 0;
			postProcess = false;
			this.audio.pause();
		}
    }
    this.oldLoadsReady = loadsReady;
    var drawTexture = (this.show && this.loaded && whiteTextureReady);
    if(drawTexture) if(this.alpha < 1.0) this.alpha += diff/500.0;
    if(!this.show) if(this.alpha > 0.0) this.alpha -= diff/500.0;
    if(this.alpha < 0) this.alpha = 0;
    if(this.alpha > 1) this.alpha = 1;
};

MusicPlanet.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 1.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

MusicPlanet.prototype.fireMouseClick = function(c){
    var ret = spaceMove([this.pos[0], this.pos[1], this.pos[2]]);
	if(ret == 1 && this.isPlaying == 0 && this.data != undefined){
        this.isPlaying = 1;

		this.audio = new Audio(this.audioSrc);
		this.audio.play();
		
		postProcess = true;
		postProcessObject = this;
		this.p = current;
    }
}

MusicPlanet.prototype.setPostProcessShader = function(){

		postProcessProgram = getMusicShader();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(postProcessProgram);
		
		var frame = Math.floor(this.audio.currentTime*62.5)+30;
		var d = this.data[3+frame*64];
		if(d<0)d=256+d;
		var displaceX = (d)/2500.0;
		//console.log(frame + " " + d + " "  + this.audio.currentTime );
		var displaceY = displaceX*width/height;
		var angle = (current/20%360)*Math.PI/180;
		
		var cropX = 0, cropY = 0;
		cropX = Math.max(cropX, Math.abs(Math.cos(angle)*displaceX));
		cropX = Math.max(cropX, Math.abs(Math.cos(angle+Math.PI*2/3)*displaceX));
		cropX = Math.max(cropX, Math.abs(Math.cos(angle+Math.PI*4/3)*displaceX));
		
		cropY = Math.max(cropY, Math.abs(Math.sin(angle)*displaceY));
		cropY = Math.max(cropY, Math.abs(Math.sin(angle+Math.PI*2/3)*displaceY));
		cropY = Math.max(cropY, Math.abs(Math.sin(angle+Math.PI*4/3)*displaceY));
		
		var bounds = [displaceX, 1-displaceX, displaceY, 1-displaceY];
		
		gl.uniform1f(postProcessProgram.angle, angle);
		gl.uniform1f(postProcessProgram.displaceX, displaceX);
		gl.uniform1f(postProcessProgram.displaceY, displaceY);
		gl.uniform4fv(postProcessProgram.bounds, bounds);
}