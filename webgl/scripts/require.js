var gl;
var c;
var frontCanvas;
var frontContext;


var worldViewProjectionMatrix = mat4.create();
var m1 = mat4.create();
var m2 = mat4.create();
var m3 = mat4.create();

var v1 = quat4.create();
var v2 = quat4.create();
var v3 = quat4.create();


var seq = 0;

var lastTick;
var moved = true;
var cameraChanged = true;

var pos = [61.341976165771484,4.880792617797852,-106.45082092285156];
var lastPos = [61.341976165771484,4.880792617797852,-106.45082092285156];

var eyeVec = [-0.44190425720467824,0.03659638023315812,0.8963154201609004];
var upVec = [-0.17285947231352097,0.9768861626410354,-0.12574986310912514];
var sideVec = [-0.8802001211215785,-0.210506010406313,-0.4253641230997266];

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var mvMatrixStack = [];

var circleBuffers = new Array();
var circleBuffersTextured = new Array();
var orbitBuffer;
var circleShader;
var rectangleBuffer;
var stardustShader;
var texturedStardustshader;

var whiteTexture;
var whiteTextureReady;

var pov = 45.0;

function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,
        success: function () {
            // all good...
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}

function loadString(path){
    var r;
    $.ajax({
        url: path,
        dataType: "text",
        async: false,
        success: function (data) {
            r = data;
        },
        error: function () {
            throw new Error("Could not load script " );
        }
    });
    return r;
}

var loadedShaders = new Array();
function createShader(gl, vs, fs){
    var n = vs + ":" + fs;
    if(loadedShaders[n]) return loadedShaders[n];
    var fragmentShader = getShader(gl, vs);
    var vertexShader = getShader(gl, fs);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    shaderProgram.fs = fragmentShader;
    shaderProgram.vs = vertexShader;

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    loadedShaders[n] = shaderProgram;
    return shaderProgram;

}

function getShader(gl, path) {
    var type = path.substr(path.length-2);
    var shader;
    if (type == "fs") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vs") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    var code = loadString(path);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("error compiling " + path + " : " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function initTools(){

    circleShader = createShader(gl, "scripts/space/shaders/stardust.vs", "scripts/space/shaders/stardust.fs");


    whiteTexture = gl.createTexture();

    whiteTexture.image = new Image();
    whiteTexture.image.onload = function() {
        handleLoadedTexture(whiteTexture);
        whiteTextureReady = true;
    }
    whiteTexture.image.src = "scripts/space/textures/white.png";

    initBuffers();
}

