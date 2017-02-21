precision mediump float;

varying vec2 outTextoreCoord;
varying vec4 outColor;

uniform sampler2D uSampler;

void main(void) {
    vec4 textureColor = texture2D(uSampler, vec2(outTextoreCoord.s, outTextoreCoord.t));
	
	
	if(textureColor[3]  == float(0))discard;
	
    gl_FragColor[0] = textureColor[0]*outColor[0];
    gl_FragColor[1] = textureColor[1]*outColor[1];
    gl_FragColor[2] = textureColor[2]*outColor[2];
    gl_FragColor[3] = textureColor[3]*outColor[3]+ 0.5;
	
}
