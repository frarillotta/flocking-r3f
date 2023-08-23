import { useFrame } from "@react-three/fiber";
import React, { useEffect } from "react";
import { Instances, Instance, useAnimations } from "@react-three/drei";
import { Boid } from "./Boid";
import { useGLTF } from '@react-three/drei'
import { MathUtils } from "three";
let _NUM_BOIDS = 700;

if(window.innerWidth < 500) {
  _NUM_BOIDS = 250
}

const boids = new Array(_NUM_BOIDS).fill(null).map(() => new Boid());

export function Flock({airships}) {
  useFrame(() => {
    let i = boids.length;
    while (i--) {
      boids[i].flock(boids);
      boids[i].update();
    }
  });
  const { nodes, materials, animations } = useGLTF('/bird.glb');

  const {ref, actions, names} = useAnimations(animations);

  useEffect(( )=> {
    actions[names[0]].play();
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
