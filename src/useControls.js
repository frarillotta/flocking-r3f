import { useEffect, useRef } from 'react'

export function useKeyPress(target, event) {
  useEffect(() => {
    const downHandler = ({ key }) => target.indexOf(key) !== -1 && event(true)
    const upHandler = ({ key }) => target.indexOf(key) !== -1 && event(false)
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])
}

export function useControls() {
  const keys = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false, 
    accelerate: false, 
    leftSide: false,
    rightSide: false,
    stop: false,
})
  useKeyPress(['w'], (pressed) => (keys.current.forward = pressed))
  useKeyPress(['s'], (pressed) => (keys.current.backward = pressed))
  useKeyPress(['a'], (pressed) => (keys.current.left = pressed))
  useKeyPress(['d'], (pressed) => (keys.current.right = pressed))
  useKeyPress([' '], (pressed) => (keys.current.accelerate = pressed))
  useKeyPress(['e'], (pressed) => (keys.current.leftSide = pressed))
  useKeyPress(['q'], (pressed) => (keys.current.rightSide = pressed))
  useKeyPress(['z'], (pressed) => (keys.current.stop = pressed))

  return keys
}
