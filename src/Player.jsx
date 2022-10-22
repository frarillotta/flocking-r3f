import { useFrame } from "@react-three/fiber";
import { useRef, forwardRef } from "react";
import {Vector3, MathUtils} from "three";
import { useControls } from "./useControls";
import { useGLTF, Trail } from "@react-three/drei";

export const INITIAL_SPEED = 0.8;
const MAX_SPEED = 1.5;


export const Player = forwardRef((_, ref) => {
  const controls = useControls();
  const speed = useRef(INITIAL_SPEED);
  const { nodes, materials } = useGLTF('/globe.glb')

  useFrame((state) => {
    const idealCameraPosition = new Vector3(0.0, 1.5, -15.0);
    const idealLookAt = new Vector3(0, -0.5, 10);

    // acceleration
    if (controls.current.accelerate) {
      speed.current = MathUtils.lerp(speed.current, MAX_SPEED, 0.1);
      idealCameraPosition.z = MathUtils.lerp(
        idealCameraPosition.z,
        -455,
        0.01
      );
    } else {
      speed.current = MathUtils.lerp(speed.current, INITIAL_SPEED, 0.01);
      idealCameraPosition.z = MathUtils.lerp(
        idealCameraPosition.z,
        -15,
        0.001
      );
    }

    // camera
    idealCameraPosition
      .applyQuaternion(ref.current.quaternion)
      .add(ref.current.position);
    idealLookAt
      .applyQuaternion(ref.current.quaternion)
      .add(ref.current.position);
    const _idealLookAt = ref.current.position.clone().lerp(idealLookAt, 0.5);
    state.camera.position.lerp(idealCameraPosition, 0.1);
    state.camera.lookAt(_idealLookAt);
    //TODO: fix these stupid angles
    if (controls.current.forward) {
      ref.current.rotation.x = MathUtils.lerp(
        ref.current.rotation.x,
        ref.current.rotation.x - 0.11,
        0.4
      );
    }
    if (controls.current.backward) {
      ref.current.rotation.x = MathUtils.lerp(
        ref.current.rotation.x,
        ref.current.rotation.x + 0.11,
        0.4
      );
    }
    if (controls.current.left) {
      ref.current.rotation.y = MathUtils.lerp(
        ref.current.rotation.y,
        ref.current.rotation.y + 0.11,
        0.4
      );
    }
    if (controls.current.right) {
      ref.current.rotation.y = MathUtils.lerp(
        ref.current.rotation.y,
        ref.current.rotation.y - 0.11,
        0.4
      );
    }
    if (controls.current.rightSide) {
      ref.current.rotation.z = MathUtils.lerp(
        ref.current.rotation.z,
        ref.current.rotation.z - 0.11,
        0.4
      );
    }
    if (controls.current.leftSide) {
      ref.current.rotation.z = MathUtils.lerp(
        ref.current.rotation.z,
        ref.current.rotation.z + 0.11,
        0.4
      );
    }
    if (!controls.current.stop) {
      // forward movement
      const worldDirection = new Vector3();
      ref.current.getWorldDirection(worldDirection);
      const dir = worldDirection.multiplyScalar(speed.current);
      ref.current.position.addScaledVector(dir, speed.current);

    }
  });
  return (      
    <Trail
      width={1}
      length={2}
      color={'#F8D628'}
      attenuation={(t) => {
        return t * t
      }}
    >
      <group ref={ref} position={[0, 100, 0]} dispose={null}>
        <mesh geometry={nodes.Sphere002.geometry} material={materials.glass} />
        <mesh geometry={nodes.Sphere002_1.geometry} material={materials.base} />
        <mesh geometry={nodes.Sphere002_2.geometry} material={materials.wings} />

          <mesh geometry={nodes.wing1.geometry} material={materials.wings} />

          <mesh geometry={nodes.wing2.geometry} material={materials.wings} />
      </group>
    </Trail>

  );
})


useGLTF.preload('/globe.glb')