function initBuffers() {
    var ps = new Array(6, 20, 50);
    for(var i=0; i<3; i++){

        var p = ps[i];
        circleBuffers[i] = gl.createBuffer();
   
        gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffers[i]);

        var vertices = new Float32Array(p*9*3);

        var t = 0;
    
        var sx = 0;
        var sy = 0;
        var sz = 0;
        
        for(var k=0; k<p; k++){
            
            vertices[t+0] = sx;
            vertices[t+1] = sy;
            vertices[t+2] = sz;
            
            vertices[t+3] = 0;
            vertices[t+4] = 0;
			
            vertices[t+5] = vertices[t+6] = vertices[t+7] = vertices[t+8] = 1.0;
            t+=9;
			
            vertices[t+0] = sx;
            vertices[t+1] = sy;
            vertices[t+2] = sz;
            
            vertices[t+3] = Math.cos(Math.PI*2*k/(p));
            vertices[t+4] = Math.sin(Math.PI*2*k/(p));
			
            vertices[t+5] = vertices[t+6] = vertices[t+7] = vertices[t+8] = 1.0;
            t+=9;
			
            vertices[t+0] = sx;
            vertices[t+1] = sy;
            vertices[t+2] = sz;
            
            vertices[t+3] = Math.cos(Math.PI*2*(k+1)/(p));
            vertices[t+4] = Math.sin(Math.PI*2*(k+1)/(p));
            vertices[t+5] = vertices[t+6] = vertices[t+7] = vertices[t+8] = 1.0;
            t+=9;
        }


        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        circleBuffers[i].itemSize = 3;
        circleBuffers[i].numItems = p*3;
    }

	for(var i=0; i<3; i++){

        var p = ps[i];
        circleBuffersTextured[i] = gl.createBuffer();
   
        gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffersTextured[i]);

        var vertices = new Float32Array(p*11*3);

        var t = 0;
    
        var sx = 0;
        var sy = 0;
        var sz = 0;
        
        for(var k=0; k<p; k++){
            
            vertices[t+0] = sx;
            vertices[t+1] = sy;
            vertices[t+2] = sz;
            
            vertices[t+3] = 0;
            vertices[t+4] = 0;

            vertices[t+5] = 0.5;
            vertices[t+6] = 0.5;
			
            vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
            t+=11;
			
            vertices[t+0] = sx;
            vertices[t+1] = sy;
            vertices[t+2] = sz;
            
            vertices[t+3] = Math.cos(Math.PI*2*k/(p));
            vertices[t+4] = Math.sin(Math.PI*2*k/(p));
			
            vertices[t+5] = 0.5+vertices[t+3]*0.5;
            vertices[t+6] = 0.5+vertices[t+4]*0.5;
			
            vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
            t+=11;
			
            vertices[t+0] = sx;
            vertices[t+1] = sy;
            vertices[t+2] = sz;
            
            vertices[t+3] = Math.cos(Math.PI*2*(k+1)/(p));
            vertices[t+4] = Math.sin(Math.PI*2*(k+1)/(p));
            vertices[t+5] = 0.5+vertices[t+3]*0.5;
            vertices[t+6] = 0.5+vertices[t+4]*0.5;
            vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
            t+=11;
        }


        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        circleBuffersTextured[i].itemSize = 3;
        circleBuffersTextured[i].numItems = p*3;
    }

	
	
	
    rectangleBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);

    var vertices = new Float32Array(6*11);

    var t = 0;
    var len = 1;

    vertices[t+0] = 0;
    vertices[t+1] = 0;
    vertices[t+2] = 0;
    
    vertices[t+3] = -len;
    vertices[t+4] = -len;
    vertices[t+5] = 0;
    vertices[t+6] = 0;
	vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
	t+=11;

    vertices[t+0] = 0;
    vertices[t+1] = 0;
    vertices[t+2] = 0;
    
    vertices[t+3] = +len;
    vertices[t+4] = -len;
    vertices[t+5] = 0;
    vertices[t+6] = 1;
	vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
	t+=11;

    vertices[t+0] = 0;
    vertices[t+1] = 0;
    vertices[t+2] = 0;
    
    vertices[t+3] = +len;
    vertices[t+4] = +len;
    vertices[t+5] = 1;
    vertices[t+6] = 1;
	vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
	t+=11;



    vertices[t+0] = 0;
    vertices[t+1] = 0;
    vertices[t+2] = 0;
    
    vertices[t+3] = +len;
    vertices[t+4] = +len;
    vertices[t+5] = 1;
    vertices[t+6] = 1;
	vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
	t+=11;

    vertices[t+0] = 0;
    vertices[t+1] = 0;
    vertices[t+2] = 0;
    
    vertices[t+3] = -len;
    vertices[t+4] = +len;
    vertices[t+5] = 1;
    vertices[t+6] = 0;
	vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
	t+=11;

    vertices[t+0] = 0;
    vertices[t+1] = 0;
    vertices[t+2] = 0;
    
    vertices[t+3] = -len;
    vertices[t+4] = -len;
    vertices[t+5] = 0;
    vertices[t+6] = 0;
	vertices[t+7] = vertices[t+8] = vertices[t+9] = vertices[t+10] = 1.0;
	t+=11;


    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    rectangleBuffer.itemSize = 3;
    rectangleBuffer.numItems = 6;
	
    orbitBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, orbitBuffer);
	
	t = 0;
	p = 100;
    vertices = new Float32Array(p*9);
	for(var k=0; k<p; k++){
		
		vertices[t+0] = 0;
		vertices[t+1] = 0;
		vertices[t+2] = 0;
		
        vertices[t+3] = Math.cos(Math.PI*2*(k+1)/(p));
        vertices[t+4] = Math.sin(Math.PI*2*(k+1)/(p));
		
		vertices[t+5] = vertices[t+6] = vertices[t+7] = vertices[t+8] = 1.0;
		
		t += 9;
	}
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	orbitBuffer.itemSize = 1;
	orbitBuffer.numItems = p;
	
}

