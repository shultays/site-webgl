
function Model(gl, name, pos, scale){
    this.gl = gl;
	this.scale = scale;
    var shader = createShader(gl, "scripts/space/shaders/model.vs", "scripts/space/shaders/model.fs");
	
	this.shader = shader;
	this.pos = pos;
	this.pos[3] = 1.0;
    shader.vertexPositionAttribute = gl.getAttribLocation(shader, "aVertexPosition");
    gl.enableVertexAttribArray(shader.vertexPositionAttribute);
    shader.vertexNormalAttribute = gl.getAttribLocation(shader, "aVertexNormal");
    gl.enableVertexAttribArray(shader.vertexNormalAttribute);

    shader.pMatrixUniform = gl.getUniformLocation(shader, "uPMatrix");
    shader.mvMatrixUniform = gl.getUniformLocation(shader, "uMVMatrix");
    shader.nMatrixUniform = gl.getUniformLocation(shader, "uNMatrix");
    
    shader.color = gl.getUniformLocation(shader, "color");
	
	
	this.isReady = 3;
	var mRequest = new XMLHttpRequest();
	mRequest.open('GET', "scripts/space/models/"+name+".vertex.b");
	mRequest.responseType = 'arraybuffer';
	var _this = this;
	
	mRequest.onreadystatechange = function () {
		if (mRequest.readyState === 4) {
			var buffer = mRequest.response;
			var dataview = new DataView(buffer);
			_this.vertexBufferData = new Float32Array(buffer.byteLength / 4);

			for (var i = 0; i < _this.vertexBufferData.length; i++) 
			{
				_this.vertexBufferData[i] = dataview.getFloat32(i * 4, true);
			}
			_this.isReady--;
			if(_this.isReady == 1){
				_this.build();
			}
		}
	};

	//mRequest.send();

	var mRequest2 = new XMLHttpRequest();
	mRequest2.open('GET', "scripts/space/models/"+name+".index.b");
	mRequest2.responseType = 'arraybuffer';

	mRequest2.onreadystatechange = function () {
		if (mRequest2.readyState === 4) {
			var buffer = mRequest2.response;
			var dataview = new DataView(buffer);
			_this.indexBufferData = new Uint16Array(buffer.byteLength / 2);

			for (var i = 0; i < _this.indexBufferData.length; i++) 
			{
				_this.indexBufferData[i] = dataview.getInt16(i * 2, true);
			}
			_this.isReady--;
			
			if(_this.isReady == 1){
				_this.build();
			}
		}
	};

	mRequest2.send();


	var mRequest3 = new XMLHttpRequest();
	mRequest3.open('GET', "scripts/space/models/out.b");
	mRequest3.responseType = 'arraybuffer';

	mRequest3.onreadystatechange = function () {
		if (mRequest3.readyState === 4) {
            var buffer = mRequest3.response;
			var dataview = new DataView(buffer);
			_this.vertexBufferData = new Float32Array(buffer.byteLength / 4);

			
			for (var i = 0; i < _this.vertexBufferData.length; i++) 
			{
				_this.vertexBufferData[i] = dataview.getFloat32(i * 4, true);
			}
			_this.isReady--;
			if(_this.isReady == 1){
				_this.build();
			}

		}
	};

	mRequest3.send();
}

Model.prototype.build = function()
{
        this.vertexBuffer = gl.createBuffer();
		
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, this.vertexBufferData, gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 6;
        this.vertexBuffer.numItems = this.vertexBufferData.length;
		
		
        this.indexBuffer = gl.createBuffer();
		
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferData, gl.STATIC_DRAW);
        this.indexBuffer.itemSize = 1;
        this.indexBuffer.numItems = this.indexBufferData.length;
		this.isReady--;
		
};
Model.prototype.draw = function()
{
	if(this.isReady > 0) return;
	

    var shader = this.shader;
	if(gl.currentShader != shader){
        gl.currentShader = shader;
        gl.useProgram(shader);
	    gl.uniformMatrix4fv(gl.currentShader.pMatrixUniform, false, pMatrix);
    }
    var model = mat4.create();
    mat4.identity(model);
	mat4.translate(model, this.pos);
    mat4.scale(model, [this.scale, this.scale, this.scale]);
    mat4.rotate(model, lastTick/1000, [1, 0, 0]);
    

	mvPushMatrix();
    mat4.multiply(mvMatrix, model, mvMatrix);
    gl.uniformMatrix4fv(gl.currentShader.mvMatrixUniform, false, mvMatrix);
    mvPopMatrix();

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(model, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(gl.currentShader.nMatrixUniform, false, normalMatrix);

	gl.uniform3fv(shader.eyePos, pos);
    
    gl.uniform4fv(shader.color, [1.0, 1.0, 0.0, 1.0]);
	

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(gl.currentShader.vertexPositionAttribute, 3, gl.FLOAT, false, 6*4, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(gl.currentShader.vertexNormalAttribute, 3, gl.FLOAT, false, 6*4, 3*4);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

};

Model.prototype.tick = function(diff, t){
  
};

Model.prototype.isMouseInside = function(mat, x, y){
    if(testFor3DSphereClick(this.pos, 10.0, x, y)){
        return [this.pos[0], this.pos[1], this.pos[2]];
    }else{
        return false;
    }
}

Model.prototype.fireMouseClick = function(c){
    spaceMove(c, 20);
}
