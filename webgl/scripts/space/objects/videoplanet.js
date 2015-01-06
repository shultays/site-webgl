function VideoPlanet(link, pos, color, extensions){
	this.pos = pos;
    this.pos[3] = 1.0;
	this.color = color;
    this.alpha = 1;
    this.isPlaying = 0;
    this.link = link;
    this.playAlpha = 1;
	this.extensions = extensions;
	
	var ball = new InfoBall(this, color);
	guiList.push(ball);
}

VideoPlanet.prototype.draw = function(){
    var shader;

    shader = getStardustShader();
    if(gl.currentShader != shader){
        gl.currentShader = shader;
        gl.useProgram(shader);
		gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
		gl.uniform3fv(shader.eyePos, pos);
		gl.uniform3fv(shader.sideVec, sideVec);
		gl.uniform3fv(shader.upVec, upVec);
    }

    mvPushMatrix();
    
    if(this.alpha < 1){

        gl.depthMask(false);

        mat4.translate(mvMatrix, this.pos);

        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		
        this.color[3] = 1;
        drawCircle(2, this.color);

        gl.depthMask(true);
		
        mat4.scale(mvMatrix, [0.99, 0.99, 0.99]);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);

        var center = [0, 0, 0, 1.0];
        convert3DTo2D(this.pos, center);
        var p3 = [this.pos[0]+sideVec[0],this.pos[1]+sideVec[1],this.pos[2]+sideVec[2], 1.0];

        var right =  [0, 0, 0, 1.0];
        convert3DTo2D(p3, right);
        var d = right[0]-center[0];
        if(d>0){
            frontContext.save();
            frontContext.translate(center[0], center[1]);
            frontContext.scale(d, d);
            // Create gradient
            var grd=frontContext.createRadialGradient(0,0,0.99,0,0,0.97);
            grd.addColorStop(0,"rgba("+Math.floor(this.color[0]*255)+", "+Math.floor(this.color[1]*255)+", "+Math.floor(this.color[2]*255)+", 1.0)");
            grd.addColorStop(1,"rgba("+Math.floor(this.color[0]*255)+", "+Math.floor(this.color[1]*255)+", "+Math.floor(this.color[2]*255)+", 0.0)");

            // Fill with gradient
            frontContext.fillStyle=grd;
            frontContext.beginPath();
            frontContext.arc(0, 0, 1, 0, Math.PI*2, true); 
            frontContext.closePath();
            frontContext.fill();

            if(this.isPlaying){
                gl.blendFunc(gl.ZERO, gl.ZERO);
                drawCircle(2, [0, 0, 0, 0]);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }else{
                
                drawCircle(2, [0, 0, 0, 1-this.alpha]);
            }


            if(this.playAlpha > 0){
                frontContext.fillStyle="rgba("+Math.floor(this.color[0]*255)+", "+Math.floor(this.color[1]*255)+", "+Math.floor(this.color[2]*255)+", 1.0)";
                frontContext.beginPath();
                frontContext.moveTo(0.4, 0); 
                frontContext.lineTo(-0.2, 0.35355339059);
                frontContext.lineTo(-0.2, -0.35355339059);
                frontContext.closePath();
                frontContext.fill();
            }

            frontContext.restore();
        }
    }else{
        mat4.translate(mvMatrix, this.pos);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
        this.color[3] = this.alpha;
        drawCircle(2, [this.color[0], this.color[1], this.color[2], 1.0]);
    }
	mvPopMatrix();
 
};

VideoPlanet.prototype.tick = function(diff, t){
    if(moved || cameraChanged){
        this.distance = vec3.distance(this.pos, pos);
        this.show = this.distance < 40;

        if(this.isPlaying){
            document.getElementById("backstage").innerHTML = "";
            this.isPlaying = 0;
            this.playAlpha = 1;
        }
    }
    if(this.isPlaying){
        if(this.playAlpha>0) this.playAlpha -= diff/200.0;
        else this.playAlpha = 0;
    }
    if(this.show) if(this.alpha > 0.0) this.alpha -= diff/500.0;
    if(!this.show) if(this.alpha < 1.0) this.alpha += diff/500.0;
    if(this.alpha < 0) this.alpha = 0;
    if(this.alpha > 1) this.alpha = 1;
};

VideoPlanet.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 1.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

VideoPlanet.prototype.fireMouseClick = function(c){
    var ret = spaceMove([this.pos[0], this.pos[1], this.pos[2]], 2);
    if(ret == 1 && this.isPlaying == 0){
        this.isPlaying = 1;
		var content = "<video width='100%' height='100%' autoplay>";
			
		for(var i=0; i<this.extensions.length; i++){
            content += "<source src='../movies/"+this.link+"."+this.extensions[i][0]+"' type='video/"+this.extensions[i][1]+"'>";
		}
       //     "<source src='../movies/"+this.link+".mp4' type='video/mp4'>"+
        //    "<source src='../movies/"+this.link+".flv' type='video/flv'>"+
        //    "<source src='../movies/"+this.link+".ogv' type='video/ogg'>"+
            content += "</video>";
			
        document.getElementById("backstage").innerHTML = content;
    }
}
