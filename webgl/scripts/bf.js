var input = "";
var worker;
var timeoutChecker;
var gui=0;
var guiPos=0;

function isValid(op){
    if (op == '+') return 1;
    if (op == '-') return 1;
    if (op == '>') return 1;
    if (op == '<') return 1;
    if (op == '[') return 1;
    if (op == ']') return 1;
    if (op == '.') return 1;
    if (op == ',') return 1;
    if (op == '#') return 1;
    return 0;
}

function optimize(prog){
    var o = 0;
    for(var i=1; i<prog.length; i++){
        var del = 0;
        if(prog[i] == '+' && prog[o] == '-') del = 1;
        else if(prog[i] == '-' && prog[o] == '+') del = 1;
        else if(prog[i] == '<' && prog[o] == '>') del = 1;
        else if(prog[i] == '>' && prog[o] == '<') del = 1;
        if(del){
            prog[i] = ' ';
            prog[o] = ' ';
            while(o>0 && prog[o] == ' ') o--;
        }else o = i;
    }
    var ret = new Array();
    var k = 0;
    for(var i=0; i<prog.length; i++){
        if(prog[i] != ' ') ret[k++] = prog[i]; 
    }
    return ret;
}

function build(prog){
    var compiled = new Array();
    var old = prog[0];
    var k = 0;
    compiled[k++] = new Array(old, 1);
    for(var i=1; i<prog.length; i++){
        var op = prog[i];
        if(op == '+' || op == '-' || op == '<' || op == '>'){
            if(old == op){
                compiled[k-1][1]++;
                continue;
            }else{
                compiled[k++] = new Array(op, 1);
                old = op;
            }
        }else if(op == '.' || op == ','){
            compiled[k++] = new Array(op, 1);
            old = op;
        }else if(op == '['){
            compiled[k++] = new Array(op, 1);
            old = op;
        }else if(op == ']'){
            compiled[k++] = new Array(op, 1);
            var depth = 1;
            var z=k-2;
            for(; z>=0 && depth; z--){
                if(compiled[z][0] == ']') depth++;
                else if(compiled[z][0] == '[') depth--;
            }
            compiled[z+1][1] = k-z-2;
            compiled[k-1][1] = k-z-2;
            old = op;
        }
    }
    return compiled;
}


function runBuiltJS(compiled){

    var r = new Array();
    var jsCode = new Array();
    var inputIndex = 0;
    jsCode.push("var n='"+input+"';var ni=0;var p=0;var gui=0;");

    jsCode.push("function f(){var d = new Uint8Array(new ArrayBuffer(4096));var b = new Date().getTime();");

    if(gui)jsCode.push("function g(){if(p>="+(guiPos)+"&&p<="+(guiPos+3)+")self.postMessage(new Array(-11,p-"+guiPos+",d[p]));};");
    for(var i=0; i<compiled.length; i++){
        var op = compiled[i][0];
        var val = compiled[i][1];
        switch(op){
            case '+':
                if(val==1)jsCode.push("d[p]++;");
                else jsCode.push("d[p]+="+val+";");

                if(gui)jsCode.push("g();");
            break;
            case '-':
                if(val==1)jsCode.push("d[p]--;");
                else jsCode.push("d[p]-="+val+";");
                if(gui)jsCode.push("g();");
            break;
            case '>':
                if(val==1)jsCode.push("p++;");
                else jsCode.push("p+="+val+";");
            break;
            case '<':
                if(val==1)jsCode.push("p--;");
                else jsCode.push("p-="+val+";");
            break;
            case ',':
                jsCode.push("d[p]=(n.length>ni)?n.charCodeAt(ni++):0;");
                if(gui)jsCode.push("g();");
            break;
            case '.':
                jsCode.push("self.postMessage(d[p]);");
            break;
            case '[':
                jsCode.push("while(d[p]){");
            break;
            case ']':
                jsCode.push("}");
            break;
        }

    }
    jsCode.push("self.postMessage(new Array(-3, new Date().getTime()-b));}f();");
    var jsCodeStr = jsCode.join("");
    eval(jsCodeStr);

}

function execute(code)
{
    var prog = new Array();

    var depth = 0;
    var err = 0;
	for(var i=0; i<code.length && !err; i++){
        var op = code.charAt(i);
        if(op == ']'){
            if(!depth){ err=1; break; };
            depth--;
        }else if(op == '['){
            depth++;
        }
    }
    if(depth!=0 || err){
        self.postMessage(new Array(-1, 0));
        return;
    }


    var libs = code.split("@");

    for(var i=0; i<libs.length; i++){
        if(libs[i].indexOf("gui")==0){
            gui=1;
            guiPos=0;
            if(libs[i].indexOf(":")!=-1){
                guiPos=parseInt(libs[i].split(":")[1]);

            }
            self.postMessage(new Array(-10, 1));
        }        
    }


    var k = 0;
	for(var i=0; i<code.length; i++){
        var op = code.charAt(i);
        if (isValid(op)){
            prog[k++] = op;
        }
    }
    prog = optimize(prog);
    compiled = build(prog);
    runBuiltJS(compiled);
}