function drawRectangle(i, circleColor){
    gl.uniform4fv(gl.currentShader.color, circleColor);

    gl.uniformMatrix4fv(gl.currentShader.mvMatrixUniform, false, mvMatrix)

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
    gl.vertexAttribPointer(gl.currentShader.vertexPositionAttribute, rectangleBuffer.itemSize, gl.FLOAT, false, 11*4, 0);
    gl.vertexAttribPointer(gl.currentShader.vShift, 1, gl.FLOAT, false, 11*4, 3*4);
    gl.vertexAttribPointer(gl.currentShader.hShift, 1, gl.FLOAT, false, 11*4, 4*4);
    gl.vertexAttribPointer(gl.currentShader.vColor, 4, gl.FLOAT, false, 11*4, 7*4);

    gl.vertexAttribPointer(gl.currentShader.textureCoordAttribute, 2, gl.FLOAT, false, 11*4, 5*4);


    gl.drawArrays(gl.TRIANGLES, 0, rectangleBuffer.numItems);
}

function drawCircleTextured(i, circleColor){
    gl.uniform4fv(gl.currentShader.color, circleColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffersTextured[i]);
    gl.vertexAttribPointer(gl.currentShader.vertexPositionAttribute, rectangleBuffer.itemSize, gl.FLOAT, false, 11*4, 0);
    gl.vertexAttribPointer(gl.currentShader.vShift, 1, gl.FLOAT, false, 11*4, 3*4);
    gl.vertexAttribPointer(gl.currentShader.hShift, 1, gl.FLOAT, false, 11*4, 4*4);
    gl.vertexAttribPointer(gl.currentShader.vColor, 4, gl.FLOAT, false, 11*4, 7*4);

    gl.vertexAttribPointer(gl.currentShader.textureCoordAttribute, 2, gl.FLOAT, false, 11*4, 5*4);

    gl.drawArrays(gl.TRIANGLES, 0, circleBuffersTextured[i].numItems);
}
function drawCircle(i, circleColor, starScale){
	if(!starScale) starScale = 1.0;
    gl.uniform4fv(gl.currentShader.color, circleColor);
    gl.uniform1f(gl.currentShader.starScale, starScale);

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffers[i]);
    gl.vertexAttribPointer(gl.currentShader.vertexPositionAttribute, circleBuffers[i].itemSize, gl.FLOAT, false, 9*4, 0);
    gl.vertexAttribPointer(gl.currentShader.vShift, 1, gl.FLOAT, false, 9*4, 3*4);
    gl.vertexAttribPointer(gl.currentShader.hShift, 1, gl.FLOAT, false, 9*4, 4*4);
    gl.vertexAttribPointer(gl.currentShader.vColor, 4, gl.FLOAT, false, 9*4, 5*4);

    gl.drawArrays(gl.TRIANGLES, 0, circleBuffers[i].numItems);
}

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}



function getStardustShader(){


    if(stardustShader) return stardustShader;
    stardustShader = createShader(gl, "scripts/space/shaders/stardust.vs", "scripts/space/shaders/stardust.fs");


    stardustShader.vertexPositionAttribute = gl.getAttribLocation(stardustShader, "aVertexPosition");
    
    stardustShader.vShift = gl.getAttribLocation(stardustShader, "vShift");
    stardustShader.hShift = gl.getAttribLocation(stardustShader, "hShift");
    stardustShader.vColor = gl.getAttribLocation(stardustShader, "vColor");
    
    gl.enableVertexAttribArray(stardustShader.vertexPositionAttribute);
    gl.enableVertexAttribArray(stardustShader.vShift);
    gl.enableVertexAttribArray(stardustShader.hShift);
    gl.enableVertexAttribArray(stardustShader.vColor);

    stardustShader.pMatrixUniform = gl.getUniformLocation(stardustShader, "uPMatrix");
    stardustShader.mvMatrixUniform = gl.getUniformLocation(stardustShader, "uMVMatrix");
    
    stardustShader.eyePos = gl.getUniformLocation(stardustShader, "eyePos");
    stardustShader.sideVec = gl.getUniformLocation(stardustShader, "sideVec");
    stardustShader.upVec = gl.getUniformLocation(stardustShader, "upVec");
    stardustShader.color = gl.getUniformLocation(stardustShader, "color");
    stardustShader.starScale = gl.getUniformLocation(stardustShader, "starScale");

    return stardustShader;
}

