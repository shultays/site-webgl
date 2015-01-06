
var spaceCount = 10;
var starPerSpace = 350;
var spaceSize = 500;
var closeList = new Array();

var lastPos = [0, 0, 0];

function getTreePos(x, y, z){
    var r = [Math.floor(x/spaceSize), Math.floor(y/spaceSize), Math.floor(z/spaceSize)];

    return r;
}


function StarDust(gl){
    this.gl = gl;

    this.shader = getStardustShader();

	this.onMove = false;
	
    initSpace();
}

function initSpace(){
    var p = 13;

    this.spaceBuffers = new Array();
    this.spacePoints = new Array();

    Math.seedrandom("seed");
    for(var i=0; i<spaceCount; i++){
        spaceBuffers[i] = gl.createBuffer();
        spacePoints[i] = new Array();
        gl.bindBuffer(gl.ARRAY_BUFFER, spaceBuffers[i]);

        var vertices = new Float32Array(starPerSpace*p*9*3);

        var t = 0;
        for(var z=0; z<starPerSpace; z++){
			spacePoints[i][z] = new Object();
            var sx = Math.random()*spaceSize;
            var sy = Math.random()*spaceSize;
            var sz = Math.random()*spaceSize;
            spacePoints[i][z].pos = [sx, sy, sz];
            spacePoints[i][z].color = [Math.random()*0.2+0.8, Math.random()*0.2+0.8, Math.random()*0.2+0.8];
			spacePoints[i][z].scale = Math.random()*1.0+0.2;
            for(var k=0; k<p; k++){
                
                vertices[t+0] = sx;
                vertices[t+1] = sy;
                vertices[t+2] = sz;
                
                vertices[t+3] = 0;
                vertices[t+4] = 0;
				vertices[t+5] = spacePoints[i][z].color[0];
				vertices[t+6] = spacePoints[i][z].color[1];
				vertices[t+7] = spacePoints[i][z].color[2];
				vertices[t+8] = 1.0;
				t+=9;
                vertices[t+0] = sx;
                vertices[t+1] = sy;
                vertices[t+2] = sz;
                
                vertices[t+3] = Math.cos(Math.PI*2*k/(p-1))*spacePoints[i][z].scale;
                vertices[t+4] = Math.sin(Math.PI*2*k/(p-1))*spacePoints[i][z].scale;
				vertices[t+5] = spacePoints[i][z].color[0];
				vertices[t+6] = spacePoints[i][z].color[1];
				vertices[t+7] = spacePoints[i][z].color[2];
				vertices[t+8] = 1.0;
				t+=9;
                vertices[t+0] = sx;
                vertices[t+1] = sy;
                vertices[t+2] = sz;
                
                vertices[t+3] = Math.cos(Math.PI*2*(k+1)/(p-1))*spacePoints[i][z].scale;
                vertices[t+4] = Math.sin(Math.PI*2*(k+1)/(p-1))*spacePoints[i][z].scale;
				vertices[t+5] = spacePoints[i][z].color[0];
				vertices[t+6] = spacePoints[i][z].color[1];
				vertices[t+7] = spacePoints[i][z].color[2];
				vertices[t+8] = 1.0;
				t+=9;
            }
        }


        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        spaceBuffers[i].itemSize = 9;
        spaceBuffers[i].numItems = starPerSpace*p*3;
    }
}

    

StarDust.prototype.draw = function()
{
    var shader = this.shader;
    if(gl.currentShader != shader){
        gl.currentShader = shader;
        gl.useProgram(shader);
    }

    gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
    gl.uniform3fv(shader.eyePos, pos);
    gl.uniform3fv(shader.sideVec, sideVec);
    gl.uniform3fv(shader.upVec, upVec);
    gl.uniform1f(shader.starScale, 1.0);
	
    gl.uniform4fv(shader.color, [1.0, 1.0, 1.0, 1.0]);

    var p = getTreePos(pos[0], pos[1], pos[2]);
    var len = 2;
    for(var i=p[0]-len; i<=p[0]+len; i++){
        for(var j=p[1]-len; j<=p[1]+len; j++){
            for(var k=p[2]-len; k<=p[2]+len; k++){
                
                var z = i + j*100 + k*100*100;
                Math.seedrandom("seed"+z);
                var t = Math.random()*spaceCount;
                t = Math.floor(t);
                
                var x = spaceSize*i;
                var y = spaceSize*j;
                var z = spaceSize*k;
                
                mvPushMatrix();
                mat4.translate(mvMatrix, [x, y, z]);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, spaceBuffers[t]);
                gl.vertexAttribPointer(gl.currentShader.vertexPositionAttribute, 3, gl.FLOAT, false, 9*4, 0);
                
                gl.vertexAttribPointer(gl.currentShader.vShift, 1, gl.FLOAT, false, 9*4, 3*4);
                gl.vertexAttribPointer(gl.currentShader.hShift, 1, gl.FLOAT, false, 9*4, 4*4);
                gl.vertexAttribPointer(gl.currentShader.vColor, 4, gl.FLOAT, false, 9*4, 5*4);
                        
                gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

                gl.drawArrays(gl.TRIANGLES, 0, spaceBuffers[t].numItems);
            
                mvPopMatrix();

            }
        }
    }
	
	
    for(var i=0; i<closeList.length; i++){
		mvPushMatrix();
		mat4.translate(mvMatrix, closeList[i]);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
		drawCircle(2, [closeList[i][3][0], closeList[i][3][1], closeList[i][3][2], 1.0], closeList[i][4]);
		mvPopMatrix();
    }
	
	if(this.isPlaying){
		var alpha = (lastTick-this.isPlayingStart)/1000.0;
		if(alpha>1.0) alpha = 1.0;
        mvPushMatrix();
        mat4.translate(mvMatrix, this.movePos);
        gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
        gl.disable(gl.DEPTH_TEST);
		gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
		drawCircle(2, [this.moveColor[0], this.moveColor[1], this.moveColor[2], 1.0-alpha], this.moveScale);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);

        mvPopMatrix();
	
	}
};

