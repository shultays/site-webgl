
function ArcelikPlanet(src, pos, color){
	this.pos = pos;
    this.pos[3] = 1.0;
	this.color = color;

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

ArcelikPlanet.prototype.loadTexture = function(){
    this.loadStarted = true;
    var texture = gl.createTexture();
    this.texture = texture;
    var _this = this;
    texture.image = new Image();
    texture.image.onload = function() {
        handleLoadedTexture(texture);
        _this.shiftCenter = [0, 0];
        _this.scale = 1.0;
        _this.loaded = true;
    }
    texture.image.src = "scripts/space/textures/" + this.src;

}
ArcelikPlanet.prototype.draw = function(){
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
        
        
        var mid =  [0, 0, 0, 1.0];
        convert3DTo2D(this.pos, mid);
        
        var p3 = [this.pos[0]+sideVec[0],this.pos[1]+sideVec[1],this.pos[2]+sideVec[2], 1.0];
        var right =  [0, 0, 0, 1.0];
        convert3DTo2D(p3, right);
        var r = right[0] - mid[0];
        
        this.scale = r * 0.005
        
        if (this.scale > 0.0 && this.scale < 4.5){
           
            frontContext.save();
            frontContext.globalAlpha = this.alpha
            frontContext.translate(mid[0], mid[1]);
            
            
            frontContext.scale(r * 0.005, r * 0.005);
            
            this.hovering = ""
            
            var mx = mousex - gl.viewportWidth / 2
            var my = mousey - gl.viewportHeight / 2
            mx /= this.scale
            my /= this.scale
            
            
            frontContext.lineCap = 'round';
            frontContext.font = 'small-caps 14px Arial';
            frontContext.fillStyle = "#333333";
            frontContext.strokeStyle = "#BBAAAA";
            frontContext.lineWidth = 1.0;
            
            var x = -170
            var y = -50
            
            var text = "Arcelik Electronics"
            var width = frontContext.measureText(text).width;
            
            var t = frontContext.measureText(text)
            var quad = [x - 5, x + t.width + 5, y - 15, y + 5]
            var shift = t.width
            var c = "#333333"
            if (inBetween(mx, my, quad)){
                c = "#888888"
                this.hovering = "arcelik"
            }
            frontContext.fillStyle = c;
            frontContext.strokeText(text, x, y);
            frontContext.fillText(text, x, y);
            textUnderline(frontContext, text, x, y, "#DDDDDD", 17, 1.5)
            textUnderline(frontContext, text, x, y, c, 17)
            
            frontContext.fillStyle = "#333333";
            frontContext.strokeStyle = "#333333";
            var text = " (2012 - 2013)"
            frontContext.strokeText(text, x + shift, y);
            frontContext.fillText(text, x + shift, y);
            
            
            
            frontContext.font = '12px Arial';
            
            y += 15
            var text = "R&D Engineer"
            frontContext.strokeText(text, x, y);
            frontContext.fillText(text, x, y);
            
            
            frontContext.font = '10px Arial';
            
            y += 35
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "• Arcelik Electronics is a household appliances manufacturer from Turkey. It"
            frontContext.fillText(text, x, y);
            y += 12
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "engages in the production and marketing of durable goods, components, "
            frontContext.fillText(text, x, y);
            y += 12
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "consumer electronics and after-sale services. "
            frontContext.fillText(text, x, y);
             
            y += 25
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "• I worked on TV department of Arcelik Electronics and developed UIs for"
            frontContext.fillText(text, x, y);
            y += 12
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "for various Arcelik brand smart TVs and Set-Top boxes."
            frontContext.fillText(text, x, y);
            
            y += 25
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "• I also developed '"
            frontContext.fillText(text, x, y);
            var shift = frontContext.measureText(text).width
            
            var text ="Arcelik Smart Remote"
            var t = frontContext.measureText(text)
            var quad = [x + shift - 5, x + shift + t.width + 5, y - 15, y + 5]
            var c = "#333333"
            frontContext.strokeStyle = "#BBAAAA";
            if (inBetween(mx, my, quad)){
                c = "#888888"
                this.hovering = "arcelikandroid"
            }
            frontContext.fillStyle = c;
            frontContext.strokeText(text, x + shift, y);
            frontContext.fillText(text, x + shift, y);
            textUnderline(frontContext, text, x + shift, y, "#DDDDDD", 17, 1.5)
            textUnderline(frontContext, text, x + shift, y, c, 17)
            
            shift += t.width
            frontContext.fillStyle = "#333333";
            frontContext.strokeStyle = "#333333";
            var text = "', which is an Android application"
            frontContext.fillText(text, x + shift, y);
            y += 12
            x = - Math.sqrt(200*200 - y*y) + 15
            var text = "that can be used as a remote control for Arcelik brand TVs."
            frontContext.fillText(text, x, y);

            
            frontContext.restore()
            
            if (this.hovering != ""){
                frontCanvas.style.cursor = "pointer"
            }
        }
        
	    mat4.translate(mvMatrix, this.pos);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture);

	    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		
		gl.depthMask(false);
        drawCircleTextured(2,  this.color);
        gl.depthMask(true);

	    mat4.translate(mvMatrix, [sideVec[0]*this.shiftCenter[0], sideVec[1]*this.shiftCenter[0], sideVec[2]*this.shiftCenter[0]]);
	    mat4.translate(mvMatrix, [upVec[0]*this.shiftCenter[1], upVec[1]*this.shiftCenter[1], upVec[2]*this.shiftCenter[1]]);

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

ArcelikPlanet.prototype.tick = function(diff, t){
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

ArcelikPlanet.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 1.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

ArcelikPlanet.prototype.fireMouseClick = function(c){
    if (this.scale < 0.6 || this.scale > 4.0 || this.alpha < 1.0){
        spaceMove([this.pos[0], this.pos[1], this.pos[2]]);
    } else {
        if (this.hovering == "arcelik"){
            window.open("https://www.arcelik.com.tr")
        } else if (this.hovering == "arcelikandroid"){
            window.open("https://play.google.com/store/apps/details?id=arcelik.android.remote")
        }
    }
}