function getTexturedStardustShader(){


    if(texturedStardustshader) return texturedStardustshader;
    texturedStardustshader = createShader(gl, "scripts/space/shaders/texturestardust.vs", "scripts/space/shaders/texturestardust.fs");


    texturedStardustshader.vertexPositionAttribute = gl.getAttribLocation(texturedStardustshader, "aVertexPosition");
    
    texturedStardustshader.vShift = gl.getAttribLocation(texturedStardustshader, "vShift");
    texturedStardustshader.hShift = gl.getAttribLocation(texturedStardustshader, "hShift");
    texturedStardustshader.vColor = gl.getAttribLocation(texturedStardustshader, "vColor");
    texturedStardustshader.textureCoordAttribute = gl.getAttribLocation(texturedStardustshader, "aTextureCoord");

    gl.enableVertexAttribArray(texturedStardustshader.vertexPositionAttribute);
    gl.enableVertexAttribArray(texturedStardustshader.vShift);
    gl.enableVertexAttribArray(texturedStardustshader.hShift);
    gl.enableVertexAttribArray(texturedStardustshader.vColor);
    gl.enableVertexAttribArray(texturedStardustshader.textureCoordAttribute);

    texturedStardustshader.pMatrixUniform = gl.getUniformLocation(texturedStardustshader, "uPMatrix");
    texturedStardustshader.mvMatrixUniform = gl.getUniformLocation(texturedStardustshader, "uMVMatrix");
    
    texturedStardustshader.eyePos = gl.getUniformLocation(texturedStardustshader, "eyePos");
    texturedStardustshader.sideVec = gl.getUniformLocation(texturedStardustshader, "sideVec");
    texturedStardustshader.upVec = gl.getUniformLocation(texturedStardustshader, "upVec");
    texturedStardustshader.color = gl.getUniformLocation(texturedStardustshader, "color");

    return texturedStardustshader;
}

var musicShader;
function getMusicShader(){

    if(musicShader) return musicShader;
    musicShader = createShader(gl, "scripts/space/shaders/musicShader.vs", "scripts/space/shaders/musicShader.fs");
    
    musicShader.vertexPositionAttribute = gl.getAttribLocation(musicShader, "aVertexPosition");
    gl.enableVertexAttribArray(musicShader.vertexPositionAttribute);
    
    musicShader.vertexUVAttribute = gl.getAttribLocation(musicShader, "aVertexUV");
    gl.enableVertexAttribArray(musicShader.vertexUVAttribute);
    
    musicShader.bounds = gl.getUniformLocation(musicShader, "bounds");
    musicShader.displaceX = gl.getUniformLocation(musicShader, "displaceX");
    musicShader.displaceY = gl.getUniformLocation(musicShader, "displaceY");
    musicShader.angle = gl.getUniformLocation(musicShader, "angle");
	
    
	return musicShader;
}

var tvShader;
function getTVShader(){

    if(tvShader) return tvShader;
    tvShader = createShader(gl, "scripts/space/shaders/tvShader.vs", "scripts/space/shaders/tvShader.fs");
    
    tvShader.vertexPositionAttribute = gl.getAttribLocation(tvShader, "aVertexPosition");
    gl.enableVertexAttribArray(tvShader.vertexPositionAttribute);
    
    tvShader.vertexUVAttribute = gl.getAttribLocation(tvShader, "aVertexUV");
    gl.enableVertexAttribArray(tvShader.vertexUVAttribute);
    
    tvShader.time = gl.getUniformLocation(tvShader, "time");
    tvShader.rand1x = gl.getUniformLocation(tvShader, "rand1x");
    tvShader.rand2x = gl.getUniformLocation(tvShader, "rand2x");
    tvShader.rand1y = gl.getUniformLocation(tvShader, "rand1y");
    tvShader.rand2y = gl.getUniformLocation(tvShader, "rand2y");
	
    
	return tvShader;
}

var worldViewProjectionMatrixSeq = -1;


function getWorldViewProjectionMatrix(){
    if(worldViewProjectionMatrixSeq != seq){
        getWorldViewMapSeq = seq;
    
		mat4.perspective(pov,  gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, m1);

		mat4.lookAt(pos, vec3.addt(eyeVec, pos), upVec, m2);

		mat4.multiply(m1, m2, worldViewProjectionMatrix);

    }
    return worldViewProjectionMatrix;
}

