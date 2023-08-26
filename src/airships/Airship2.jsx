import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const Airship2 = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('/airship2.glb')
  return (
    <group ref={ref} {...props} dispose={null} >
      <group rotation={[Math.PI / 2, Math.PI, 0]} scale={[10, 20, 10]} >
        <mesh geometry={nodes.Cylinder_1.geometry} material={materials['orange inside']} />
        <mesh geometry={nodes.Cylinder_2.geometry} material={materials['orange darkerer']} />
        <mesh geometry={nodes.Cylinder_3.geometry} material={materials.metal} />
        <mesh geometry={nodes.Cylinder_4.geometry} material={materials['metal darker']} />
        <mesh geometry={nodes.Cylinder_5.geometry} material={materials['Material.001']} />
      </group>
    </group>
  )
})

useGLTF.preload('/airship2.glb');
