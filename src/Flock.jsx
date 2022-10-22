import { useFrame } from "@react-three/fiber";
import React from "react";
import { Instances, Instance } from "@react-three/drei";
import { Boid } from "./Boid";
import { useGLTF } from '@react-three/drei'
import { MathUtils } from "three";
const _NUM_BOIDS = 500;

const boids = new Array(_NUM_BOIDS).fill(null).map(() => new Boid());

export function Flock({ airships, player }) {
  useFrame(() => {
    let i = boids.length;
    while (i--) {
      boids[i].flock(boids, player);
      boids[i].update();
    }
  });
  const { nodes, materials } = useGLTF('/bird.glb')

  return (
    <group>
      <Instances
        limit={_NUM_BOIDS}
        range={_NUM_BOIDS}
        args={[null, null, _NUM_BOIDS]}
        geometry={nodes.Cylinder.geometry}
        material={materials['Material.001']}
      >
        {boids.map(({ position, velocity }, i) => (
            <Instance
              scale={[.15, .15, .15]}
              position={[position.x, position.y, position.z]}
              rotation={[MathUtils.degToRad(180), MathUtils.degToRad(90) ,MathUtils.degToRad(90)]}
              velocity={velocity}
              ref={(el) => {
                boids[i].ref = el;
              }}
              airshipRefs={airships}
              key={`${i}boid`}
            />
        ))}
      </Instances>
    </group>
  );
}

useGLTF.preload('/bird.glb')
