import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const Airship1 = forwardRef((props, ref) => {

    const { nodes, materials } = useGLTF('/airship1.glb')
    return (
      <group ref={ref} {...props} dispose={null}>
        <group scale={[10, 10, 10]} position={[0, 0, 4.1]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={nodes.Cylinder_1.geometry} material={materials['stripe purple']} />
          <mesh geometry={nodes.Cylinder_2.geometry} material={materials['border orange']} />
          <mesh geometry={nodes.Cylinder_3.geometry} material={materials['stripe white']} />
          <mesh geometry={nodes.Cylinder_4.geometry} material={materials.Cabin} />
          <mesh geometry={nodes.Cylinder_5.geometry} material={materials.Wngs} />
          <mesh geometry={nodes.Cylinder_6.geometry} material={materials.glass} />
        </group>
      </group>
    )
  
  });

  
useGLTF.preload('/airship1.glb');