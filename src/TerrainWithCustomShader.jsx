import { useFrame } from '@react-three/fiber';
import {Vector3, Mesh, Color} from 'three';
import { useRef } from "react";
import glsl from 'babel-plugin-glsl/macro'

export const TERRAIN_POSITION = new Vector3(0, 10, 0)
const TERRAIN_SIZE = 2000;
const TERRAIN_RESOLUTION = 2000;

const customUniforms = {
    uTime: {
        value: 0
    },
    uPosition: {
        value: new Vector3()
    }
}

export function Terrain({ player }) {

    const terrainRef = useRef();
    useFrame((state) => {

        if (player.current instanceof Mesh) { 
            
            terrainRef.current.position.set(player.current.position.x, -30, player.current.position.z);
            customUniforms.uTime = {
                value: state.clock.elapsedTime
            }
            customUniforms.uPosition = {
                value: player.current.position
            }
        }
    });
    
    return <mesh 
        castShadow={true} 
        receiveShadow={true} 
        ref={terrainRef} 
        rotation={[Math.PI / 2, Math.PI, 0]} 
        position={TERRAIN_POSITION}
    >
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_RESOLUTION, TERRAIN_RESOLUTION]} />
        <meshStandardMaterial onBeforeCompile={(shader) => {
            shader.uniforms.uTime = customUniforms.uTime
            shader.uniforms.uPosition = customUniforms.uPosition

            // gotta do normals myself it looks like
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                glsl`#include <common>
                #pragma glslify: fbm2d = require('glsl-fractal-brownian-noise/2d');
                #pragma glslify: snoise2 = require(glsl-noise/simplex/2d) 

                varying vec3 vUv; 
                varying vec3 vVertex;
                uniform float uTime;
                uniform vec3 uPosition;

                float displace(vec3 point) {
                    float f = 0.;
                    vec2 noisePosition = point.xy;
                    noisePosition.y += uPosition.z;
                    noisePosition.x -= uPosition.x;
                    f += snoise2(noisePosition / 280.) * 75.;
                    f += snoise2(noisePosition / 140.) * 35.;
                    // this looks gorgeous but gosh it completely fucks performance cause of the normals
                    // f += fbm2d( vec2(noisePosition / 70.), 3) * 15.;
                    // f = max(f, 0.19);
                    
                    f -= distance(point, vec3(.5, 0., .5)) / 5.5;
                    return f;
                }
                // http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
                vec3 orthogonal(vec3 v) {
                    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
                    : vec3(0.0, -v.z, v.y));
                }
                `
            );
            
            shader.vertexShader = shader.vertexShader.replace(
                '#include <beginnormal_vertex>',
                glsl`	#include <beginnormal_vertex>
            
                    vec3 displacedPosition = position + normal * displace(position);

                    float offset = float(${TERRAIN_SIZE / TERRAIN_RESOLUTION});
                    vec3 tangent = orthogonal(normal);
                    vec3 bitangent = normalize(cross(normal, tangent));
                    vec3 neighbour1 = position + tangent * offset;
                    vec3 neighbour2 = position + bitangent * offset;
                    vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1);
                    vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2);

                    // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
                    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
                    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

                    // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
                    vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
                `
            );
            
            shader.vertexShader = shader.vertexShader.replace(
                '#include <defaultnormal_vertex>',
                `
                    vec3 transformedNormal = displacedNormal;
                `
            );

            shader.vertexShader = shader.vertexShader.replace(
                '#include <displacementmap_vertex>',
                'transformed = displacedPosition;'
            );

            // need to color this
            // shader.fragmentShader = `

            //     void main() {
            //         gl_FragColor = vec4(1., 0., 1., 1.);
            //     }
            // `


        }} color={new Color('#42db40')} />
    </mesh>

} 