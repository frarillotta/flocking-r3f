import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Stats, OrbitControls } from "@react-three/drei";
import {Color} from "three";
import { Flock } from "./Flock";
import { Terrain } from "./Terrain";
import { EffectComposer } from '@react-three/postprocessing'
import OutlinesAndHatchingEffect from './post/OutlinesAndHatchingEffect';
import { Clouds } from './Clouds';
import { Player } from './Player';
import * as THREE from 'three';
import { Airship } from './Airship';

let AIRSHIPS_COUNT = 30

if(window.innerWidth < 500) {
  AIRSHIPS_COUNT = 20
}
function SceneElements() {
  const playerRef = useRef();
  const airshipRefs = useRef([]);
  return (
    <>
      {/* <Player ref={playerRef}/>*/}
      <Terrain /> 
      <Flock airships={airshipRefs} />
      {new Array(AIRSHIPS_COUNT).fill(null).map((_, i) => 
          <Airship key={`airship${i}`} ref={(el) => {
          // not very elegant, i know
          const boundingBox = new THREE.Box3();
          boundingBox.setFromObject(el);
          el.AABB = boundingBox;
          airshipRefs.current[i] = el
        }} position={[
          //distribute them in circles as to avoid collision - i hope that works
          Math.cos(Math.random() * Math.PI * 2) * ((i + 2) * 80),
          THREE.MathUtils.randInt(50, 150),
          Math.sin(Math.random() * Math.PI * 2) * ((i + 2) * 80),
        ]}
          rotation-y={THREE.MathUtils.degToRad(THREE.MathUtils.randInt(0, 360))}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <>    
      <Canvas
        camera={{ near: 20, far: 99999999, fov: 30, position: [500, 500, 0] } }
        dpr={1}
      >
      <Stats />
        <OrbitControls
          maxDistance={1500}
          maxPolarAngle={Math.PI/2}
          maxAzimuthAngle={Math.PI/4}
        />
        <ambientLight intensity={0.5} />
        <spotLight  position={[2000, 200, 2000]} intensity={2}/>
        <directionalLight position={[-2000, 100, -2000]} intensity={1}/>
        <Suspense fallback={null}>
          {/* <Environment preset="park"/> */}
          <PostEffects />
          <SceneElements />
          <Clouds />
        </Suspense>

      </Canvas>
    </>

  );
}

const PostEffects = () => {

  useThree(({scene, camera}) => {
    scene.background = new Color('#89bff5');
  });

  return <EffectComposer>
    <OutlinesAndHatchingEffect />
  </EffectComposer>
}
