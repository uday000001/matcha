"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, useAspect } from "@react-three/drei";
import * as THREE from "three";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 202;

// Custom Shader Material for Liquid Typography
const LiquidTextMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uDistortion: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uDistortion;
    varying vec2 vUv;

    // Simple noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Sample the video/image sequence texture to get luminance
      vec4 texColor = texture2D(uTexture, vUv);
      float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

      // Create a fluid distortion based on texture luminance and time
      vec2 distortedUv = vUv;
      distortedUv.y += sin(vUv.x * 10.0 + uTime * 2.0) * 0.02 * luminance * uDistortion;
      distortedUv.x += cos(vUv.y * 10.0 + uTime * 1.5) * 0.02 * luminance * uDistortion;

      // Rich 3-stop gradient for a more pronounced effect
      vec3 veryDarkGreen = vec3(0.05, 0.20, 0.08); // Deep shadow green at the bottom
      vec3 vibrantMatcha = vec3(0.48, 0.75, 0.35); // Vibrant matcha in the middle
      vec3 brightPistachio = vec3(0.85, 0.98, 0.70); // Bright highlight at the top
      
      vec3 textColor = mix(veryDarkGreen, vibrantMatcha, smoothstep(0.0, 0.5, vUv.y));
      textColor = mix(textColor, brightPistachio, smoothstep(0.5, 1.0, vUv.y));

      // Darken the 'A T C' letters more significantly (roughly x from 0.15 to 0.7)
      float atcMask = smoothstep(0.10, 0.25, vUv.x) * (1.0 - smoothstep(0.60, 0.75, vUv.x));
      textColor = mix(textColor, textColor * 0.15, atcMask * 0.85); // 85% darker in the ATC region

      // Corner Glow Effect: Brighten the text at the corners
      vec2 distFromCenter = abs(vUv - 0.5);
      float cornerFactor = smoothstep(0.35, 0.5, max(distFromCenter.x, distFromCenter.y));
      vec3 glowColor = vec3(0.95, 1.0, 0.85); // Intense glowing white-green
      textColor = mix(textColor, glowColor, cornerFactor * 0.85);
      
      // We want to make the text diffuse and semi-transparent where liquid is strong
      float alpha = 0.9 - (luminance * 0.3);

      gl_FragColor = vec4(textColor, alpha);
    }
  `,
};

function Diagram() {
  const { viewport } = useThree();
  const diagramRef = useRef<any>(null);
  
  useFrame((state) => {
    if (diagramRef.current) {
      diagramRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={diagramRef} position={[0, 0, 0.05]}>
      {/* Outer Circle */}
      <mesh>
        <ringGeometry args={[viewport.height * 0.35, viewport.height * 0.35 + 2, 64]} />
        <meshBasicMaterial color="#FAFAF7" transparent opacity={0.15} />
      </mesh>
      
      {/* Inner Rotating Diamond */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[viewport.height * 0.25, viewport.height * 0.25 + 1, 4]} />
        <meshBasicMaterial color="#7BA05B" transparent opacity={0.15} />
      </mesh>
      
      {/* Subtle tick marks / cross */}
      <mesh>
        <planeGeometry args={[viewport.height * 0.75, 1]} />
        <meshBasicMaterial color="#FAFAF7" transparent opacity={0.05} />
      </mesh>
      <mesh>
        <planeGeometry args={[1, viewport.height * 0.75]} />
        <meshBasicMaterial color="#FAFAF7" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function Scene() {
  const { viewport } = useThree();
  const scale = useAspect(1920, 1080, 1); // Fixed aspect ratio (width, height, factor)
  
  const materialRef = useRef<any>(null);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  const { scrollYProgress } = useScroll();
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    setCurrentFrame(Math.floor(latest));
  });

  // Preload textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const frameNumber = i.toString().padStart(3, "0");
      loader.load(
        `/frames/ezgif-frame-${frameNumber}.jpg`,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          loadedTextures[i - 1] = tex;
          loadedCount++;
          if (loadedCount === FRAME_COUNT) {
            setTextures(loadedTextures);
          }
        }
      );
    }
  }, []);

  // Update shader uniforms
  useFrame((state) => {
    if (textures.length === FRAME_COUNT && materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uTexture.value = textures[currentFrame];
    }
  });

  return (
    <>
      {/* Background Image Sequence */}
      {textures.length === FRAME_COUNT && textures[currentFrame] && (
        <mesh scale={scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={textures[currentFrame]} />
        </mesh>
      )}

      {/* Subtle Diagram Behind Text */}
      <Diagram />

      {/* Reactive Typography */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={viewport.width * 0.15}
        anchorX="center"
        anchorY="middle"
        characters="MATCHA"
      >
        MATCHA
        <shaderMaterial
          ref={materialRef}
          attach="material"
          args={[LiquidTextMaterial]}
          transparent
        />
      </Text>
    </>
  );
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas orthographic camera={{ position: [0, 0, 5], zoom: 1 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
