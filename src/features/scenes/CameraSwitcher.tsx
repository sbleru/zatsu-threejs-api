import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { useKey } from "react-use";
import { Vector3 } from "three";

const vector3 = (x: number, y: number, z: number) => new Vector3(x, y, z);

export const CameraSwitcher = () => {
  const [pressedKeyCode, setPressedKeyCode] = useState("");
  const [pressedSpaceKey, setPressedSpaceKey] = useState(false);

  useKey(
    (e) => {
      setPressedKeyCode(e.code);
      switch (e.code) {
        case "Space":
          setPressedSpaceKey(true);
          break;
        default:
          break;
      }
      return true;
    },
    void 0,
    {},
    [setPressedKeyCode, setPressedSpaceKey],
  );

  useFrame((state) => {
    switch (pressedKeyCode) {
      // 正面アップ
      case "KeyE":
        state.camera.position.lerp(vector3(0, 0, 4), 0.03);
        break;
      // 正面引き
      case "KeyD":
        state.camera.position.lerp(vector3(0, 0, 16), 0.03);
        break;
      // 正面右上
      case "KeyR":
        state.camera.position.lerp(vector3(4, 4, 4), 0.03);
        break;
      // 正面左上
      case "KeyW":
        state.camera.position.lerp(vector3(-4, 4, 4), 0.03);
        break;
      // 正面左下
      case "KeyS":
        state.camera.position.lerp(vector3(-4, -4, 4), 0.03);
        break;
      // 正面右下
      case "KeyF":
        state.camera.position.lerp(vector3(4, -1, 6), 0.03);
        break;
      // 背面アップ
      case "KeyI":
        state.camera.position.lerp(vector3(0, 0, -4), 0.03);
        break;
      // 背面引き
      case "KeyK":
        state.camera.position.lerp(vector3(0, 0, -16), 0.03);
        break;
      // 背面右上
      case "KeyO":
        state.camera.position.lerp(vector3(-4, 4, -4), 0.03);
        break;
      // 背面左上
      case "KeyU":
        state.camera.position.lerp(vector3(4, 4, -4), 0.03);
        break;
      // 背面左下
      case "KeyJ":
        state.camera.position.lerp(vector3(4, -4, -4), 0.03);
        break;
      // 背面右下
      case "KeyL":
        state.camera.position.lerp(vector3(-4, -4, -4), 0.03);
        break;
      // case "Space":
      // スペースキーでランダムなカメラワーク
      // state.camera.position.lerp(vector3(2, 2, 4), 0.07);
      // break;
      // デフォルト
      default:
        state.camera.position.lerp(vector3(0, 0, 8), 0.03);
        break;
    }
    state.camera.lookAt(0, 0, 0);
    if (pressedSpaceKey) {
      state.camera.position.set(10, 3, -10);
      setPressedSpaceKey(false);
    }
  });

  return (
    <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
  );
};