StarDust.prototype.tick = function(diff, t){

	if(moved || cameraChanged){
		if(this.isPlaying){
			this.isPlaying = false;
			document.getElementById("backstage").innerHTML ="";
		}
	}
    if(moved){
        var p = getTreePos(pos[0], pos[1], pos[2]);
        
        closeList = [];
        for(var i=p[0]-1; i<=p[0]+1; i++){
            for(var j=p[1]-1; j<=p[1]+1; j++){
                for(var k=p[2]-1; k<=p[2]+1; k++){
                    
                    var z = i + j*100 + k*100*100;
                    Math.seedrandom("seed"+z);
                    var t = Math.random()*spaceCount;
                    t = Math.floor(t);
                    var x = spaceSize*i;
                    var y = spaceSize*j;
                    var z = spaceSize*k;
                    for(var a=0; a<starPerSpace; a++){
                        var cx = spacePoints[t][a].pos[0]+x - pos[0];
                        var cy = spacePoints[t][a].pos[1]+y - pos[1];
                        var cz = spacePoints[t][a].pos[2]+z - pos[2];
                        var d = cx*cx + cy*cy + cz*cz;
                        if(d<10000){
                            closeList.push([spacePoints[t][a].pos[0]+x, spacePoints[t][a].pos[1]+y , spacePoints[t][a].pos[2]+z, spacePoints[t][a].color, spacePoints[t][a].scale]);
                        }
                    }
                }
            }
        }
    }else{
		var _this = this;
		if(this.onMove){
			$.get( "./test.php", function(data){
				_this.isPlaying = true;
				_this.isPlayingStart = lastTick;
				//data = "<br>4.2 BSD UNIX #57: Sun Jun 1 23:02:07 EDT 1986<br><br>You swing at the Sun.  You miss.  The Sun swings.  He hits you with a<br>575MB disk!  You read the 575MB disk.  It is written in an alien<br>tongue and cannot be read by your tired Sun-2 eyes.  You throw the<br>575MB disk at the Sun.  You hit!  The Sun must repair your eyes.  The<br>Sun reads a scroll.  He hits your 130MB disk!  He has defeated the<br>130MB disk!  The Sun reads a scroll.  He hits your Ethernet board!  He<br>has defeated your Ethernet board!  You read a scroll of 'postpone until<br>Monday at 9 AM'.  Everything goes dark...<br>		-- /etc/motd, cbosgd<br>";;
				document.getElementById("backstage").innerHTML = "<table style='width:100%;height:100%;background-color:rgb("+Math.round(_this.moveColor[0]*255)+","+Math.round(_this.moveColor[1]*255)+","+Math.round(_this.moveColor[2]*255)+")'>  <tr>   <td valign='middle'><p style='font-size:14px;text-align:center'>"+data+"</p></td>  </tr></table>";
			});
		}
		this.onMove = false;
	}
};

StarDust.prototype.findClosest = function(mat, mx, my){

    
    var p = getTreePos(pos[0], pos[1], pos[2]);

    var l = 1;
    var closest;
    var closestDist = 1000000000;
    
    for(var i=p[0]-l; i<=p[0]+l; i++){
        for(var j=p[1]-l; j<=p[1]+l; j++){
            for(var k=p[2]-l; k<=p[2]+l; k++){
                
                var z = i + j*100 + k*100*100;
                Math.seedrandom("seed"+z);
                var t = Math.random()*spaceCount;
                t = Math.floor(t);
                var x = spaceSize*i;
                var y = spaceSize*j;
                var z = spaceSize*k;
                for(var a=0; a<starPerSpace; a++){
                
                    var cx = spacePoints[t][a].pos[0]+x;
                    var cy = spacePoints[t][a].pos[1]+y;
                    var cz = spacePoints[t][a].pos[2]+z;
                    
                    var p1 = [cx, cy, cz, 1.0];
                    var center = [0, 0, 0];
                    convert3DTo2D(p1, center);
                    if(center[3] <= 0 || center[3] > 1000) continue;
          
                    var p3 = [cx+sideVec[0]*spacePoints[t][a].scale,cy+sideVec[1]*spacePoints[t][a].scale,cz+sideVec[2]*spacePoints[t][a].scale, 1.0];
                    var right = [0, 0, 0];
                    
                    convert3DTo2D(p3, right);

                    var diff = [center[0]-right[0], center[1]-right[1]];
                    var diff2 = [center[0]-mx, center[1]-my];
                    var len = (diff[0]*diff[0]+diff[1]*diff[1]);
                    var len2 = (diff2[0]*diff2[0]+diff2[1]*diff2[1]);
                    if(len>len2){
                        var dist = vec3.length([cx-pos[0], cy-pos[1], cz-pos[2]]);
                        if(closestDist > dist){
                            closest = [cx, cy, cz, spacePoints[t][a].color, spacePoints[t][a].scale];
                            closestDist = dist;
                        }
                    }
                }
            }
        }
    }
    return closest;

}
StarDust.prototype.isMouseInside = function(mat, x, y){
    var closest = this.findClosest(mat, x, y);
    if(closest) return closest;
    return false;
}

StarDust.prototype.fireMouseClick = function(c){
	this.onMove = true;
	this.moveScale = c[4];
	this.moveColor = c[3];
	this.movePos = c;
    spaceMove(c,3*this.moveScale);
}
