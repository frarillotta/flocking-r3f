import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const Airship3 = forwardRef((props, ref) => {
    const { nodes, materials } = useGLTF('/airship3.glb')
    return (
      <group scale={[3, 3, 3]} ref={ref} {...props} dispose={null} >
        <mesh geometry={nodes.Sphere_1.geometry} material={materials.hull} />
        <mesh geometry={nodes.Sphere_2.geometry} material={materials['hull paint']} />
        <mesh geometry={nodes.Sphere_3.geometry} material={materials['inner wood']} />
        <mesh geometry={nodes.Sphere_4.geometry} material={materials.details} />
      </group>
    )
})

  

useGLTF.preload('/airship3.glb');