function convert3DTo2D(pos, ret){

    if(ret == undefined) ret = [0, 0, 0];

    mat4.multiplyVec4(getWorldViewProjectionMatrix(), pos, v2);
    
    v2[0]/=v2[3];
    v2[1]/=v2[3];
    v2[2]/=v2[3];

    v2[0] = (v2[0]+1)/2;
    v2[1] = (1-v2[1])/2;

    ret[0] = v2[0]*c.width;
    ret[1] = v2[1]*c.height;
    ret[2] = v2[3];
    return ret;
}

function vectorToPitchYaw(vec, py){
    py[0] = Math.asin(vec[2]);
    py[1] = Math.atan2(vec[1]/Math.cos(py[0]),  vec[0]/Math.cos(py[0]));
}

function pitchYawToVector(py, vec){
    vec[0] = Math.cos(py[1])*Math.cos(py[0]);
    vec[1] = Math.sin(py[1])*Math.cos(py[0]);
    vec[2] = Math.sin(py[0]);
}

function slerp(vBegin, vEnd, time, vResult){
    var ang = (vBegin[0]*vEnd[0]+vBegin[1]*vEnd[1]+vBegin[2]*vEnd[2]);

    var theta_0 = Math.acos(ang);
    var theta = theta_0*time;
    
    v1[0] = vEnd[0] - vBegin[0]*ang;
    v1[1] = vEnd[1] - vBegin[1]*ang;
    v1[2] = vEnd[2] - vBegin[2]*ang;
    vec3.normalize(v1);

    vResult[0] = vBegin[0]*Math.cos(theta) + v1[0]*Math.sin(theta);
    vResult[1] = vBegin[1]*Math.cos(theta) + v1[1]*Math.sin(theta);
    vResult[2] = vBegin[2]*Math.cos(theta) + v1[2]*Math.sin(theta);

}

function testFor3DSphereClick(pos3d, rad, x, y){
	var center = [0, 0, 0, 1.0];
	
    convert3DTo2D(pos3d, center);

	if(center[3] <= 0 || center[3] > 1000) return false;
	
	var p3 = [pos3d[0]+sideVec[0]*rad,pos3d[1]+sideVec[1]*rad,pos3d[2]+sideVec[2]*rad, 1.0];
	
	var right =  [0, 0, 0, 1.0];
    convert3DTo2D(p3, right);
	
	var diff = [center[0]-right[0], center[1]-right[1]];
	var diff2 = [center[0]-x, center[1]-y];
	var len = (diff[0]*diff[0]+diff[1]*diff[1]);
	var len2 = (diff2[0]*diff2[0]+diff2[1]*diff2[1]);
	if(len>len2){
		return true;
	}
    return false;
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};



var squareVertexPositionBuffer;
var squareVertexUVBuffer;

function initPostProcessBuffers() {
    //Create Square Position Buffer
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
        1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
    
    //Create Square UV Buffer
    squareVertexUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexUVBuffer);
    var uvs = [
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    squareVertexUVBuffer.itemSize = 2;
    squareVertexUVBuffer.numItems = 4;
}


function initPostProcessFrameBuffer() {
    postProcessTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, postProcessTexture);    
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  width,  height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	

    postProcessBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postProcessTexture, 0);
        
		
		
	var renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

	
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	postProcessTexture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, postProcessTexture2);    
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  width,  height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	

    postProcessBuffer2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessBuffer2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postProcessTexture2, 0);
        
		
		
	var renderbuffer2 = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer2);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

	
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer2);
	

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
function getXHR(){
    var xhr;
    try{
        xhr = new XMLHttpRequest();
    }catch(e){
        try{
            xhr = new ActiveXObject("MSXML2.XMLHTTP.6.0");
        }catch(e2){
            try{
                xhr = new ActiveXObject("MSXML2.XMLHTTP");
            }catch(e3){}
        }
    }
    return xhr;
}


function getBinaryData(url, callback){
    var xhr = getXHR();
    xhr.open("GET", url, !!callback);
    xhr.responseType = 'arraybuffer';
    if(callback){
        xhr.onload = function(e) {
			if (this.status == 200 || this.status == 0) {
				callback(new Int8Array(this.response));
			}
		};
    }
    xhr.send();
    return callback ? undefined : xhr.responseText;
}