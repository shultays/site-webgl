require("scripts/space/objects/stardust.js");
require("scripts/space/gui/infoball.js");
require("scripts/space/objects/model.js");
require("scripts/space/objects/imageplanet.js");
require("scripts/space/objects/videoplanet.js");
require("scripts/space/objects/musicplanet.js");
require("scripts/space/objects/htmlplanet.js");
require("scripts/space/gui/scroll.js");
require("scripts/space/gui/image.js");
require("scripts/space/objects/system.js");
require("scripts/html2canvas.js");

var width, height;

var drawList = new Array();
var tickList = new Array();
var mouseList = new Array();

var shader;

var keyState = new Array();
var mouseState = new Array();

var clickedObj;

var moving = false;
var initPos = vec3.create();
var movePos = vec3.create();
var initEye = vec3.create();
var initUp = vec3.create();
var moveEndEye = vec3.create();
var moveEndUp = vec3.create();

var moveStartTime;
var moveEndTime;
var linearMove;
var splineMoveControlPoint = vec3.create();

var img;

var guiList = new Array();

var postProcess = false;
var postProcessObject;
var postProcessProgram;

var postProcessTexture, postProcessBuffer;


var postProcessProgram;

var current;

var arr = 	[[[61.341977024251165,4.880792409505072,-106.45082249115173],[-0.44190425720467824,0.03659638023315812,0.8963154201609004],[-0.17285947231352097,0.9768861626410354,-0.12574986310912514],[-0.880196876729801,-0.21052525259894106,-0.4253617004541615]],[[31.155541797586814,6.992962547798932,-51.49249836554078],[-0.5182647962783367,0.032228545217208776,0.8546127320674298],[-0.16596662016841318,0.9764079292864304,-0.1381399168106696],[-0.8389078480149953,-0.2134012966324823,-0.5006930288454443]],[[-52.47932562404752,9.660059918729724,89.15667334993176],[-0.46156984909638876,0.0024034486889515407,0.8871006124018995],[-0.18799606365552818,0.9769514474198093,-0.10111057798361145],[-0.8668972413791288,-0.21344101741990973,-0.45047949326733905]],[[-137.38320418573522,6.606792297846522,383.6511973917036],[0.052217129741439085,0.00424031416746782,0.9986267526445136],[-0.21723999287542486,0.9760951089004047,0.00671743077319612],[-0.9746638187328012,-0.2175700112176081,0.051901162529978825]],[[-103.94936194127912,9.039899820265283,515.4743970097131],[0.4423650276983825,0.0322847891572554,0.896253800359296],[-0.20200137141175495,0.9772844897748016,0.06411296275618457],[-0.8737175240456152,-0.20984920546515093,0.4388405167498146]],[[-13.090027434937685,15.524439760597225,630.6986475532633],[0.7711855228198451,0.05427473060204247,0.6342926320013169],[-0.16239826490246745,0.9801909983793846,0.11336847115795881],[-0.6154329333741938,-0.19097440657857015,0.764703263070322]],[[126.54878211496055,25.251709510977285,704.653103806322],[0.9594663344997348,0.06623186802990304,0.2739300871005453],[-0.10818156512723366,0.9840314762150937,0.14134639289548742],[-0.2600369780723603,-0.16579033641403582,0.9512593412874931]],[[198.6725384403575,31.028384833715375,709.0527831646405],[0.9831788874658637,0.08317680831719813,-0.1626065613668484],[-0.059953362052193926,0.9879997368619613,0.14234505379300572],[0.17249142407337648,-0.1301614091481615,0.9763732463508531]],[[273.8050041665804,37.40510275107607,679.3258383684025],[0.8153761276755145,0.0675991124001246,-0.5749714170457504],[0.000025549942872471128,0.9931677196079942,0.1166956729097404],[0.5789274268262091,-0.09509193179985828,0.8098151387662221]],[[340.9563014108349,42.60830687164058,596.2276061533153],[0.3775247611798596,0.024932975382737078,-0.9256637626236938],[0.053067558595226126,0.9974126646829087,0.04849546942634729],[0.9244782064342695,-0.0673364869406662,0.37524104700121164]],[[354.9698197991351,42.82700956152775,482.07233547178214],[-0.15591228507750135,-0.022525221445813867,-0.9875140372474355],[0.06143708080327538,0.9975844138991435,-0.03241638856927087],[0.9858671924089545,-0.06563730126896397,-0.15413508235898998]],[[322.1502950633021,39.094688473792395,393.29883797993665],[-0.5325734707910749,-0.0609473234003123,-0.8441865445385196],[0.036072831828126296,0.994870874275338,-0.0945023508835858],[0.845631538291067,-0.08071714724246344,-0.5276286986020778]],[[281.7543105900177,33.50828751590766,338.3906870585044],[-0.6595395943122342,-0.10152596245764627,-0.7447818489205429],[0.003649502490159696,0.9904064902127733,-0.13813640098102287],[0.7516795038029966,-0.09377179548370065,-0.6528282882460318]],[[206.605656073116,21.068548173791125,271.88085774817455],[-0.815084463296118,-0.14199682381120018,-0.5616709176384428],[-0.045821105076573734,0.9822887199362033,-0.18168460863721225],[0.5775447586170531,-0.12231909415441157,-0.8071431663584931]],[[103.06496847215242,5.3891745672944635,215.14607616286057],[-0.9037997289475157,-0.0939985181892016,-0.41750488444164485],[-0.022806468610835868,0.9848091605632061,-0.17213594122174541],[0.4273696377073624,-0.14603771941853372,-0.8922041118897132]],[[26.335612485740413,0.5529636548378509,178.89000883805645],[-0.887285192527968,-0.008442334852793484,-0.4611439190782419],[0.059606802854393126,0.9893747241610328,-0.1326072556263722],[0.4573898211644217,-0.14512775589620172,-0.8773439952286166]],[[0.34157952745823694,0.4129355961449408,163.60707439034587],[-0.8294497211944885,0.0018108479954180108,-0.5585784464512776],[0.08236938311797243,0.9894778343557338,-0.11894914898162068],[0.5525108751784777,-0.14464194477388714,-0.8208595742400404]],[[-169.61439720150088,3.6267239445867627,44.238438782705344],[-0.7628697688441245,0.04372905489746504,-0.645071690234106],[0.12823075447989848,0.9881360229668678,-0.0845226225382163],[0.6337236700784865,-0.14718650287471272,-0.7594277077864395]]];

