precision mediump float; 
varying vec2 vUV; 
uniform sampler2D uSampler; 

uniform float time;
uniform float rand1x, rand1y; 
uniform float rand2x, rand2y; 

float s = 0.08;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
	vec2 colorUV;
	float r1 = (rand(vUV*2.0+vec2(rand1x, rand1y)));
	float g1 = (rand(vUV*3.0+vec2(rand1x, rand1y)));
	float b1 = (rand(vUV*4.0+vec2(rand1x, rand1y)));
			
	float r2 = (rand(vUV*2.0+vec2(rand2x, rand2y)));
	float g2 = (rand(vUV*3.0+vec2(rand2x, rand2y)));
	float b2 = (rand(vUV*4.0+vec2(rand2x, rand2y)));
	
	float n = time;
	float m = 1.0-n;
	float r = r1*(m) + r2*n;
	float g = g1*(m) + g2*n;
	float b = b1*(m) + b2*n;
	
    gl_FragColor = texture2D(uSampler, vUV) + vec4(r, g, b, 0.0)*s;
} 
