attribute vec3 aVertexPosition;
attribute float vShift;
attribute float hShift;
attribute vec4 vColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform vec3 eyePos;
uniform vec3 sideVec;
uniform vec3 upVec;

uniform vec4 color;
uniform float starScale;

varying vec4 outColor;

void main(void) {

    vec4 worldPos  = uMVMatrix* vec4(aVertexPosition + hShift*sideVec*starScale + vShift*upVec*starScale, 1.0);
    gl_Position = uPMatrix * worldPos;
    
    float d = length(worldPos.xyz);
    float c = clamp((1000.0-d)/300.0, 0.0, 1.0);
    outColor = vec4(color.r*vColor.r, color.g*vColor.g, color.b*vColor.b, color.a*c*vColor.a);
    //vColor = vec4(1.0, 0.0, 0.0, 1.0);
}
