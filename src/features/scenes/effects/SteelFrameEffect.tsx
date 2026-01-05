import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, Mesh, ShaderMaterial } from "three";

type SteelFrameEffectProps = {
  beatIntensity?: number;
  speed?: number;
};

export const SteelFrameEffect = ({
  beatIntensity = 0,
  speed = 1.0,
}: SteelFrameEffectProps) => {
  const meshRef = useRef<Mesh>(null);

  // ボリューメトリック鉄骨トンネル用のシェーダーマテリアル
  const material = useMemo(() => {
    return new ShaderMaterial({
      transparent: true,
      side: BackSide, // 内側から描画
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vCameraPosition;
        
        void main() {
          vUv = uv;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vCameraPosition = cameraPosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform float u_beatIntensity;
        uniform float u_speed;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vCameraPosition;
        
        const float EPS = 0.001;
        
        // 繰り返し関数
        vec2 onRep(vec2 p, float interval) {
          return mod(p, interval) - interval * 0.5;
        }
        
        // バー（角材）の距離関数
        float barDist(vec2 p, float interval, float width) {
          return length(max(abs(onRep(p, interval)) - width, 0.0));
        }
        
        // チューブ（丸穴）の距離関数
        float tubeDist(vec2 p, float interval, float width) {
          return length(onRep(p, interval)) - width;
        }
        
        // シーン全体の距離関数
        float sceneDist(vec3 p) {
          // 中央部分（歌詞表示エリア）を避けるためのマスク
          vec3 centerMask = abs(p);
          float centerExclusion = 1.0;
          
          // 中央の円柱状の領域を除外（歌詞表示エリア）
          float centerRadius = 3.0;
          float centerDistance = length(p.xy);
          if (centerDistance < centerRadius) {
            centerExclusion = smoothstep(2.0, 3.0, centerDistance);
          }
          
          // サイリウム感のある細い柱構造（凸凹なし）
          float pillar_x = tubeDist(p.yz, 1.0, 0.02); // 細いサイリウム
          float pillar_y = tubeDist(p.xz, 1.0, 0.02); // 細いサイリウム
          float pillar_z = tubeDist(p.xy, 1.0, 0.02); // 細いサイリウム
          
          // 3方向の柱の組み合わせ（シンプル構造）
          float result = min(min(pillar_x, pillar_y), pillar_z);
          
          // 中央部分の除外を適用
          result = max(result, -centerExclusion * 10.0 + 10.0);
          
          return result;
        }
        
        // 法線計算
        vec3 getNormal(vec3 p) {
          return normalize(vec3(
            sceneDist(p + vec3(EPS, 0.0, 0.0)) - sceneDist(p + vec3(-EPS, 0.0, 0.0)),
            sceneDist(p + vec3(0.0, EPS, 0.0)) - sceneDist(p + vec3(0.0, -EPS, 0.0)),
            sceneDist(p + vec3(0.0, 0.0, EPS)) - sceneDist(p + vec3(0.0, 0.0, -EPS))
          ));
        }
        
        // ボリューメトリックレンダリング
        vec4 volumetricRender(vec3 ro, vec3 rd) {
          vec3 color = vec3(0.0);
          float alpha = 0.0;
          float t = 0.1;
          
          for(int i = 0; i < 48; i++) {
            vec3 p = ro + rd * t;
            float d = sceneDist(p);
            
            if (d < 0.1) {
              // 距離に基づく密度計算
              float density = 1.0 - smoothstep(0.0, 0.1, d);
              density = pow(density, 1.5);
              
              if (density > 0.01) {
                // 法線計算
                vec3 normal = getNormal(p);
                
                // ライティング
                vec3 lightDir = normalize(vec3(1.0, 1.0, -2.0));
                float diffuse = clamp(dot(lightDir, normal), 0.1, 1.0);
                
                // ライトグリーンのサイリウム色
                vec3 baseColor = vec3(0.2, 1.0, 0.4); // ライトグリーン
                
                // サイリウムらしいエミッシブ効果（ビート連動なし）
                float emissive = 0.8 + 0.4 * sin(u_time * 3.0);
                vec3 glowColor = vec3(0.3, 1.0, 0.5) * emissive;
                
                vec3 sampleColor = baseColor * diffuse + glowColor;
                
                // 深度フォグ効果
                float fog = 1.0 - smoothstep(5.0, 20.0, t);
                sampleColor *= fog;
                
                // アルファブレンディング（透明度を調整）
                float sampleAlpha = density * 0.12 * fog; // 0.2 から 0.12 に減少
                color += sampleColor * sampleAlpha * (1.0 - alpha);
                alpha += sampleAlpha * (1.0 - alpha);
                
                if (alpha > 0.95) break;
              }
              
              t += max(d * 0.5, 0.02);
            } else {
              t += d * 0.8;
            }
            
            if (t > 20.0) break;
          }
          
          return vec4(color, alpha);
        }
        
        void main() {
          // ワールド座標系でのレイ設定
          vec3 ro = vCameraPosition;
          vec3 rd = normalize(vWorldPosition - vCameraPosition);
          
          // カメラ位置に基づく調整
          vec3 adjustedRo = ro + vec3(u_mouse.x - 0.5, u_mouse.y - 0.5, u_time * u_speed);
          
          // ボリューメトリックレンダリング実行
          vec4 result = volumetricRender(adjustedRo, rd);
          
          // 深度による色の調整
          float depth = length(vWorldPosition - vCameraPosition);
          result.rgb += 0.02 * depth;
          
          gl_FragColor = result;
        }
      `,
      uniforms: {
        u_time: { value: 0 },
        u_beatIntensity: { value: 0 },
        u_speed: { value: speed },
        u_resolution: { value: [window.innerWidth, window.innerHeight] },
        u_mouse: { value: [0.5, 0.5] },
      },
    });
  }, [speed]);

  useFrame((state) => {
    if (material) {
      material.uniforms.u_time.value = state.clock.getElapsedTime();
      material.uniforms.u_beatIntensity.value = beatIntensity;

      // カメラ位置を疑似マウス位置として使用
      const mouseX = (state.camera.position.x + 10) / 20;
      const mouseY = (state.camera.position.y + 10) / 20;
      material.uniforms.u_mouse.value = [mouseX, mouseY];
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[25, 25, 25]} />
      <primitive object={material} />
    </mesh>
  );
};
