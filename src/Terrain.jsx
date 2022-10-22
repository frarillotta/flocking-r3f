import { Vector3, Color, TextureLoader, RepeatWrapping } from 'three';
import { useRef } from "react";

export const TERRAIN_POSITION = new Vector3(0, -150, 0)
const TERRAIN_SIZE = 4000;
const TERRAIN_RESOLUTION = 2000;

const textureLoader = new TextureLoader();
const fbmTexture = textureLoader.load('./fbmtexture.jpg', (res) => {
    res.wrapS = res.wrapT = RepeatWrapping;
    return res;
  });
const fbmNormalTexture = textureLoader.load('./fbmtexture_NORM.png', (res) => {
    res.wrapS = res.wrapT = RepeatWrapping;
    return res;
});
export function Terrain() {

    const terrainRef = useRef();
    
    return <mesh 
        castShadow={true} 
        receiveShadow={true} 
        ref={terrainRef} 
        rotation={[Math.PI / 2, Math.PI, 0]} 
        position={TERRAIN_POSITION}
        // customDepthMaterial={new MeshDepthMaterial( {
        //     depthPacking: RGBADepthPacking,
        //     displacementMap: fbmTexture,
        //     displacementScale: 100,

        // })}
    >
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_RESOLUTION, TERRAIN_RESOLUTION]} />
        <meshStandardMaterial name='terrainMaterial' displacementMap={fbmTexture} displacementScale={250} normalMap={fbmNormalTexture} normalScale={250} color={new Color('#42db40')} />
    </mesh>

} 