self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
        input = data.input;
        execute(data.code);
        break;
    case 'stop':
        stop = 1;
    break;
    default:
      break;
  };
}, false);

function stopBF(){
    if(!worker) return;
    var f = document.getElementById("infoArea");
    f.innerHTML = "User cancel.";
    worker.terminate();
    worker = undefined;
}

function runBFInternal(code, input, v, f, m){

    f.innerHTML = "";
    v.innerHTML = "\n";

    code = code.replace(new RegExp("&gt;",'gi'), ">");
    code = code.replace(new RegExp("&lt;",'gi'), "<");

    stop = 1;
    var tick = 0;
    var lastTick = 0;
    var timeout = 0;
    var mp = 10000;
    worker = new Worker("/js/bf.js");

    var canvas;
    var context;
    var imageData;
    var p=0,x=0,y=0;
    var r=0xFF, g=0xFF, b=0xFF, a=0xFF;
    function setPixel(imageData, x, y, r, g, b, a) {
        var index = (x + y * imageData.width) * 4;
        imageData.data[index+0] = r;
        imageData.data[index+1] = g;
        imageData.data[index+2] = b;
        imageData.data[index+3] = a;
    }
    worker.postMessage({'cmd' : 'start', 'code':code, 'input':input});
    worker.onmessage = function (e) {
        if(!worker) return;
        tick++;
        if(e.data.constructor == Number){
            v.value += String.fromCharCode(e.data);
            v.innerHTML += String.fromCharCode(e.data);

            if(!mp--){
                f.innerHTML="Too many outputs (infinite loop?)";
                worker.terminate();
                worker=undefined;
            }
        }else if(e.data.constructor == String) {
            alert(e.data);
        }else if(e.data.constructor == Array) {
            switch(e.data[0]){
                case -1:
                    f.innerHTML="Parentheses are not matching.";
                    worker.terminate();
                    worker=undefined;
                break;
                case -3:
                    f.innerHTML="Executed in "+e.data[1]+" ms.";
                    worker.terminate();
                    worker=undefined;
                break;

                case -10:
                    while (m.firstChild) {
                        m.removeChild(m.firstChild);
                    }
                    canvas = document.createElement("canvas");
                    canvas.width = canvas.height = 256;
                    canvas.style ="border:1px solid #000000;"
                    m.appendChild(canvas);
                    context = canvas.getContext('2d');

                    imageData = context.createImageData(256, 256);
                break;
                case -11:
                    var i = e.data[1];
                    var val = e.data[2];
                    if(i==0){
                        p=val;
                    }
                    if(i==3){
                        if(val) {
                            r=g=b=0x00;
                        }else{
                            r=g=b=0xFF;
                        }
                    }else if(i==1){
                        var x1=x;
                        var x2=val;
                        if(x1>x2){var t=x1; x1=x2; x2=t;}

                        if(p)  for(var j=x1; j<=x2; j++) setPixel(imageData, j, y, r, g, b, a);
                        x = val;
                    }else if(i==2){
                        var y1=y;
                        var y2=val;
                        if(y1>y2){var t=y1; y1=y2; y2=t;}

                        if(p)  for(var j=y1; j<=y2; j++) setPixel(imageData, x, j, r, g, b, a);
                        y = val;
                    }

                    
                    if(p) setPixel(imageData, x, y, r, g, b, a);
                    
                    if(p) context.putImageData(imageData, 0, 0);

                break;
            }
        }
    };

    timeoutChecker=setInterval(function(){
        if(!worker){
            window.clearInterval(timeoutChecker);
        }
        if(tick == lastTick) timeout++;
        else timeout=0;
        tick = lastTick;

        if(timeout == 10){
            f.innerHTML="Not responding (infinite loop?)";
            worker.terminate();
            worker=undefined;
            window.clearInterval(timeoutChecker);
        }

    },300);
}

function runBF(){
    if(worker) return;
    var c = document.getElementById("codeArea");
    var n = document.getElementById("inputArea");
    var v = document.getElementById("outputArea");
    var f = document.getElementById("infoArea");
    var img = document.getElementById("imageArea");

    var code = c.value;
    var input = n.value;

    runBFInternal(code, input, v, f, img);
}

function runBFSmall(id){
    var code = document.getElementById(id).innerHTML;

    var input = "";
    if(code.indexOf(",")!=-1){
        input = prompt("Please enter input for your script","");
    }else{
        document.getElementById(id+"run").innerHTML="";
    }

    var v  = document.getElementById(id+"output");
    var f  = document.getElementById(id+"info");

    var img = document.getElementById(id+"image");
    runBFInternal(code, input, v, f, img);
}
