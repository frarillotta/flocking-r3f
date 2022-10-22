import styled, { keyframes } from "styled-components";
import { Canvas, useThree, useFrame, extend, addEffect } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Effects
} from "@react-three/drei";
import { UnrealBloomPass, OutlineEffect } from "three-stdlib";
import * as THREE from "three";
import { useControls } from "./useControls";
import { Flock } from "./Flock";
import { Terrain } from "./Terrain";
import { EffectComposer } from '@react-three/postprocessing'
import { WebGLRenderer } from "three";

extend({UnrealBloomPass, OutlineEffect})
export const INITIAL_SPEED = 0.4;
const MAX_SPEED = 0.8;
let renderer;
function AllBirds() {
  const ref = useRef();
  const controls = useControls();
  const speed = useRef(INITIAL_SPEED);

  useFrame((state) => {
    const idealCameraPosition = new THREE.Vector3(0.0, 1.5, -10.0);
    const idealLookAt = new THREE.Vector3(0, -0.5, 10);

    // acceleration
    if (controls.current.accelerate) {
      speed.current = THREE.MathUtils.lerp(speed.current, MAX_SPEED, 0.1);
      idealCameraPosition.z = THREE.MathUtils.lerp(
        idealCameraPosition.z,
        -455,
        0.01
      );
    } else {
      speed.current = THREE.MathUtils.lerp(speed.current, INITIAL_SPEED, 0.01);
      idealCameraPosition.z = THREE.MathUtils.lerp(
        idealCameraPosition.z,
        -10,
        0.001
      );
    }

    // forward movement
    const worldDirection = new THREE.Vector3();
    ref.current.getWorldDirection(worldDirection);
    const dir = worldDirection.multiplyScalar(speed.current);
    ref.current.position.addScaledVector(dir, speed.current);

    // // camera
    idealCameraPosition
      .applyQuaternion(ref.current.quaternion)
      .add(ref.current.position);
    idealLookAt
      .applyQuaternion(ref.current.quaternion)
      .add(ref.current.position);

    // //TODO: Make lerp values framerate independent
    const _idealLookAt = ref.current.position.clone().lerp(idealLookAt, 0.5);
    state.camera.position.lerp(idealCameraPosition, 0.1);
    state.camera.lookAt(_idealLookAt);
    //TODO: fix these stupid angles
    if (controls.current.forward) {
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        ref.current.rotation.x - 0.11,
        0.4
      );
    }
    if (controls.current.backward) {
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        ref.current.rotation.x + 0.11,
        0.4
      );
    }
    if (controls.current.left) {
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        ref.current.rotation.y + 0.11,
        0.4
      );
    }
    if (controls.current.right) {
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        ref.current.rotation.y - 0.11,
        0.4
      );
    }
    if (controls.current.rightSide) {
      ref.current.rotation.z = THREE.MathUtils.lerp(
        ref.current.rotation.z,
        ref.current.rotation.z - 0.11,
        0.4
      );
    }
    if (controls.current.leftSide) {
      ref.current.rotation.z = THREE.MathUtils.lerp(
        ref.current.rotation.z,
        ref.current.rotation.z + 0.11,
        0.4
      );
    }
  });
  return (
    <>
        <mesh castShadow={true} ref={ref}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"red"} />
        </mesh>
      <Terrain player={ref}/>
      <Flock player={ref} />
    </>
  );
}


let outlineEffect;
export default function App() {
  //TODO: noise volume clouds
  //TODO: style it up - maybe outlines in post process could be cool?
  //TODO: styling: trails on the wings perhaps
  //TODO: FBM plane that follows the player wooooo

  return (
    <>
      <CanvasWrapper>
        <Canvas
          gl={(canvas) => {
            renderer = new WebGLRenderer({canvas});
            
            outlineEffect = new OutlineEffect(renderer, {
              defaultThickness: 0.0075
            });

            return renderer;
          }}
          
          camera={{ near: 0.01, far: 3010, fov: 30 }}
          shadows={true}
        >
          {/* <OrbitControls
            enableDamping={true}
            enablePan={false}
            enableRotate={true}
            enableZoom={false}
          /> */}
          <ambientLight intensity={0.4} />
          <spotLight  shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00001} castShadow={true}  position={[10, 100, 10]} intensity={3} />
          <directionalLight castShadow={true} position={[30, 60, 10]}/>
          <Suspense fallback={null}>
            <Environment preset="sunset" />
              <PostEffects />
              <AllBirds />
          </Suspense>

        </Canvas>
      </CanvasWrapper>
    </>
  );
}

const PostEffects = () => {
  const { camera, size, scene } = useThree();

  // console.log(outlineEffect)

  useFrame(({scene, camera}) => {
    outlineEffect.render(scene, camera)
  }, 1)

  return <Effects disableRenderPass={false} disableRender={false} camera={camera}>
    {/* <unrealBloomPass /> */}
  </Effects>
}

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
