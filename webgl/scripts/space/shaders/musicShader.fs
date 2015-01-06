precision mediump float; 
varying vec2 vUV; 
uniform sampler2D uSampler; 

uniform float angle;
uniform float displaceX; 
uniform float displaceY; 


void main(void) {
	vec2 colorUV;
	colorUV.x = vUV.x + displaceX*cos(angle);
	colorUV.y = vUV.y + displaceY*sin(angle);
    vec4 redColor = texture2D(uSampler, colorUV); 
	
	colorUV.x = vUV.x + displaceX*cos(angle+2.09439510239);
	colorUV.y = vUV.y + displaceY*sin(angle+2.09439510239);
    vec4 blueColor = texture2D(uSampler, colorUV); 
	
	colorUV.x = vUV.x + displaceX*cos(angle+4.18879020479);
	colorUV.y = vUV.y + displaceY*sin(angle+4.18879020479);
    vec4 greenColor = texture2D(uSampler, colorUV); 
	
    gl_FragColor = vec4(redColor.r, blueColor.g, greenColor.b, 1.0);
} 
