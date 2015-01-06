attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat3 uNMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;


uniform vec4 color;
varying vec4 vColor;

void main(void) {

    vec4 worldPos  = uMVMatrix* vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * worldPos;
    
    float d = length(worldPos.xyz);
    float c = clamp((1000.0-d)/300.0, 0.0, 1.0);
    

    vec3 transformedNormal = uNMatrix*aVertexNormal;

    vec3 uLightingDirection = vec3(1.0, 0.0, 0.0);

    float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);

    
    vColor = vec4((color.rgb*0.2 + color.rgb*directionalLightWeighting * 0.8), c);


    //vColor = vec4(1.0, 0.0, 0.0, 1.0);
}
