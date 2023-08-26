import { useFrame } from "@react-three/fiber";
import React, { useEffect } from "react";
import { Instances, Instance, useAnimations } from "@react-three/drei";
import { Boid } from "./Boid";
import { useGLTF } from '@react-three/drei'
import { MathUtils } from "three";
let _NUM_BOIDS = 700;
import { button, useControls } from 'leva'

if (window.innerWidth < 500) {
  _NUM_BOIDS = 250
}

const initialLevaParams = {
  maxSpeed: 4,
  maxForce: 0.06,
  cohesionPerception: 100,
  separationPerception: 17,
  alignmentPerception: 25,
  cohesionStrength: 0.36,
  alignmentStrength: 2,
  separationStrength: 5,
}

const controls = {
  maxSpeed: {
    value: initialLevaParams.maxSpeed, onChange(v) {
      controls.maxSpeed.value = v
    }
  },
  maxForce: {
    value: initialLevaParams.maxForce, onChange(v) {
      controls.maxForce.value = v
    }
  },
  cohesionPerception: {
    value: initialLevaParams.cohesionPerception, onChange(v) {
      controls.cohesionPerception.value = v
    }
  },
  separationPerception: {
    value: initialLevaParams.separationPerception, onChange(v) {
      controls.separationPerception.value = v
    }
  },
  alignmentPerception: {
    value: initialLevaParams.alignmentPerception, onChange(v) {
      controls.alignmentPerception.value = v
    }
  },
  cohesionStrength: {
    value: initialLevaParams.cohesionStrength, onChange(v) {
      controls.cohesionStrength.value = v
    }
  },
  alignmentStrength: {
    value: initialLevaParams.alignmentStrength, onChange(v) {
      controls.alignmentStrength.value = v
    }
  },
  separationStrength: {
    value: initialLevaParams.separationStrength, onChange(v) {
      controls.separationStrength.value = v
    }
  },
}

const boids = new Array(_NUM_BOIDS).fill(null).map(() => new Boid(controls));

export function Flock({ airships }) {
  const [, setControls] = useControls(() => ({
    ...controls, reset: button(() => {
      Object.keys(controls).forEach((key) => {
        controls[key].value = initialLevaParams[key];
        setControls({ [key]: controls[key].value })
      })
    })
  }))
  useFrame(() => {
    let i = boids.length;
    while (i--) {
      boids[i].flock(boids);
      boids[i].update();
    }
  });
  const { nodes, materials, animations } = useGLTF('/bird.glb');

  const { ref, actions, names } = useAnimations(animations);

  useEffect(() => {
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


