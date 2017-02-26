
function PersonalPlanet(pos, color){
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

PersonalPlanet.prototype.loadTexture = function(){
    this.loadStarted = true;
    this.loaded = true;
    this.shiftCenter = [0, 0];
    var _this = this;

    var face = new Image();
    face.onload = function() {
        _this.face = face;
    };
    face.src = "scripts/space/textures/engin.png";
    
    var clip1 = new Image();
    clip1.onload = function() {
        _this.clip1 = clip1;
    };
    clip1.src = "scripts/space/textures/clip1.png";
    var clip2 = new Image();
    clip2.onload = function() {
        _this.clip2 = clip2;
    };
    clip2.src = "scripts/space/textures/clip2.png";
    
}

PersonalPlanet.prototype.draw = function(){
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
            
            if (this.face) {
                var w = 200 * 0.8;
                var h = 200 * 0.8;
                frontContext.drawImage(this.face, -w*0.5, -h*0.5 - 100, w, h)
            }
        
            this.hovering = ""
            
            var mx = mousex - gl.viewportWidth / 2
            var my = mousey - gl.viewportHeight / 2
            mx /= this.scale
            my /= this.scale
            
            frontContext.font = 'small-caps 24px Arial';
            frontContext.fillStyle = "#005555";
            
            var text = "Engin Mercan"
            var width = frontContext.measureText(text).width;
            frontContext.fillText(text, -width*0.5, 10);
            
            frontContext.font = '18px Arial';
            
            var text = "Game Developer"
            var width = frontContext.measureText(text).width;
            frontContext.fillText(text, -width*0.5, 30);
            
            this.hovering = ""
            
            frontContext.font = '17px Arial';
            var x = -70;
            var y = 70;
            
            var text = "Email : "
            var width = frontContext.measureText(text).width;
            frontContext.fillText(text, -width + x, y);
            
            var text = "mail@enginmercan.com"
            
            var t = frontContext.measureText(text)
            var quad = [x - 5, x + t.width + 2, y - 15, y + 5]

            if (inBetween(mx, my, quad)){
                this.hovering = "mail"
                frontContext.fillStyle = "#008888";
            }else{
                frontContext.fillStyle = "#005555";
            }
            frontContext.fillText(text, x, y);
            textUnderline(frontContext, text, x, y, frontContext.fillStyle, 17)
            
            
            if (this.clip1 && this.clip2) {
                var w = 20 * 0.8;
                var h = 20 * 0.8;
                var cx = quad[1] + 1
                var cy = y -h + 3
                if (inBetween(mx, my, [cx, cx+w, cy, cy+h])){
                    this.hovering = "clip"
                    frontContext.drawImage(this.clip2, cx, cy, w, h)
                }else{
                    frontContext.drawImage(this.clip1,  cx, cy, w, h)
                }
            }
            
            
            y = y + 23;
            frontContext.fillStyle = "#005555";
            
            var text = "GitHub : "
            var width = frontContext.measureText(text).width;
            frontContext.fillText(text, -width + x, y);
            
            var text = "https://github.com/shultays"
            
            var t = frontContext.measureText(text)
            var quad = [x - 5, x + t.width + 5, y - 15, y + 5]
            if (inBetween(mx, my, quad)){
                this.hovering = "github"
                frontContext.fillStyle = "#008888";
            }else{
                frontContext.fillStyle = "#005555";
            }
            frontContext.fillText(text, x, y);
            textUnderline(frontContext, text, x, y, frontContext.fillStyle, 17)
            
            y = y + 23;
            frontContext.fillStyle = "#005555";
            
            var text = "Blog : "
            var width = frontContext.measureText(text).width;
            frontContext.fillText(text, -width + x, y);
            
            var text = "https://enginmercan.com"
            
            var t = frontContext.measureText(text)
            var quad = [x - 5, x + t.width + 5, y - 15, y + 5]
            if (inBetween(mx, my, quad)){
                this.hovering = "blog"
                frontContext.fillStyle = "#008888";
            }else{
                frontContext.fillStyle = "#005555";
            }
            frontContext.fillText(text, x, y);
            textUnderline(frontContext, text, x, y, frontContext.fillStyle, 17)
            
            frontContext.restore();
            
            if (this.hovering != ""){
                frontCanvas.style.cursor = "pointer"
            }
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

PersonalPlanet.prototype.tick = function(diff, t){
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

PersonalPlanet.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 1.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

PersonalPlanet.prototype.fireMouseClick = function(c, mx, my){
    if (this.scale < 0.6 || this.scale > 3.0 || this.alpha < 1.0){
        spaceMove([this.pos[0], this.pos[1], this.pos[2]]);
    } else {
        if (this.hovering == "email"){
            window.open('mailto:mail@enginmercan.com');
        } else if (this.hovering == "github"){
            window.open('https://github.com/shultays/');
        } else if (this.hovering == "blog"){
            window.open('https://enginmercan.com/');
        } else if (this.hovering == "clip"){
            copyTextToClipboard("mail@enginmercan.com")
        }
    }
}
