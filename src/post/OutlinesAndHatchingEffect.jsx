import React, { forwardRef, useMemo } from 'react'
import { Effect, RenderPass, NormalPass } from 'postprocessing';
import {
    Uniform,
    WebGLRenderTarget,
    TextureLoader,
    RepeatWrapping
  } from "three";
  import { shader as sobel } from "./shaders/sobel.js";
  import { shader as aastep } from "./shaders/aastep.js";
  import { shader as luma } from "./shaders/luma.js";
  import { shader as darken } from "./shaders/blend-darken.js";
import { useThree } from '@react-three/fiber';
  
  
const fragmentShader = `
  precision highp float;
  
  uniform sampler2D colorTexture;
  uniform sampler2D normalTexture;
  uniform float scale;
  uniform float thickness;
  uniform float angle;
  uniform vec2 uResolution;
  uniform sampler2D paperTexture;
  
  ${sobel}
  
  ${luma}
  
  ${aastep}
  
  ${darken}
  
  #define TAU 6.28318530718
  
  #define LEVELS 15
  #define fLEVELS float(LEVELS)
  
  float sampleSrc(in sampler2D src, in vec2 uv) {
    vec4 color = texture(src, uv);
    float l = luma(color.rgb);
    return l;
  }
  
  float sampleStep(in sampler2D src, in vec2 uv, in float level) {
    float l = sampleSrc(src, uv);
    l = round(l*fLEVELS) / fLEVELS;
    return l > level ? 1. : 0.;
  }
  
  float findBorder(in sampler2D src, in vec2 uv, in vec2 resolution, in float level){
      float x = (thickness / 2.) / resolution.x;
      float y = (thickness / 2.) / resolution.y;
      float horizEdge = 0.;
      horizEdge -= sampleStep(src, vec2( uv.x - x, uv.y - y ), level ) * 1.0;
      horizEdge -= sampleStep(src, vec2( uv.x - x, uv.y     ), level ) * 2.0;
      horizEdge -= sampleStep(src, vec2( uv.x - x, uv.y + y ), level ) * 1.0;
      horizEdge += sampleStep(src, vec2( uv.x + x, uv.y - y ), level ) * 1.0;
      horizEdge += sampleStep(src, vec2( uv.x + x, uv.y     ), level ) * 2.0;
      horizEdge += sampleStep(src, vec2( uv.x + x, uv.y + y ), level ) * 1.0;
      float vertEdge = 0.;
      vertEdge -= sampleStep(src, vec2( uv.x - x, uv.y - y ), level ) * 1.0;
      vertEdge -= sampleStep(src, vec2( uv.x    , uv.y - y ), level ) * 2.0;
      vertEdge -= sampleStep(src, vec2( uv.x + x, uv.y - y ), level ) * 1.0;
      vertEdge += sampleStep(src, vec2( uv.x - x, uv.y + y ), level ) * 1.0;
      vertEdge += sampleStep(src, vec2( uv.x    , uv.y + y ), level ) * 2.0;
      vertEdge += sampleStep(src, vec2( uv.x + x, uv.y + y ), level ) * 1.0;
      float edge = sqrt((horizEdge * horizEdge) + (vertEdge * vertEdge));
      return edge;
  }
  
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 lUv = uv;
    vec2 size = vec2(textureSize(colorTexture, 0));
    
    float c = 0.;
    float col = 0.;
    float hatch = 1.;
  
    for(int i=0; i<LEVELS; i++) {
      vec2 tUv = lUv;
      float f = float(i) / float(LEVELS);
      float ss = scale * mix(1., 4., f);
  
      vec4 color = texture(colorTexture, tUv);
      float l = luma(color.rgb);
      l = round(l * float(LEVELS)) / float(LEVELS);
  
      float b = findBorder(colorTexture, tUv, size, f);
      b = clamp(b - 5.*l, 0., 1.);
      c += b;
    
      col += l / fLEVELS;
  
      if(l<.35) {
  
        float a = angle + mix(0., 2. * TAU, l);
        float s = sin(a);
        float c = cos(a);
        mat2 rot = mat2(c, -s, s, c);
        tUv = rot * tUv;
  
        float e = 1.;
        float threshold = mix(100., 800., 2.*l);
        float v = abs(mod(tUv.y*size.y+float(i)*threshold/fLEVELS, threshold));
        // if (l < .005) {
        //   // float a = angle + (mix(0., 2. * TAU, 0.1) / 2.);
        //   // float s = cos(a);
        //   // float c = sin(a);
        //   // mat2 rot = mat2(c, -s, s, c);
        //   vec2 ttUv = (1. - rot) * tUv;
        //   v = abs(mod(ttUv.y*size.y+float(i)*threshold/fLEVELS, threshold));
        // }
        if (v < e) {
          v = 0.;
        } else {
          v = 1.;
        }
        hatch *= v;
      }
    }
  
    float ss = scale * 1.;
    
    // do we want to color the edges?
    float colorEdge = length(sobel(colorTexture, lUv, size, thickness)) * 2.;
    colorEdge = aastep(.5, colorEdge);
    c += colorEdge;
    col = clamp(col * 2., 0., 1.);
    hatch = 1. - hatch;
  
    vec4 paper = texture(paperTexture, .00025 * vUv*size);
    outputColor = vec4(1., 1., 1., 1.);
    
    vec3 coltex = texture(colorTexture, lUv).rgb;
    outputColor.rgb = blendDarken(paper.rgb, outputColor.rgb, 1.-col);
    outputColor.rgb = blendDarken(outputColor.rgb, coltex, c);
    outputColor.rgb = blendDarken(outputColor.rgb, coltex, hatch);
    outputColor.rgb = mix(outputColor.rgb, coltex, 0.4);
    // outputColor.rgb = texture(normalTexture, vUv).rgb;
    outputColor.a = 1.;
  }
`;
//TODO: refactor this based on https://codesandbox.io/s/volumetric-light-w633u
class OutlinesAndHatchingEffect extends Effect {
    constructor(scene, camera) {
        super('OutlinesAndHatchingEffect', fragmentShader, {
            uniforms: new Map([
                ['colorTexture', new Uniform(null)],
                ['normalTexture', new Uniform(null)],
                ['scale', new Uniform(1)],
                ['thickness', new Uniform(1)],
                ['angle', new Uniform(2)],
                ['paperTexture', new Uniform()],
            ])
        });


        this.colorPass = new RenderPass(scene, camera);
        this.normalPass = new NormalPass(scene, camera);

        this.uniforms.get('normalTexture').value = this.normalPass.renderTarget.texture;

        this.renderTarget = new WebGLRenderTarget(1, 1);
        this.uniforms.get('colorTexture').value = this.renderTarget.texture;

        
        this.paper = new TextureLoader().load('./Watercolor_ColdPress.jpg', (res) => {
          res.wrapS = res.wrapT = RepeatWrapping;
          return res;
        });
        this.uniforms.get('paperTexture').value = this.paper;
    }
    
    setSize(w, h) {
        this.colorPass.setSize(w, h);
        this.normalPass.setSize(w, h);
        this.renderTarget.setSize(w, h);
    }

    update(renderer) {
        this.normalPass.render(renderer, null, this.renderTarget);
        this.colorPass.render(renderer, this.renderTarget, this.renderTarget)
    }

}

const PostEffect = forwardRef((_, ref) => {
  const { scene, camera } = useThree();

  const effect = useMemo(() => new OutlinesAndHatchingEffect(scene, camera), [])
  return <primitive ref={ref} object={effect} />
})

export default PostEffect