import { useRef } from 'react'
import { Group, Texture, MathUtils } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard, Plane, useTexture } from '@react-three/drei'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import * as THREE from 'three';


// Texture
const size = 128;
const data = new Uint8Array( size * size * size );

let i = 0;
const scale = 0.08;
const perlin = new ImprovedNoise();
const vector = new THREE.Vector3();

for ( let z = 0; z < size; z ++ ) {

    for ( let y = 0; y < size; y ++ ) {

        for ( let x = 0; x < size; x ++ ) {

            const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
            data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
            i ++;

        }

    }

}

const texture = new THREE.Data3DTexture( data, size, size, size );
texture.format = THREE.RedFormat;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.unpackAlignment = 1;
texture.needsUpdate = true;

// Material

const vertexShader = /* glsl */`
    in vec3 position;
    uniform mat4 modelMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 cameraPos;
    out vec3 vOrigin;
    out vec3 vDirection;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
        vDirection = position - vOrigin;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = /* glsl */`
    precision highp float;
    precision highp sampler3D;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    in vec3 vOrigin;
    in vec3 vDirection;
    out vec4 color;
    uniform vec3 base;
    uniform sampler3D map;
    uniform float threshold;
    uniform float range;
    uniform float opacity;
    uniform float steps;
    uniform float frame;
    vec2 hitBox( vec3 orig, vec3 dir ) {
        const vec3 box_min = vec3( - 0.5 );
        const vec3 box_max = vec3( 0.5 );
        vec3 inv_dir = 1.0 / dir;
        vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
        vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
        vec3 tmin = min( tmin_tmp, tmax_tmp );
        vec3 tmax = max( tmin_tmp, tmax_tmp );
        float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
        float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
        return vec2( t0, t1 );
    }
    float sample1( vec3 p ) {
        return texture( map, p ).r;
    }
    float shading( vec3 coord ) {
        float step = 0.01;
        return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
    }
    void main(){
        vec3 rayDir = normalize( vDirection );
        vec2 bounds = hitBox( vOrigin, rayDir );
        if ( bounds.x > bounds.y ) discard;
        bounds.x = max( bounds.x, 0.0 );
        vec3 p = vOrigin + bounds.x * rayDir;
        vec3 inc = 1.0 / abs( rayDir );
        float delta = min( inc.x, min( inc.y, inc.z ) );
        delta /= steps;
        // Jitter
        vec3 size = vec3( textureSize( map, 0 ) );
        p += rayDir * ( 1.0 / size );
        //
        vec4 ac = vec4( base, 0.0 );
        for ( float t = bounds.x; t < bounds.y; t += delta ) {
            float d = sample1( p + 0.5 );
            d = smoothstep( threshold - range, threshold + range, d ) * opacity;
            float col = shading( p + 0.5 ) * 10.0 + ( ( p.x + p.y ) * 0.25 ) + 1.75;
            ac.rgb += ( 1.0 - ac.a ) * d * col;
            ac.a += ( 1.0 - ac.a ) * d;
            if ( ac.a >= 0.95 ) break;
            p += rayDir * delta;
        }
        color = ac;
        // color = vec4(1., 1., 0., 1.);
        // if ( color.a == 0.0 ) discard;
    }
`;

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.RawShaderMaterial( {
    glslVersion: THREE.GLSL3,
    uniforms: {
        base: { value: new THREE.Color( 0x798aa0 ) },
        map: { value: texture },
        cameraPos: { value: new THREE.Vector3() },
        threshold: { value: 0.3 },
        opacity: { value: 1 },
        range: { value: 0.2 },
        steps: { value: 100 }
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true
} );

export function Cloud({
    scale,
    position
}) {

    const cloudMeshRef = useRef();

    useFrame(({camera}) => {
        cloudMeshRef.current.material.uniforms.cameraPos.value = camera.position;
    })

    return <mesh scale={scale} ref={cloudMeshRef} position={position} geometry={geometry} material={material}/>
}


//Vars
const CLOUD_VERTICAL_POSITION = {
    min: 150,
    max: 300
};

const CLOUD_SCALE = {
    x: {
        max: 400,
        min: 200
    },
    y: {
        max: 100,
        min: 50
    },
    z: {
        max: 400,
        min: 200
    }
};

const CLOUD_HORIZONTAL_POSITION = {
    max: 2000,
    min: -2000
}

export function Clouds() {
    return <>
       {[...new Array(200)].map((_, index) => 
            <Cloud
                key={`cloud${index}`}
                scale={[
                    MathUtils.randFloat(CLOUD_SCALE.x.min, CLOUD_SCALE.x.max),
                    MathUtils.randFloat(CLOUD_SCALE.y.min, CLOUD_SCALE.y.max),
                    MathUtils.randFloat(CLOUD_SCALE.z.min, CLOUD_SCALE.z.max),
                ]}
                position={[
                    MathUtils.randFloat(CLOUD_HORIZONTAL_POSITION.min, CLOUD_HORIZONTAL_POSITION.max),
                    MathUtils.randFloat(CLOUD_VERTICAL_POSITION.min, CLOUD_VERTICAL_POSITION.max),
                    MathUtils.randFloat(CLOUD_HORIZONTAL_POSITION.min, CLOUD_HORIZONTAL_POSITION.max),
                ]}

            />
       )} 
    </>
}