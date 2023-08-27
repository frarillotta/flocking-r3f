import { useEffect, useRef } from 'react'

export function useKeyPress(target, event) {
  useEffect(() => {
    const downHandler = ({ code }) => target.indexOf(code) !== -1 && event(true)
    const upHandler = ({ code }) => target.indexOf(code) !== -1 && event(false)
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
    leftJaw: false,
    rightJaw: false,
    stop: false,
    reset: false,
})
  useKeyPress(['KeyW'], (pressed) => (keys.current.forward = pressed))
  useKeyPress(['KeyS'], (pressed) => (keys.current.backward = pressed))
  useKeyPress(['KeyA'], (pressed) => (keys.current.left = pressed))
  useKeyPress(['KeyD'], (pressed) => (keys.current.right = pressed))
  useKeyPress(['ShiftLeft'], (pressed) => (keys.current.accelerate = pressed))
  useKeyPress(['KeyE'], (pressed) => (keys.current.leftJaw = pressed))
  useKeyPress(['KeyQ'], (pressed) => (keys.current.rightJaw = pressed))
  useKeyPress(['Space'], (pressed) => (keys.current.stop = pressed))
  useKeyPress(['KeyR'], (pressed) => (keys.current.reset = pressed))

  return keys
}
