import React from "react";
import { Composition } from "remotion";
import { DandelionVideo } from "./Dandelion";

export const FPS = 30;
export const WIDTH = 1536;
export const HEIGHT = 2048;
export const DURATION = 1020; // 34s

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Dandelion"
      component={DandelionVideo}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