var tvShaderRand1x, tvShaderRand2x;
var tvShaderRand1y, tvShaderRand2y;
var tvShaderDuration = 500;
var tvShaderTime;
function tv(){};

function spaceStart(c){

    initGL(c);
    initTools();
    frontCanvas = document.getElementById("frontstage");

    frontContext = frontCanvas.getContext("2d");
    spaceResize(c.width, c.height);

    document.onmousemove = handleMouseMove;
    document.onmousedown = handleMousePress;
    document.onmouseup = handleMouseRelease;
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

	
    document.touchmove = handleMouseMove;
    document.touchstart = handleMousePress;
    document.touchend = handleMouseRelease;
	
	
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	initPostProcessBuffers();
		
	tv.setPostProcessShader = function(){
		postProcessProgram = getTVShader();
		gl.useProgram(postProcessProgram);
		
		Math.seedrandom(current+"");
		while(current > tvShaderTime + tvShaderDuration){
			tvShaderRand1x = tvShaderRand2x;
			tvShaderRand1y = tvShaderRand2y;
			tvShaderRand2x = Math.random();
			tvShaderRand2y = Math.random();
			tvShaderTime += tvShaderDuration;
		}
		var t = ((current-tvShaderTime)*1.0)/tvShaderDuration;
		gl.uniform1f(postProcessProgram.rand1x, tvShaderRand1x);
		gl.uniform1f(postProcessProgram.rand1y, tvShaderRand1y);
		gl.uniform1f(postProcessProgram.rand2x, tvShaderRand2x);
		gl.uniform1f(postProcessProgram.rand2y, tvShaderRand2y);
		gl.uniform1f(postProcessProgram.time, t);
	}

    current = new Date().getTime();
		
	tvShaderRand2x = Math.random();
	tvShaderRand1x = Math.random();
	tvShaderRand2y = Math.random();
	tvShaderRand1y = Math.random();
	tvShaderTime = current;
	
    for(var i=0; i<3; i++){
        mouseState[i] = new Object();
    }

    for(var i=0; i<256; i++){
        keyState[i] = new Object();
    }
    lastTick = new Date().getTime();

	
	var scroll = new ScrollBar(0.5, 0, 1.0, -100, 600);
	
	scroll.onScroll = function(n){
		if(arr.length<2) return;
		/*arr = [[[0, 0, -200.0], [0, 0, 1], [0, 1, 0], [-1, 0, 0] ], [[0, 0, -100.0], [0, 0, 1], [0, 1, 0], [-1, 0, 0] ], [[0, 0, 0], [0, 0, 1], [0, 1, 0], [-1, 0, 0] ],
		[[0, 0, 100.0], [0, 0, 1], [0, 1, 0], [-1, 0, 0] ], [[0, 0, 200.0], [0, 0, 1], [0, 1, 0], [-1, 0, 0] ]];*/

		
		//arr = [[[0, 0, 0], [0, 0, 1], [0, 1, 0], [-1, 0, 0] ], [[-241.73061324600476, 11.526113382631756, 233.75365112737578], [-0.9345651772936967, 0.044561605385016474, 0.35299035782229415], [0.02502443524603385, 0.9979013566940247, -0.0597215199810083], [-0.3549108437771641, -0.04698026855750175, -0.9337189873487883] ]];
		
		var p = arr.length-1;
		var i = Math.floor(n*p);
		if(i>=p)i=p-1;
		var t= n*p-i;
		
		
		var v1 = arr[i];
		var v2 = arr[i+1];
		
		var u = 1-t;
		var tt = t*t;
		var uu = u*u;
		var uuu = uu * u;
		var ttt = tt * t;
		var l = 20;
		var p0 = vec3.create(v1[0]);
		var p1 = vec3.create(v1[0]);
		p1[0] += v1[1][0]*l; 
		p1[1] += v1[1][1]*l; 
		p1[2] += v1[1][2]*l; 
		var p2 = vec3.create(v2[0]);
		p2[0] -= v2[1][0]*l; 
		p2[1] -= v2[1][1]*l; 
		p2[2] -= v2[1][2]*l; 
		var p3 = vec3.create(v2[0]);
		var v = vec3.create();
		v[0] = uuu*p0[0] + 3*uu*t*p1[0] + 3*tt*u*p2[0] + ttt*p3[0];
		v[1] = uuu*p0[1] + 3*uu*t*p1[1] + 3*tt*u*p2[1] + ttt*p3[1];
		v[2] = uuu*p0[2] + 3*uu*t*p1[2] + 3*tt*u*p2[2] + ttt*p3[2];
		vec3.set(v, pos);
		slerp(v1[1], v2[1], t, eyeVec);
		slerp(v1[2], v2[2], t, upVec);
		vec3.cross(eyeVec, upVec, sideVec);
			
		moved = true;
		cameraChanged = true;
	}
	guiList.push(scroll);
	
	var control = new ImageGUI("controls", 1.0, -50.0, 1.0, -50.0, -1.0, -1.0);
	guiList.push(control);
	control.startTime = lastTick;
	control.tick = function(diff, t){
		if(!this.loaded) this.startTime = t;
		else{
			var a = (t-this.startTime-3000)/1000;
			if(a>1)guiList.remove(this);
			if(a<0) a=0;
			else if(a>1)a=1;
			this.alpha = 1-a;
		}
	};
    tickList.push(control);
	
    var sd = new StarDust(gl);

    drawList.push(sd);
    tickList.push(sd);
    mouseList.push(sd);
	
	
	img = new ImagePlanet("planet5.png",  [35.236019134521484,6.862861633300781,-54.94747543334961], [0.368, 0.411, 0.137, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new ImagePlanet("planet6.png", [-194.10913848876953,8.337488174438477,216.32852172851562], [0.427, 0.262, 0.419, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new ImagePlanet("planet7.png", [-131.14767456054688,8.064109802246094,418.5658264160156], [0.698, 0.203, 0.141, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	
	img = new ImagePlanet("planet8.png", [-41.53506851196289,13.504308700561523,600.1708984375], [0.541, 0.184, 0.023, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	
	img = new ImagePlanet("planet1.png", [118.85171508789062,7.279200553894043,222.47689819335938], [0.960, 0.894, 0.403, 1.0], [256, 256, 510]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);

	
	img = new ImagePlanet("planet2.png", [-174.61439514160156,3.6267240047454834,44.23843765258789], [0.35, 0.05, 0.32, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new ImagePlanet("planet3.png", [-191.70568337508007,7.373902180759617,127.85941254721209], [0.05, 0.35, 0.32, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);

	img = new ImagePlanet("planet4.png", [-218.4809593777656,9.669027600755005,45.24713164145723], [0.87, 0, 0, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new ImagePlanet("earth.png", [279.8683776855469,38.90013122558594,674.3189697265625], [0.302, 0.501, 0.596, 1.0], [240, 256, 440]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new ImagePlanet("planet9.png", [334.7840270996094,40.62466812133789,422.08465576171875],  [0.368, 0.411, 0.137, 1.0], [256, 256, 480]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	
	img = new ImagePlanet("planet_tamagotchi.png", [58, 20, 674], [0.784, 0.847, 0.220, 1.0], [255, 280, 400]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new ImagePlanet("lepetit.png", [-50, 30, 40], [0.634, 0.7686, 0.9882, 1.0], [240, 480, 327]);
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	img = new MusicPlanet("sail.png", [33.08131980388395,62.65471020803554,132.07734777492786], [1, 1, 1, 1.0], [256, 256, 512], "sail.mp3");
    drawList.push(img);
    tickList.push(img);
    mouseList.push(img);
	
	vd = new VideoPlanet("seven_nation_army", [8.05012321472168,0.3968557119369507,158.83096313476562], [1, 0, 0, 1.0], [["mp4", "mp4"], ["flv", "flv"], ["ogv", "ogg"]]);
    drawList.push(vd);
    tickList.push(vd);
    mouseList.push(vd);
	
	
		
	vd = new VideoPlanet("do_i_wanna_know", [28.05012321472168,40.3968557119369507,158.83096313476562], [0.1, 0.1, 0.4, 1.0], [["mp4", "mp4"], ["avi", "avi"], ["ogv", "ogg"]]);
    drawList.push(vd);
    tickList.push(vd);
    mouseList.push(vd);
	
		
	vd = new VideoPlanet("iron", [-28.05012321472168,-40.3968557119369507,158.83096313476562], [0.4, 0.4, 0.4, 1.0], [["mp4", "mp4"], ["avi", "avi"], ["ogv", "ogg"]]);
    drawList.push(vd);
    tickList.push(vd);
    mouseList.push(vd);
	
	
	vd = new VideoPlanet("a_little_more_action", [0, -20,0], [0, 1, 1, 1.0], [["mp4", "mp4"], ["flv", "flv"]]);
    drawList.push(vd);
    tickList.push(vd);
    mouseList.push(vd);
	
	var system = new System([100.341977024251165,-24.880792409505072, 200.45082249115173], "123");
    drawList.push(system);
    tickList.push(system);
    mouseList.push(system);

	var m = new Model(gl, "rifter", [-0.2308807373047,7.276176929473877,431.32080078125], 0.1);
	drawList.push(m);
    tickList.push(m);
    mouseList.push(m);
	
	
	
	var html = new HtmlPlanet("lepetit.png", [-10, 0, 0], [0.634, 0.7686, 0.9882, 1.0], [240, 480, 327]);
	drawList.push(html);
    tickList.push(html);
    mouseList.push(html);
	
	
    moved = true;
    cameraChanged = true;
    tick();
	
}

function spaceResize(w, h){
    width = w;
    height = h;
    gl.viewportWidth = width;
    gl.viewportHeight = height;
	
	for(var i=0; i<guiList.length; i++){
		guiList[i].windowResized();
	}
	initPostProcessFrameBuffer();
}

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function tick() {
    current = new Date().getTime();
    var diff = current-lastTick;
    control(diff, current);
    seq++;
    for(var i=0; i<tickList.length; i++){
        tickList[i].tick(diff, current);
    }

    draw();

    lastTick = current;
	
    moved = false;
    cameraChanged = false;

	
    window.setTimeout(tick, 1000/60);
}

function control(diff, t){
    var speed = 0;
    var yawRate = 0;
    var pitchRate = 0;

    if(moving){
        moved = true;
        cameraChanged = true;
        var current = t;

        if(current > moveEndTime){
            current = moveEndTime;
            moving = false;
        }
		var a = (current-moveStartTime)/(moveEndTime-moveStartTime);
		var b = 1 - a;
		if(linearMove){
			pos[0] = initPos[0] + (movePos[0]-initPos[0])*a;
			pos[1] = initPos[1] + (movePos[1]-initPos[1])*a;
			pos[2] = initPos[2] + (movePos[2]-initPos[2])*a;
		
		}else{
			var t1 = vec3.create();
			var t2 = vec3.create();
			var t3 = vec3.create();
			var t4 = vec3.create();

			t1[0] = initPos[0]*b + splineMoveControlPoint[0]*a;
			t1[1] = initPos[1]*b + splineMoveControlPoint[1]*a;
			t1[2] = initPos[2]*b + splineMoveControlPoint[2]*a;
			
			t2[0] = movePos[0]*a + splineMoveControlPoint[0]*b;
			t2[1] = movePos[1]*a + splineMoveControlPoint[1]*b;
			t2[2] = movePos[2]*a + splineMoveControlPoint[2]*b;
			t3[0] = t1[0]*b + t2[0]*a;
			t3[1] = t1[1]*b + t2[1]*a;
			t3[2] = t1[2]*b + t2[2]*a;
			
			vec3.set(t3, pos);

            slerp(initEye, moveEndEye, a, eyeVec);
            slerp(initUp, moveEndUp, a, upVec);
            vec3.cross(eyeVec, upVec, sideVec);
		}
        
    }

    if (keyState[38].pressed || keyState[87].pressed) {
        speed = 0.3;
        var pt = 0;

        if(keyState[38].pressed) pt = keyState[38].pressTime;
        else if(keyState[87].pressed) pt = keyState[87].pressTime;
        var b = (t-pt)/5000;
        if(b<0)b=0;
        else if(b>1)b=1;
        speed *= Math.sqrt(b);

    } else if (keyState[40].pressed || keyState[83].pressed) {
        speed = -0.3;

        if(keyState[40].pressed) pt = keyState[40].pressTime;
        else if(keyState[83].pressed) pt = keyState[83].pressTime;
        var b = (t-pt)/5000;
        if(b<0)b=0;
        else if(b>1)b=1;
        speed *= Math.sqrt(b);
    }
    if (keyState[37].pressed || keyState[65].pressed) {
        yawRate += -1;

    } 
    if (keyState[39].pressed || keyState[68].pressed) {
        yawRate += +1;
    }

    if(mouseState[0].pressed && !mouseState[0].guiObject){
        yawRate -= (mouseState[0].initX-mouseState[0].x)/200;
        pitchRate -= (mouseState[0].y-mouseState[0].initY)/200;
    }
    
    if(yawRate > 5) yawRate = 5;
    else if(yawRate < -5) yawRate = -5;
    if(pitchRate > 10) pitchRate = 10;
    else if(pitchRate < -10) pitchRate = -10;

    if(speed != 0){
        moved = true;
        cameraChanged = true;
        pos[0] += eyeVec[0]*speed*diff;
        pos[1] += eyeVec[1]*speed*diff;
        pos[2] += eyeVec[2]*speed*diff;
    }


    if(yawRate != 0.0){
        cameraChanged = true;
        var t = yawRate*diff/1000;
        var t1 = Math.sin(t);
        var t2 = Math.cos(t);
        
        var nEyeVec = [0, 0, 0];
        var nSideVec = [0, 0, 0];
        
        nEyeVec[0] = eyeVec[0]*t2 + sideVec[0]*t1;
        nEyeVec[1] = eyeVec[1]*t2 + sideVec[1]*t1;
        nEyeVec[2] = eyeVec[2]*t2 + sideVec[2]*t1;
        
        nSideVec[0] = -eyeVec[0]*t1 + sideVec[0]*t2;
        nSideVec[1] = -eyeVec[1]*t1 + sideVec[1]*t2;
        nSideVec[2] = -eyeVec[2]*t1 + sideVec[2]*t2;
        
        eyeVec[0] = nEyeVec[0];
        eyeVec[1] = nEyeVec[1];
        eyeVec[2] = nEyeVec[2];
        
        sideVec[0] = nSideVec[0];
        sideVec[1] = nSideVec[1];
        sideVec[2] = nSideVec[2];
        
        vec3.normalize(eyeVec);
        vec3.normalize(sideVec);

    }
    if(pitchRate != 0.0){
        cameraChanged = true;
        var t = pitchRate*diff/1000;
        var t1 = Math.sin(t);
        var t2 = Math.cos(t);
        
        var nEyeVec = [0, 0, 0];
        var nUpVec = [0, 0, 0];
        
        nEyeVec[0] = eyeVec[0]*t2 + upVec[0]*t1;
        nEyeVec[1] = eyeVec[1]*t2 + upVec[1]*t1;
        nEyeVec[2] = eyeVec[2]*t2 + upVec[2]*t1;
        
        nUpVec[0] = -eyeVec[0]*t1 + upVec[0]*t2;
        nUpVec[1] = -eyeVec[1]*t1 + upVec[1]*t2;
        nUpVec[2] = -eyeVec[2]*t1 + upVec[2]*t2;
        
        eyeVec[0] = nEyeVec[0];
        eyeVec[1] = nEyeVec[1];
        eyeVec[2] = nEyeVec[2];
        
        upVec[0] = nUpVec[0];
        upVec[1] = nUpVec[1];
        upVec[2] = nUpVec[2];
        
        vec3.normalize(eyeVec);
        vec3.normalize(upVec);
        
    }
}
function draw(){


	gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessBuffer);
	

	gl.currentShader = null;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    frontContext.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

    mat4.perspective(pov,  gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);

    mat4.lookAt(pos, vec3.addt(eyeVec, pos), upVec, mvMatrix);
	mvPushMatrix();
    for(var i=0; i<drawList.length; i++){
        drawList[i].draw(pMatrix, mvMatrix, pos, eyeVec, sideVec, upVec);
    }
	mvPopMatrix();
	

	if(postProcess){
		gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessBuffer2);
	}else{
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	}

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	tv.setPostProcessShader();	
		
		
    gl.disable(gl.BLEND);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, postProcessTexture);
		gl.uniform1i(postProcessProgram.uSampler, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(postProcessProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexUVBuffer);
		gl.vertexAttribPointer(postProcessProgram.vertexUVAttribute, squareVertexUVBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    gl.enable(gl.BLEND);
		
	if(postProcess){
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		postProcessObject.setPostProcessShader();	
		
			
		gl.disable(gl.BLEND);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, postProcessTexture2);
			gl.uniform1i(postProcessProgram.uSampler, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
			gl.vertexAttribPointer(postProcessProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexUVBuffer);
			gl.vertexAttribPointer(postProcessProgram.vertexUVAttribute, squareVertexUVBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
		gl.enable(gl.BLEND);
	
	}
		

	
	
	frontContext.lineWidth=1	;
    frontContext.strokeStyle="#FFFFFF";
    frontContext.beginPath();
    frontContext.moveTo(10, height-20);
    frontContext.lineTo(10, height-10);

    frontContext.moveTo(15, height-20);
    frontContext.lineTo(15, height-10);

    frontContext.moveTo(5,  height-21);
    frontContext.lineTo(20, height-21);
    frontContext.stroke();


    for(var i=0; i<guiList.length; i++){
		guiList[i].draw();
	}
}

function handleMouseMove(event){
    mouseState[event.button].oldX = mouseState[event.button].x;
    mouseState[event.button].oldY = mouseState[event.button].y;
    mouseState[event.button].x = event.clientX;
    mouseState[event.button].y = event.clientY;
	
	if(mouseState[event.button].guiObject){
		mouseState[event.button].guiObject.mouseMove(mouseState[event.button].oldX, mouseState[event.button].oldY, mouseState[event.button].x, mouseState[event.button].y);
	}
}

function handleMouseRelease(event){
    mouseState[event.button].pressed = false;
	if(mouseState[event.button].guiObject){
		mouseState[event.button].guiObject.mouseRelease(event.clientX, event.clientY);
		mouseState[event.button].guiObject = false;
	}
    if(mouseState[event.button].clickObject){
        var i = mouseState[event.button].clickObject[0];
        var oldRet = mouseState[event.button].clickObject[1];
        var ret = mouseList[i].isMouseInside(getWorldViewProjectionMatrix, event.clientX, event.clientY);
        if(ret && ret[0] == oldRet[0] && ret[1] == oldRet[1] && ret[2] == oldRet[2]){
            mouseList[i].fireMouseClick(ret);
        }
		mouseState[event.button].clickObject = false;
    }
}
function handleMousePress(event){
    mouseState[event.button].pressed = true;
    mouseState[event.button].x = event.clientX;
    mouseState[event.button].y = event.clientY;
    mouseState[event.button].initX = event.clientX;
    mouseState[event.button].initY = event.clientY;

    mouseState[event.button].clickObject = false;
	mouseState[event.button].guiObject = false;

	for(var i=0;i<guiList.length; i++){
		if(guiList[i].isMouseInside(event.clientX, event.clientY)){
			mouseState[event.button].guiObject = guiList[i];
			mouseState[event.button].guiObject.mousePress(event.clientX, event.clientY);
			return;
		}
	}
    for(var i=0; i<mouseList.length; i++){
        var ret = mouseList[i].isMouseInside(getWorldViewProjectionMatrix(), event.clientX, event.clientY);
        if(ret) mouseState[event.button].clickObject = [i, ret];
    }
}
function handleKeyDown(event){
	if(event.keyCode == 112){
		arr.push([pos.slice(0), eyeVec.slice(0), upVec.slice(0), sideVec.slice(0)]);
		}
	if(event.keyCode == 113) if(arr.length>0)arr.splice(arr.length-1, 1);
	
	if(event.keyCode == 114){
		if(arr.length>0){
			eyeVec = arr[arr.length-1][1].slice(0);
			upVec = arr[arr.length-1][2].slice(0);
			sideVec = arr[arr.length-1][3].slice(0);
		}
	}
	if(event.keyCode == 115) alert(JSON.stringify(arr));
	if(event.keyCode == 117){
		var input = prompt("enter","");
		if(input != null) arr = JSON.parse(input);
	}
	if(event.keyCode == 32){
		alert(JSON.stringify([pos, eyeVec, upVec, sideVec]));
	}
    if(!keyState[event.keyCode].pressed) keyState[event.keyCode].pressTime = new Date().getTime();
    keyState[event.keyCode].pressed = true;
}
function handleKeyUp(event){
    if(keyState[event.keyCode].pressed) keyState[event.keyCode].releaseTime = new Date().getTime();
    keyState[event.keyCode].pressed = false;
}
    
function spaceMove(c, approach){
	var t = vec3.create();
	var dist = vec3.distance(c, pos);
	vec3.add(c, pos, t);
	t[0]/=2;
	t[1]/=2;
	t[2]/=2;
	vec3.subtract(t, pos, splineMoveControlPoint);
	var dot = vec3.dot(eyeVec, splineMoveControlPoint);
	var d = vec3.length(splineMoveControlPoint);
	var cos = dot/d;
    if(approach == undefined) approach = 5;
	if(cos < 0.99 && dist > 10){
		linearMove = false;
		splineMoveControlPoint[0]=d*eyeVec[0]/cos+pos[0];
		splineMoveControlPoint[1]=d*eyeVec[1]/cos+pos[1];
		splineMoveControlPoint[2]=d*eyeVec[2]/cos+pos[2];
	
		moving = true;
		/*
        img.pos[0] = splineMoveControlPoint[0];
        img.pos[1] = splineMoveControlPoint[1];
        img.pos[2] = splineMoveControlPoint[2];*/
		
		initPos[0] = pos[0];
		initPos[1] = pos[1];
		initPos[2] = pos[2];
		
		vec3.subtract(c, splineMoveControlPoint, t);
		vec3.normalize(t);
		
		movePos.set([c[0], c[1], c[2]]);
		movePos[0] -= t[0]*approach;
		movePos[1] -= t[1]*approach;
		movePos[2] -= t[2]*approach;
		moveEndEye.set(t);

        var v1 = vec3.create();
        var v2 = vec3.create();
        vec3.subtract(splineMoveControlPoint, pos, v1);
        vec3.subtract(c, pos, v2);
        vec3.cross(v2, v1, moveEndUp);
        if(vec3.dot(moveEndUp, upVec) < 0) 
            vec3.cross(v1, v2, moveEndUp);
        vec3.normalize(moveEndUp);

        vec3.set(eyeVec, initEye);
        vec3.set(upVec, initUp);

		var distance = vec3.distance(pos, splineMoveControlPoint)*2;
		var speed = 200;
		moveStartTime = new Date().getTime();
		moveEndTime = Math.floor(moveStartTime + (distance/speed)*1000);
		
	}else{
	
		linearMove = true;
			
		movePos.set([c[0], c[1], c[2]]);
		movePos[0] -= eyeVec[0]*approach;
		movePos[1] -= eyeVec[1]*approach;
		movePos[2] -= eyeVec[2]*approach;
		if(vec3.distance(movePos, pos) < 0.1) return 1;
		
		moveEndEye.set(eyeVec);
		moving = true;
		initPos[0] = pos[0];
		initPos[1] = pos[1];
		initPos[2] = pos[2];
		var distance = vec3.distance(movePos, pos);
		var speed = 200;
		moveStartTime = new Date().getTime();
		moveEndTime = Math.floor(moveStartTime + (distance/speed)*1000);
	}
    return 0;
}
