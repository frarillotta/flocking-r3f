import React, { forwardRef } from 'react'
import { Float } from '@react-three/drei'
import { MathUtils } from 'three';
import { Airship1, Airship2, Airship3 } from './airships';

export const Airship = forwardRef((props, ref) => {

  const SelectedAirship = [Airship1, Airship2, Airship3][MathUtils.randInt(0, 2)]
  return (
    <Float speed={0.25} floatIntensity={0.5} rotationIntensity={0.05}>
      <SelectedAirship ref={ref} {...props} />
    </Float>
  )
});