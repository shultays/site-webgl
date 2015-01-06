attribute vec3 aVertexPosition;  
attribute vec2 aVertexUV; 
uniform vec4 bounds; 
varying vec2 vUV; 
void main(void) { 
   gl_Position =  vec4(aVertexPosition, 1.0); 
   vUV.x = bounds[1]*aVertexUV[0] + bounds[0]*(1.0-aVertexUV[0]); 
   vUV.y = bounds[3]*aVertexUV[1] + bounds[2]*(1.0-aVertexUV[1]); 
} 