
function EducationPlanet(pos, color){
	this.pos = pos;
    this.pos[3] = 1.0;
	this.color = color;

    this.alpha = 0;
    this.show = 0;
    this.loaded = false;
    this.loadStarted = false;
    this.oldLoadsReady = false;
    this.loadTexture();
	
	var ball = new InfoBall(this, color);
	guiList.push(ball);
	
}

EducationPlanet.prototype.loadTexture = function(){
    this.loadStarted = true;
    this.loaded = true;
    this.shiftCenter = [0, 0];
    var _this = this;
    
    
    var yeditepe = new Image();
    yeditepe.onload = function() {
        _this.yeditepe = yeditepe;
    };
    yeditepe.src = "scripts/space/textures/yeditepelogo.png";
    
    var nottingham = new Image();
    nottingham.onload = function() {
        _this.nottingham = nottingham;
    };
    nottingham.src = "scripts/space/textures/nottinghamlogo.png";
    
}

EducationPlanet.prototype.draw = function(){
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
            
            
            frontContext.font = 'small-caps 20px Arial';
            frontContext.fillStyle = "#443333";
            frontContext.strokeStyle = "#443333";
            
            var text = "Education"
            var width = frontContext.measureText(text).width;
            frontContext.fillText(text, -width*0.5, -150);
            
            var y = -105
            
            var x = -125
            
            if (this.yeditepe){
                var w = 50 * 0.8;
                var h = 50 * 0.8;
                frontContext.drawImage(this.yeditepe, -w*0.5 + x + 5, -h*0.5 + y + 2, w, h)
            }
            frontContext.font = 'small-caps 14px Arial';
            var text = "Yeditepe University (2010 - 2012)"
            frontContext.fillText(text, x + 30, y);
            var text = "Computer Science (Graduate)"
            frontContext.fillText(text, x + 30, y+16);
            
            frontContext.font = '12px Arial';
            var text = "• Full scholarship"
            frontContext.fillText(text, x, y+35);
            var text = "• Dropped in 2012"
            frontContext.fillText(text, x, y+51);
            var text = "• Final CGPA : 4.0"
            frontContext.fillText(text, x, y+67);
            
            y += 103
            
            frontContext.lineWidth= 0.5;
            frontContext.beginPath();
            
            frontContext.moveTo(x - 50 ,y - 25);
            frontContext.lineTo(-x + 50, y - 25);
            
            
            if (this.nottingham){
                var w = 50 * 0.8;
                var h = 50 * 0.8;
                frontContext.drawImage(this.nottingham, -w*0.5 + x + 5, -h*0.5 + y + 2, w, h)
            }
            frontContext.font = 'small-caps 14px Arial';
            var text = "University of Nottingham (2010)"
            frontContext.fillText(text, x + 30, y);
            var text = "Computer Science (Undergraduate)"
            frontContext.fillText(text, x + 30, y+16);
            
            frontContext.font = '12px Arial';
            var text = "• Erasmus program"
            frontContext.fillText(text, x, y+35);
            
            
            y += 73
            
            frontContext.moveTo(x - 45 ,y - 25);
            frontContext.lineTo(-x + 45, y - 25);
            frontContext.stroke();
            
            if (this.yeditepe){
                var w = 50 * 0.8;
                var h = 50 * 0.8;
                frontContext.drawImage(this.yeditepe, -w*0.5 + x + 5, -h*0.5 + y + 2, w, h)
            }
            frontContext.font = 'small-caps 14px Arial';
            var text = "Yeditepe University (2005 - 2010)"
            frontContext.fillText(text, x + 30, y);
            var text = "Computer Science (Undergraduate)"
            frontContext.fillText(text, x + 30, y+16);
            
            frontContext.font = '12px Arial';
            var text = "• Full scholarship"
            frontContext.fillText(text, x, y+35);
            var text = "• Graduated as second in class"
            frontContext.fillText(text, x, y+51);
            var text = "• Graduation CGPA : 3.62"
            frontContext.fillText(text, x, y+67);
            
            frontContext.restore();
        }
    }

    var shader = getStardustShader();
    if(gl.currentShader != shader){
        gl.currentShader = shader;
        gl.useProgram(shader);
		gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
		gl.uniform3fv(shader.eyePos, pos);
		gl.uniform3fv(shader.sideVec, sideVec);
		gl.uniform3fv(shader.upVec, upVec);
    }
    mvPushMatrix();
    mat4.translate(mvMatrix, this.pos);
    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
    drawCircle(2, this.color);
	mvPopMatrix();
};

EducationPlanet.prototype.tick = function(diff, t){
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

EducationPlanet.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 1.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

EducationPlanet.prototype.fireMouseClick = function(c, mx, my){
    if (this.scale < 0.6 || this.scale > 3.0 || this.alpha < 1.0){
        spaceMove([this.pos[0], this.pos[1], this.pos[2]]);
    } else {

    
    }
}
