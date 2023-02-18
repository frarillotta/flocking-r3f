import { useRef } from 'react'
import { MathUtils } from 'three'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'

//Vars
const CLOUD_VERTICAL_POSITION = {
    min: 150,
    max: 300
};

const CLOUD_SCALE = {
    x: {
        max: 400,
        min: 200
    },
    y: {
        max: 100,
        min: 50
    },
    z: {
        max: 400,
        min: 200
    }
};

const CLOUD_HORIZONTAL_POSITION = {
    max: 2000,
    min: -2000
}
// I wish i was good enough to do performant volume clouds, but this works just too well

const Billboard = (props) => {
    const localRef = useRef();
    useFrame(({ camera }) => {
      if (!localRef.current) { return }
    
      // always face the camera unless it's too close
      if (camera.position.distanceTo(localRef.current.position) > 100) {
        localRef.current.lookAt(camera.position)
      }
    })
    return <group ref={localRef} {...props} />
}

//TODO: why are the billboards glitching?
export function Clouds() {
    return <>
       {[...new Array(500)].map((_, index) => 
            <Billboard
                key={`cloud${index}`}
                scale={[
                    MathUtils.randFloat(CLOUD_SCALE.x.min, CLOUD_SCALE.x.max),
                    MathUtils.randFloat(CLOUD_SCALE.y.min, CLOUD_SCALE.y.max),
                    MathUtils.randFloat(CLOUD_SCALE.z.min, CLOUD_SCALE.z.max),
                ]}
                position={[
                    MathUtils.randFloat(CLOUD_HORIZONTAL_POSITION.min, CLOUD_HORIZONTAL_POSITION.max),
                    MathUtils.randFloat(CLOUD_VERTICAL_POSITION.min, CLOUD_VERTICAL_POSITION.max),
                    MathUtils.randFloat(CLOUD_HORIZONTAL_POSITION.min, CLOUD_HORIZONTAL_POSITION.max),
                ]}>
                <Image 
                    // frustumCulled={false}
                    layers={1}
                    url={'/cloud.png'} 
                    transparent={true}
                />
            </Billboard>
       )} 
       

    </>
}
