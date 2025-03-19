import { useFrame } from "@react-three/fiber";
import { useRef, forwardRef } from "react";
import {Vector3, Matrix4, Quaternion} from "three";
import { useControls } from "./useControls";
import { useGLTF, Trail } from "@react-three/drei";

export const INITIAL_SPEED = 0.8;

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

let maxVelocity = 5;
let jawVelocity = 0;
let pitchVelocity = 0;
let tiltVelocity = 0;
let planeSpeed = 3;
let turbo = 0;

function updatePlaneAxis(x, y, z, planePosition, camera, controls, delta) {
  const multiplier = delta < 0.01 ? 0.85 : 1
  jawVelocity *= 0.95 * multiplier;
  pitchVelocity *= 0.95 * multiplier;
  tiltVelocity *= 0.95 * multiplier;
  let speed = planeSpeed * multiplier / 2.5;
  if (Math.abs(jawVelocity) > maxVelocity) 
    jawVelocity = Math.sign(jawVelocity) * maxVelocity;

  if (Math.abs(pitchVelocity) > maxVelocity) 
    pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;

  if (Math.abs(tiltVelocity) > maxVelocity) 
    tiltVelocity = Math.sign(tiltVelocity) * maxVelocity;

  if (controls.leftJaw) {
    jawVelocity += 0.0025;
  }

  if (controls.rightJaw) {
    jawVelocity -= 0.0025;
  }

  if (controls.left) {
    tiltVelocity += 0.0025;
  }

  if (controls.right) {
    tiltVelocity -= 0.0025;
  }

  if (controls.forward) {
    pitchVelocity -= 0.0025;
  }

  if (controls.backward) {
    pitchVelocity += 0.0025;
  }

  if (controls.stop) {
    speed = 0;
  }

  if (controls.reset) {
    jawVelocity = 0;
    pitchVelocity = 0;
    tiltVelocity = 0;
    turbo = 0;
    x.set(1, 0, 0);
    y.set(0, 1, 0);
    z.set(0, 0, 1);
    planePosition.set(0, 3, 7);
  }

  x.applyAxisAngle(z, jawVelocity);
  y.applyAxisAngle(z, jawVelocity);

  x.applyAxisAngle(y, tiltVelocity);
  z.applyAxisAngle(y, tiltVelocity);

  y.applyAxisAngle(x, pitchVelocity);
  z.applyAxisAngle(x, pitchVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  // plane position & velocity
  if (controls.accelerate) {
    turbo += 0.1;
  } else {
    turbo *= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);

  let turboSpeed = easeOutQuad(turbo) * 0.02;

  camera.fov = 40 + turboSpeed * 900;
  camera.updateProjectionMatrix();

  planePosition.add(z.clone().multiplyScalar(-speed - (turboSpeed * 100)));
}

const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);
const planePosition = new Vector3(0, 3, 7);

const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

export const Player = forwardRef((_, ref) => {

  const { nodes, materials } = useGLTF('/globe.glb');
  const speed = useRef(INITIAL_SPEED);
  const controls = useControls();
  useFrame(({ camera }, delta) => {
    updatePlaneAxis(x, y, z, planePosition, camera, controls.current, delta);

    const rotMatrix = new Matrix4().makeBasis(x, y, z);
    
    const matrix = new Matrix4()
    .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
    .multiply(rotMatrix);

    ref.current.matrixAutoUpdate = false;
    ref.current.matrix.copy(matrix);
    ref.current.matrixWorldNeedsUpdate = true;

    var quaternionA = new Quaternion().copy(delayedQuaternion);

    // warning! setting the quaternion from the rotation matrix will cause
    // issues that resemble gimbal locks, instead, always use the quaternion notation
    // throughout the slerping phase
    // quaternionA.setFromRotationMatrix(delayedRotMatrix);

    var quaternionB = new Quaternion();
    quaternionB.setFromRotationMatrix(rotMatrix);

    var interpolationFactor = 0.25;
    var interpolatedQuaternion = new Quaternion().copy(quaternionA);
    interpolatedQuaternion.slerp(quaternionB, interpolationFactor);
    delayedQuaternion.copy(interpolatedQuaternion);

    delayedRotMatrix.identity();
    delayedRotMatrix.makeRotationFromQuaternion(delayedQuaternion);

    const cameraMatrix = new Matrix4()
      .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
      .multiply(delayedRotMatrix)
      .multiply(new Matrix4().makeRotationX(-0.2))
      .multiply(
        new Matrix4().makeTranslation(0.0, 1.5, 15.0)
      );

    camera.matrixAutoUpdate = false;
    camera.matrix.copy(cameraMatrix);
    camera.matrixWorldNeedsUpdate = true;
  });

  return ( 
    <Trail
      width={1}
      length={0.5}
      color={'#F8D628'}
      attenuation={(t) => {
        return t * t
      }}
    >
      <group ref={ref} position={planePosition} dispose={null}>
        <mesh rotation={[0, Math.PI, 0]}  geometry={nodes.Sphere002.geometry} material={materials.glass} />
        <mesh rotation={[0, Math.PI, 0]}  geometry={nodes.Sphere002_1.geometry} material={materials.base} />
        <mesh rotation={[0, Math.PI, 0]}  geometry={nodes.Sphere002_2.geometry} material={materials.wings} />

          <mesh rotation={[0, Math.PI, 0]}  geometry={nodes.wing1.geometry} material={materials.wings} />

          <mesh rotation={[0, Math.PI, 0]}  geometry={nodes.wing2.geometry} material={materials.wings} />
      </group>
    </Trail>

  );
})



