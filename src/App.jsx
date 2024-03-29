import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Environment, Stats } from "@react-three/drei";
import { Color } from "three";
import { Flock } from "./Flock";
import { Terrain } from "./Terrain";
import { EffectComposer } from '@react-three/postprocessing'
import OutlinesAndHatchingEffect from './post/OutlinesAndHatchingEffect';
import { Clouds } from './Clouds';
import { Player } from './Player';
import * as THREE from 'three';
import { Airship } from './Airship';

let AIRSHIPS_COUNT = 30

if (window.innerWidth < 500) {
  AIRSHIPS_COUNT = 20
}
function SceneElements() {
  const playerRef = useRef();
  const airshipRefs = useRef([]);
  return (
    <>
      <Player ref={playerRef} />
      <Terrain player={playerRef} />
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
          Math.cos(Math.random() * Math.PI * 2) * ((i + 2) * 80),
          THREE.MathUtils.randInt(100, 200),
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
        camera={{ near: 0.6, far: 4010, fov: 26, position: [0, 100, 0] }}
        dpr={1}
      >
        <Stats />
        {/* <OrbitControls
          enableDamping={true}
          enablePan={false}
          enableRotate={true}
          enableZoom={false}
        /> */}
        <ambientLight intensity={0.5} />
        <spotLight position={[2000, 200, 2000]} intensity={2} />
        <directionalLight position={[-2000, 100, -2000]} intensity={1} />
        <Suspense fallback={null}>
          <Environment
            background={true} // can be true, false or "only" (which only sets the background) (default: false)
            // blur={0.5} // blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
            files={['/px.jpg', '/nx.jpg', '/py.jpg', '/ny.jpg', '/pz.jpg', '/nz.jpg']}
            path="/paintedsky"
          />
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

  useThree(({ scene }) => {
    scene.background = new Color('#89bff5');
  });

  return <EffectComposer>
    <OutlinesAndHatchingEffect />
  </EffectComposer>
}
