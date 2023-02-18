import * as THREE from 'three';
import { MathUtils } from 'three';

const degToRad270 = MathUtils.degToRad(270);
export class Boid {
    constructor() {
      this.acceleration = new THREE.Vector3();
      this.angle = THREE.MathUtils.randFloat(- Math.PI * 2, Math.PI * 2);
      this.velocity = new THREE.Vector3(Math.cos(this.angle), 0, Math.sin(this.angle))
    
      // const spread = _NUM_BOIDS / 2;
      this.position = new THREE.Vector3(
        THREE.MathUtils.randFloat(- 20, 20),
        THREE.MathUtils.randFloat(- 120, 120),
        THREE.MathUtils.randFloat(- 20, 20),
      );
  
  
      this.maxSpeed = 2;
      this.maxForce = 0.04;
      this.safeDistance = 80;
  
      this.cohesionPerception = 25;
      this.separationPerception = 15;
      this.alignmentPerception = 20;
      this.cohesionStrength = 1;
      this.alignmentStrength = 1;
      this.separationStrength = 2;
      this.collisionSafeDistance = 160;
      this.boundary = 400;
      if (window.innerWidth < 500) {
        this.boundary = 250;
      }
    }
  
  
    update() {
  
      this.velocity.add(this.acceleration);
  
      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.normalize();
        this.velocity.multiplyScalar(this.maxSpeed);
      }
  
      this.position.add(this.velocity);
      const matrix = new THREE.Matrix4();
      matrix.lookAt(
        new THREE.Vector3(0, 0, 0),
        this.velocity,
        new THREE.Vector3(0, 1, 0)
      );
      this.ref.quaternion.setFromRotationMatrix(matrix);
      this.ref.rotateZ(degToRad270);
      this.ref.position.add(this.velocity);
  
