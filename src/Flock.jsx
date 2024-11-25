import { useFrame } from "@react-three/fiber";
import React, { useEffect } from "react";
import { Instances, Instance, useAnimations } from "@react-three/drei";
import { Boid } from "./Boid";
import { useGLTF } from '@react-three/drei'
import { MathUtils } from "three";
let _NUM_BOIDS = 800;

if (window.innerWidth < 500) {
  _NUM_BOIDS = 250
}

const boids = new Array(_NUM_BOIDS).fill(null).map(() => new Boid());

export function Flock({ airships, player }) {
  useFrame((_, delta) => {
    let i = boids.length;
    while (i--) {
      boids[i].flock(boids, player);
      boids[i].update(delta);
    }
  });
  const { nodes, materials, animations } = useGLTF('/bird.glb');

  const { ref, actions, names } = useAnimations(animations);

  useEffect(() => {
    const animation = actions[names[0]];
    animation.timeScale = 2.5;
    animation.play();
  });

  return (
    <group>
      <Instances
        ref={ref}
        limit={_NUM_BOIDS}
        range={_NUM_BOIDS}
        args={[null, null, _NUM_BOIDS]}
        geometry={nodes.Cylinder.geometry}
        material={materials['Material.001']}
        morphTargetDictionary={nodes.Cylinder.morphTargetDictionary}
        morphTargetInfluences={nodes.Cylinder.morphTargetInfluences}
      >
        {boids.map(({ position, velocity }, i) => (
          <Instance
            scale={[.15, .15, .15]}
            position={[position.x, position.y, position.z]}
            rotation={[MathUtils.degToRad(180), MathUtils.degToRad(90), MathUtils.degToRad(90)]}
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
