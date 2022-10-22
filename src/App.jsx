import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Stats } from "@react-three/drei";
import {Color} from "three";
import { Flock } from "./Flock";
import { Terrain } from "./Terrain";
import { EffectComposer } from '@react-three/postprocessing'
import OutlinesAndHatchingEffect from './post/OutlinesAndHatchingEffect';
import { Clouds } from './Clouds';
import { Player } from './Player';
import * as THREE from 'three';
import { Airship } from './Airship';

const AIRSHIPS_COUNT = 30
function SceneElements() {
  const playerRef = useRef();
  const airshipRefs = useRef([]);
  return (
    <>
      <Player ref={playerRef}/>
      <Terrain player={playerRef}/>
      <Flock player={playerRef} airships={airshipRefs} />
      {new Array(AIRSHIPS_COUNT).fill(null).map((_, i) => 
          <Airship key={`airship${i}`} ref={(el) => {
          // not very elegant, i know
          const boundingBox = new THREE.Box3();
          boundingBox.setFromObject(el);
          el.AABB = boundingBox;
          airshipRefs.current[i] = el
        }} position={[
          //distribute them in circles as to avoid collision - i hope that works
          Math.cos(Math.random() * Math.PI * 2) * ((i + 1) * 80),
          THREE.MathUtils.randInt(100, 200),
          Math.sin(Math.random() * Math.PI * 2) * ((i + 1) * 80),
        ]}
          rotation-y={THREE.MathUtils.degToRad(THREE.MathUtils.randInt(0, 360))}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Canvas
      camera={{ near: 0.6, far: 4010, fov: 26, position: [0, 100, 0] } }
      shadows={true}

    >
    <Stats />
      {/* <OrbitControls
        enableDamping={true}
        enablePan={false}
        enableRotate={true}
        enableZoom={false}
      /> */}
      <ambientLight intensity={0.35} />
      <spotLight  position={[2000, 50, 2000]} intensity={1}/>
      <directionalLight position={[-2000, 40, -2000]} intensity={0.4}/>
      <Suspense fallback={null}>
        {/* <Environment preset="park"/> */}
        <PostEffects />
        <SceneElements />
        <Clouds />
      </Suspense>

    </Canvas>
  );
}

const PostEffects = () => {

  const { scene, camera } = useThree(({scene, camera}) => {
    scene.background = new Color('#89bff5');
    return {scene, camera};
  });

  return <EffectComposer>
    <OutlinesAndHatchingEffect scene={scene} camera={camera} />
  </EffectComposer>
}