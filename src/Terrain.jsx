import { Vector3, Color, TextureLoader, RepeatWrapping, BufferAttribute, Vector2, DoubleSide, MathUtils } from 'three';
import { useRef, useLayoutEffect } from "react";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";

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
// export function Terrain() {

//     const terrainRef = useRef();
    
//     return <mesh 
//         ref={terrainRef} 
//         rotation={[Math.PI / 2, Math.PI, 0]} 
//         position={TERRAIN_POSITION} 
//         layers={1}
//     >
//         <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_RESOLUTION, TERRAIN_RESOLUTION]} />
//         <meshStandardMaterial name='terrainMaterial' displacementMap={fbmTexture} displacementScale={250} normalMap={fbmNormalTexture} normalScale={250} color={new Color('#42db40')} />
//     </mesh>

// } 
const idealSquareSize = 1850;
export const Terrain = () => {
	const groundRef = useRef();
	const heightfieldRef = useRef([]);
	useLayoutEffect(() => {
		const simplexNoise = new SimplexNoise();
		const positions = new Float32Array(
			groundRef.current.geometry.attributes.position.array,
		);
		for (
			let i = 2;
			i < groundRef.current.geometry.attributes.position.count * 3;
			i += 3
		) {
            const xypos = new Vector2(positions.at(i - 2), positions.at(i - 1));
			const dist = xypos.distanceTo(new Vector2(0, 0));
			let height =
				Math.abs(simplexNoise.noise(
					positions.at(i - 2) / 1250,
					positions.at(i - 1) / 1250,
				)) * Math.pow(dist / 50, 2);
                // (Math.abs(i - middle) + 10) / 5000;
            height += simplexNoise.noise(
                positions.at(i - 2) / 500,
                positions.at(i - 1) / 500,
            ) * 40;
			heightfieldRef.current.push(height);
			if (positions.at(i - 2) < idealSquareSize && positions.at(i - 2) > -idealSquareSize && positions.at(i - 1) < idealSquareSize && positions.at(i - 1) > -idealSquareSize) {
				positions[i] = height;
			} else {
				positions[i] = -800;
				positions[i - 2] = MathUtils.clamp(positions[i - 2], -idealSquareSize, idealSquareSize);
				positions[i - 1] = MathUtils.clamp(positions[i - 1], -idealSquareSize, idealSquareSize);
			}
		}
		groundRef.current.geometry.setAttribute(
			"position",
			new BufferAttribute(positions, 3),
		); // Create the Three.js BufferAttribute and specify that each information is composed of 3 values
		groundRef.current.geometry.computeVertexNormals();
	}, []);
	return (
		<mesh
			rotation={[Math.PI / 2, Math.PI, 0]}
			position={[0, -500, 0]}
			ref={groundRef}
		>
			<planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_RESOLUTION, TERRAIN_RESOLUTION]} />
			{/* this might not be terrible with rim lights */}
			<meshStandardMaterial side={DoubleSide} roughness={10} metalness={0} color={"#42db40"} />
		</mesh>
	);
};