      this.acceleration.multiplyScalar(0);
    }
  
    calculateSteeringForces(boids) {
    
      const separation = new THREE.Vector3(0, 0 ,0);
      let separationCount = 0;
  
      let alignment = new THREE.Vector3(0, 0, 0);
      let alignmentCount = 0;
  
      let cohesion = new THREE.Vector3(0, 0 ,0);
      let cohesionCount = 0;
      
      let i = boids.length;
      while (i--) {
      
        if (boids[i] !== this) {
          const d = this.position.distanceTo(boids[i].position);
  
          if (d > 0 && d < this.separationPerception) {
            const diff = this.position.clone().sub(boids[i].position);
            diff.normalize();
            diff.divideScalar(d);
            separation.add(diff);
            separationCount++;
          }
  
          if (d > 0 && d < this.alignmentPerception) {
            alignment.add(boids[i].velocity ?? new THREE.Vector3());
            alignmentCount++;
          }
  
          if (d > 0 && d < this.cohesionPerception) {
            cohesion.add(boids[i].position);
            cohesionCount++;
          }
        }
      
      }
  
      if (separationCount > 0) {
        separation.divideScalar(separationCount);
      }
      if (separation.length() > 0 ) {
        separation.normalize();
        separation.multiplyScalar(this.maxSpeed);
        separation.sub(this.velocity);
      }
          
      if (separation.length() > this.maxForce) {
        separation.normalize();
        separation.multiplyScalar(this.maxForce);
      }
  
      if (alignmentCount > 0) {
        alignment.divideScalar(alignmentCount);
        alignment.normalize();
        alignment.multiplyScalar(this.maxSpeed);
        const steer = alignment.clone().sub(this.velocity);
              
        if (steer.length() > this.maxForce) {
          steer.normalize();
          steer.multiplyScalar(this.maxForce);
        }
        alignment = steer;
      }
      if (cohesionCount > 0) {
        cohesion.divideScalar(cohesionCount);
        cohesion = this.seek(cohesion);
      }
      
      separation.multiplyScalar(this.separationStrength);
      alignment.multiplyScalar(this.alignmentStrength);
      cohesion.multiplyScalar(this.cohesionStrength);
  
      return separation.add(alignment).add(cohesion);
  
    }
    flock(boids, playerRef) {
  
      const steering = this.calculateSteeringForces(boids);
      const playerSteering = this.calculateSteeringForces([playerRef.current]);
      const boundary = this.boundaryCollision();
      const collision = this.collision(this.ref.airshipRefs.current);
      const groundAvoidance = this.groundAvoidance();
      collision.multiplyScalar(this.separationStrength * 2);
      groundAvoidance.multiplyScalar(this.separationStrength);
      boundary.multiplyScalar(this.separationStrength);
  
      this.acceleration
        .add(steering)
        .add(playerSteering)
        .add(boundary)
      
      // Preferentially move in x/z dimension
      this.acceleration.multiply(new THREE.Vector3(1, 0.5, 1));
      this.acceleration
        .add(collision)
        .add(groundAvoidance);
  
    }
  
    seek(target) {
      const desired = target.clone().sub(this.position);
      desired.normalize();
      desired.multiplyScalar(this.maxSpeed);
  
      const steer = desired.sub(this.velocity);
      
      if (steer.length() > this.maxForce) {
        steer.normalize();
        steer.multiplyScalar(this.maxForce);
      }
      return steer;
    }
  
    groundAvoidance() {
  
      let force = new THREE.Vector3(0, 0, 0);
  
      if (this.position.y < 15) {
        force = new THREE.Vector3(0, 15 - this.position.y, 0);
      }
  
      return force;
  
    }
  
    separate(boids) {
      const steer = new THREE.Vector3();
      let count = 0;
  
      let i = boids.length;
      while (i--) {
        if (boids[i] !== this) {
          const d = this.position.distanceTo(boids[i].position);
  
          if (d > 0 && d < this.separationPerception) {
            const diff = this.position.clone().sub(boids[i].position);
            diff.normalize();
            diff.divideScalar(d);
            steer.add(diff);
            count++;
          }
        }
      }
      if (count > 0) {
        steer.divideScalar(count);
      }
      if (steer.length() > 0 ) {
        steer.normalize();
        steer.multiplyScalar(this.maxSpeed);
        steer.sub(this.velocity);
      }
          
      if (steer.length() > this.maxForce) {
        steer.normalize();
        steer.multiplyScalar(this.maxForce);
      }
      return steer;
    }
  
    align(boids) {
      const sum = new THREE.Vector3();
      let count = 0;
  
      let i = boids.length;
      while (i--) {
        if (boids[i] !== this) {
          const d = this.position.distanceTo(boids[i].position);
          if (d > 0 && d < this.alignmentPerception) {
            sum.add(boids[i].velocity);
            count++;
          }
        }
      }
  
      if (count > 0) {
        sum.divideScalar(count);
        sum.normalize();
        sum.multiplyScalar(this.maxSpeed);
        const steer = sum.clone().sub(this.velocity);
              
        if (steer.length() > this.maxForce) {
          steer.normalize();
          steer.multiplyScalar(this.maxForce);
        }
        return steer;
      } else {
        return new THREE.Vector3(0, 0, 0);
      }
    }
  
    cohesion(boids) {
      const sum = new THREE.Vector3();
      let count = 0;
      
      let i = boids.length;
      while (i--) {
        if (boids[i] !== this) {
          const d = this.position.distanceTo(boids[i].position);
          if (d > 0 && d < this.cohesionPerception) {
            sum.add(boids[i].position);
            count++;
          }
        }
      }
  
      if (count > 0) {
        sum.divideScalar(count);
        return this.seek(sum);
      } else {
        return new THREE.Vector3(0, 0 ,0);
      }
  
    }
  
    collision(colliders) {
      const ray = new THREE.Ray(this.position, this.velocity);
      const force = new THREE.Vector3(0, 0, 0);
  
      for (const c of colliders) {
        const dist = this.position.distanceTo(c.position)
        if (dist > this.collisionSafeDistance) {
          continue;
        }
        
        const result = ray.intersectBox(c.AABB, new THREE.Vector3());
        if (result) {
          const dirToCenter = c.position.clone().sub(this.position).normalize();
          const dirToCollision = result.clone().sub(this.position).normalize();
          const steeringDirection = dirToCollision.sub(dirToCenter).normalize().multiplyScalar(1/dist);
          force.add(steeringDirection);
        }
      }
      return force;
    }
    
    boundaryCollision() {
  
      const distance = this.boundary - this.position.length() - 1;
  
      const steerVector = this.position.clone();
      steerVector.normalize();
      steerVector.multiplyScalar(-1 / (Math.pow(distance, 2)));
      steerVector.multiplyScalar(Math.pow(this.velocity.length(), 3));
      return steerVector;
    }
  
  }
