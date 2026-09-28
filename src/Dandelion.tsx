import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

/* ---------------- helpers ---------------- */

const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Wavy boundary between two color zones */
const WavyBand: React.FC<{
  y: number;
  amp: number;
  fill: string;
  opacity?: number;
}> = ({ y, amp, fill, opacity = 1 }) => {
  const path = React.useMemo(() => {
    const pts: string[] = [];
    const H = 2048;
    const W = 1536;
    let d = `M -50 ${y}`;
    for (let x = -50; x <= W + 50; x += 60) {
      const yy = y + Math.sin(x / 180) * amp + Math.sin(x / 57 + 2) * (amp * 0.4);
      d += ` L ${x} ${yy.toFixed(1)}`;
    }
    d += ` L ${W + 50} ${H + 50} L -50 ${H + 50} Z`;
    pts.push(d);
    return d;
  }, [y, amp]);
  return <path d={path} fill={fill} opacity={opacity} />;
};

/** Drifting dotted trajectory line */
const DottedTrail: React.FC<{ seed: number; progress: number }> = ({
  seed,
  progress,
}) => {
  const pts: [number, number][] = [];
  const startX = 700 + rand(seed) * 140;
  const startY = 500;
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x =
      startX +
      Math.sin(t * 6 + seed) * 180 * t +
      Math.sin(t * 13 + seed * 2) * 60 * t;
    const y = startY + t * 1200 * progress;
    pts.push([x, y]);
  }
  const shown = Math.floor(pts.length * Math.min(1, progress));
  const dots = pts.slice(0, shown).map(([x, y], i) => (
    <circle key={i} cx={x} cy={y} r={6} fill="white" opacity={0.85} />
  ));
  return <g>{dots}</g>;
};

/** Dandelion seed: white parasol + handle */
export const Seed: React.FC<{ size?: number }> = ({ size = 1 }) => (
  <g transform={`scale(${size})`}>
    <g>
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (-160 + i * 20) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={Math.cos(a) * 60}
            y2={Math.sin(a) * 60}
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={0} cy={0} r={16} fill="white" />
    </g>
    <path
      d="M 0 16 Q 10 60 4 100"
      stroke="white"
      strokeWidth={4}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

/** Open paper umbrella seen from above/side */
export const Umbrella: React.FC<{ color?: string }> = ({ color = "#fdf6e3" }) => (
  <g>
    <path
      d="M -90 0 A 90 90 0 0 1 90 0 Z"
      fill={color}
      stroke="#d8cfb8"
      strokeWidth={2}
    />
    {[-60, -30, 0, 30, 60].map((x) => (
      <line
        key={x}
        x1={x}
        y1={0}
        x2={0}
        y2={-88}
        stroke="#e4dcc6"
        strokeWidth={2}
      />
    ))}
    <path
      d="M 0 0 Q 14 60 6 96"
      stroke="#c9b98a"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

const Bird: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path
    d={`M ${x - 14 * s} ${y} Q ${x - 7 * s} ${y - 9 * s} ${x} ${y} Q ${x + 7 * s} ${
      y - 9 * s
    } ${x + 14 * s} ${y}`}
    stroke="#2f3b52"
    strokeWidth={4 * s}
    fill="none"
    strokeLinecap="round"
  />
);

/* ---------------- Scene 1: night particle field ---------------- */

const NightScene: React.FC = () => {
  const frame = useCurrentFrame();
  const PARTICLES = 260;
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070d" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        {Array.from({ length: PARTICLES }).map((_, i) => {
          const sx = rand(i * 3) * 1536;
          const sy = rand(i * 3 + 1) * 2048;
          const speed = 0.4 + rand(i * 7) * 1.4;
          const len = 12 + rand(i * 11) * 34;
          const x = (sx + frame * speed * 1.6) % 1700;
          const y = (sy + Math.sin(frame / 60 + i) * 8 + 2048) % 2048;
          const bright = 0.25 + rand(i * 5) * 0.75;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - len}
              y2={y + len * 0.12}
              stroke={`rgba(255,255,255,${bright})`}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          );
        })}
        {/* focal pale-yellow arc */}
        <path
          d={`M 560 ${1050 + Math.sin(frame / 40) * 6} Q 760 ${
            980 + Math.cos(frame / 40) * 8
          } 980 ${1120 + Math.sin(frame / 40 + 1) * 6}`}
          stroke="#f2e8c9"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" })}
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 2: rainy pond with umbrellas ---------------- */

const RainyPondScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2e6b62" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        {/* ripples */}
        {Array.from({ length: 14 }).map((_, i) => {
          const t = ((frame + i * 9) % 90) / 90;
          const x = 200 + rand(i * 13) * 1130;
          const y = 200 + rand(i * 17) * 1650;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={10 + t * 70}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={2}
              opacity={1 - t}
            />
          );
        })}
        {/* lily pads */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 100 + rand(i * 23) * 1330;
          const y = 150 + rand(i * 29) * 1750;
          const r = 40 + rand(i * 31) * 55;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={r} fill="#3d7a4a" />
              <path
                d={`M 0 0 L ${r} ${-r * 0.28} A ${r} ${r} 0 0 0 ${r} ${r * 0.28} Z`}
                fill="#2e6b62"
              />
            </g>
          );
        })}
        {/* white umbrellas scattered */}
        {Array.from({ length: 18 }).map((_, i) => (
          <g
            key={i}
            transform={`translate(${100 + rand(i * 37) * 1330} ${
              150 + rand(i * 41) * 1750
            }) rotate(${rand(i * 43) * 360}) scale(0.5)`}
          >
            <Umbrella />
          </g>
        ))}
        {/* rain streaks (denser at edges) */}
        {Array.from({ length: 90 }).map((_, i) => {
          const edge = rand(i * 47);
          const x = edge < 0.5 ? rand(i) * 1536 : rand(i) * 1536;
          const y = (rand(i * 53) * 2048 + frame * 26) % 2048;
          const o = edge < 0.35 ? 0.7 : 0.35;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - 8}
              y2={y + 46}
              stroke={`rgba(255,255,255,${o})`}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 3: pond with paper parasol + bank ---------------- */

const PondParasolScene: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 150], [0, 380], {
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#1f6b63" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        {/* wheat bank */}
        <WavyBand y={210} amp={40} fill="#c9b98a" />
        <WavyBand y={300} amp={30} fill="#8f9450" />
        {Array.from({ length: 40 }).map((_, i) => {
          const x = 30 + i * 39 + rand(i * 3) * 14;
          const sway = Math.sin(frame / 22 + i) * 10;
          return (
            <g key={i} transform={`translate(${x} ${250})`}>
              <path
                d={`M 0 0 Q ${sway} -60 ${sway * 1.6} -120`}
                stroke="#e6dcae"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx={sway * 1.6} cy={-124} rx={7} ry={16} fill="#f3ecd0" />
            </g>
          );
        })}
        {/* small animal on the bank */}
        <g transform="translate(260 240)">
          <ellipse cx={0} cy={0} rx={26} ry={18} fill="#7a5c3e" />
          <circle cx={20} cy={-12} r={12} fill="#7a5c3e" />
          <circle cx={26} cy={-16} r={4} fill="#3a2c1c" />
        </g>
        {/* water current lines */}
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 380 + i * 78;
          const ph = frame * 1.4 + i * 2;
          return (
            <path
              key={i}
              d={`M -40 ${y} Q 380 ${y - 26} 780 ${y} T 1580 ${y}`}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={3}
              fill="none"
              transform={`translate(${Math.sin(ph) * 26} 0)`}
            />
          );
        })}
        {/* lily pads + lotus */}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 150 + rand(i * 61) * 1200;
          const y = 480 + rand(i * 67) * 1350;
          const r = 55 + rand(i * 71) * 60;
          const bloom = rand(i * 73) > 0.5;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={r} fill="#4c8f4f" />
              <path
                d={`M 0 0 L ${r} ${-r * 0.25} A ${r} ${r} 0 0 0 ${r} ${r * 0.25} Z`}
                fill="#1f6b63"
              />
              {bloom && (
                <g>
                  {Array.from({ length: 7 }).map((_, p) => {
                    const a = (p / 7) * Math.PI * 2;
                    return (
                      <ellipse
                        key={p}
                        cx={Math.cos(a) * 26}
                        cy={Math.sin(a) * 26}
                        rx={16}
                        ry={10}
                        fill="#f2b8c6"
                        transform={`rotate(${(a * 180) / Math.PI} ${
                          Math.cos(a) * 26
                        } ${Math.sin(a) * 26})`}
                      />
                    );
                  })}
                  <circle r={10} fill="#f7e8a0" />
                </g>
              )}
            </g>
          );
        })}
        {/* drifting parasol + dotted trail */}
        <DottedTrail seed={5} progress={interpolate(frame, [10, 140], [0, 1], { extrapolateRight: "clamp" })} />
        <g transform={`translate(${420 + drift} ${700}) rotate(${Math.sin(frame / 30) * 8})`}>
          <ellipse cx={30} cy={70} rx={120} ry={26} fill="rgba(0,0,0,0.18)" />
          <Umbrella />
        </g>
        {/* dragonflies */}
        {Array.from({ length: 4 }).map((_, i) => {
          const x = 300 + rand(i * 83) * 950 + Math.sin(frame / 20 + i) * 60;
          const y = 600 + rand(i * 89) * 1200 + Math.cos(frame / 24 + i) * 40;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <line x1={-16} y1={0} x2={16} y2={0} stroke="white" strokeWidth={3} />
              <ellipse cx={0} cy={0} rx={5} ry={3} fill="white" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 4: wheat field, dandelion flying, birds ---------------- */

const WheatFieldScene: React.FC = () => {
  const frame = useCurrentFrame();
  const seedX = interpolate(frame, [0, 150], [760, 520], {
    easing: Easing.inOut(Easing.ease),
  });
  const seedY = interpolate(frame, [0, 150], [430, 1250], {
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#8f9450" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        <WavyBand y={520} amp={70} fill="#7a8b6f" />
        <WavyBand y={980} amp={90} fill="#6d7d63" />
        <WavyBand y={1450} amp={70} fill="#5f6f56" />
        {/* wheat stalks */}
        {Array.from({ length: 70 }).map((_, i) => {
          const x = 20 + i * 22 + rand(i * 97) * 14;
          const y = 480 + rand(i * 101) * 1500;
          const sway = Math.sin(frame / 18 + i * 0.7) * 16;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path
                d={`M 0 0 Q ${sway} -70 ${sway * 1.5} -140`}
                stroke="#e6dcae"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx={sway * 1.5} cy={-146} rx={6} ry={15} fill="#f3ecd0" />
            </g>
          );
        })}
        {/* red specks */}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle
            key={i}
            cx={rand(i * 103) * 1500}
            cy={rand(i * 107) * 1900}
            r={7}
            fill="#c94f3d"
          />
        ))}
        {/* birds */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Bird
            key={i}
            x={300 + rand(i * 109) * 900 + Math.sin(frame / 26 + i) * 40}
            y={600 + rand(i * 113) * 700 + Math.cos(frame / 30 + i) * 26}
            s={1.2}
          />
        ))}
        {/* dandelion seed + trail */}
        <DottedTrail seed={9} progress={interpolate(frame, [5, 130], [0, 1], { extrapolateRight: "clamp" })} />
        <g transform={`translate(${seedX} ${seedY}) rotate(${Math.sin(frame / 24) * 10})`}>
          <Seed size={1.6} />
        </g>
        {/* small creature bottom-right */}
        <g transform="translate(1330 1920)">
          <ellipse rx={24} ry={16} fill="#8a6a45" />
          <circle cx={18} cy={-10} r={10} fill="#8a6a45" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 5: rainy sky, falling umbrella ---------------- */

const RainySkyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fall = interpolate(frame, [0, 150], [-200, 1100], {
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#5b7f8a" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        {/* clouds */}
        {[
          [500, 800, 260],
          [1250, 260, 200],
          [1200, 1650, 230],
          [260, 200, 130],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={r * 1.5} ry={r * 0.8} fill="#f2ead8" />
            <ellipse cx={cx + r * 0.7} cy={cy - r * 0.3} rx={r} ry={r * 0.6} fill="#f2ead8" />
          </g>
        ))}
        {/* rain */}
        {Array.from({ length: 70 }).map((_, i) => {
          const y = (rand(i * 127) * 2048 + frame * 30) % 2048;
          const x = rand(i * 131) * 1536;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - 9}
              y2={y + 52}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          );
        })}
        {/* birds */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Bird
            key={i}
            x={250 + rand(i * 137) * 1050}
            y={400 + rand(i * 139) * 1200 + Math.sin(frame / 28 + i) * 22}
          />
        ))}
        {/* falling umbrella + tumbling petals */}
        <g transform={`translate(700 ${fall}) rotate(${Math.sin(frame / 26) * 12})`}>
          <Umbrella color="#f5edd8" />
        </g>
        {Array.from({ length: 7 }).map((_, i) => {
          const y = (fall + 300 + i * 180) % 2200;
          const x = 640 + Math.sin(frame / 18 + i * 2) * 90 + i * 26;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${frame * 4 + i * 40})`}>
              <ellipse rx={12} ry={7} fill="white" opacity={0.9} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 6: meadow, dandelion + butterflies ---------------- */

const MeadowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const seedY = interpolate(frame, [0, 150], [500, 1300], {
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fae5a" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        <WavyBand y={1700} amp={60} fill="#2e8b8b" />
        {/* grass blades */}
        {Array.from({ length: 160 }).map((_, i) => {
          const x = rand(i * 149) * 1536;
          const y = 250 + rand(i * 151) * 1750;
          const sway = Math.sin(frame / 16 + i * 0.6) * 20;
          const h = 90 + rand(i * 157) * 110;
          return (
            <path
              key={i}
              d={`M ${x} ${y} Q ${x + sway} ${y - h / 2} ${x + sway * 1.8} ${y - h}`}
              stroke={rand(i * 163) > 0.5 ? "#5d8f3e" : "#98c46b"}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        {/* flowers */}
        {Array.from({ length: 34 }).map((_, i) => {
          const x = rand(i * 167) * 1500;
          const y = 400 + rand(i * 173) * 1550;
          const yellow = rand(i * 179) > 0.4;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              {Array.from({ length: 6 }).map((_, p) => {
                const a = (p / 6) * Math.PI * 2;
                return (
                  <ellipse
                    key={p}
                    cx={Math.cos(a) * 13}
                    cy={Math.sin(a) * 13}
                    rx={9}
                    ry={6}
                    fill={yellow ? "#f0c53c" : "#f5f0e0"}
                    transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 13} ${
                      Math.sin(a) * 13
                    })`}
                  />
                );
              })}
              <circle r={6} fill={yellow ? "#c98a2c" : "#e8d9a0"} />
            </g>
          );
        })}
        {/* butterflies */}
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 200 + rand(i * 181) * 1100 + Math.sin(frame / 21 + i * 1.4) * 70;
          const y = 500 + rand(i * 191) * 1200 + Math.cos(frame / 25 + i) * 50;
          const flap = Math.abs(Math.sin(frame / 6 + i));
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <ellipse cx={-10} cy={0} rx={10 * (0.4 + flap * 0.6)} ry={8} fill="#e8875f" />
              <ellipse cx={10} cy={0} rx={10 * (0.4 + flap * 0.6)} ry={8} fill="#e8875f" />
              <line y1={-6} y2={6} stroke="#7a4a30" strokeWidth={3} />
            </g>
          );
        })}
        {/* dandelion head + drifting seeds */}
        <DottedTrail seed={3} progress={interpolate(frame, [5, 130], [0, 1], { extrapolateRight: "clamp" })} />
        <g transform={`translate(760 ${seedY - 60}) rotate(${Math.sin(frame / 26) * 8})`}>
          <Seed size={1.7} />
        </g>
        {Array.from({ length: 5 }).map((_, i) => {
          const t = ((frame * 0.8 + i * 40) % 160) / 160;
          return (
            <g
              key={i}
              transform={`translate(${760 + Math.sin(i * 2 + t * 7) * 220 * t} ${
                seedY + 120 + t * 500
              }) scale(${0.6 - t * 0.2}) rotate(${t * 120})`}
            >
              <Seed size={0.8} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 7: flower field ending ---------------- */

const FlowerFieldScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#79a94f" }}>
      <svg width="1536" height="2048" viewBox="0 0 1536 2048">
        {Array.from({ length: 150 }).map((_, i) => {
          const x = rand(i * 193) * 1536;
          const y = rand(i * 197) * 2048;
          const sway = Math.sin(frame / 17 + i * 0.55) * 18;
          const h = 80 + rand(i * 199) * 100;
          return (
            <path
              key={i}
              d={`M ${x} ${y + h / 2} Q ${x + sway} ${y} ${x + sway * 1.7} ${y - h / 2}`}
              stroke={rand(i * 211) > 0.5 ? "#4f8337" : "#94bf68"}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        {Array.from({ length: 46 }).map((_, i) => {
          const x = rand(i * 223) * 1500;
          const y = rand(i * 227) * 1950;
          const yellow = rand(i * 229) > 0.35;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.9 + rand(i) * 0.6})`}>
              {Array.from({ length: 6 }).map((_, p) => {
                const a = (p / 6) * Math.PI * 2;
                return (
                  <ellipse
                    key={p}
                    cx={Math.cos(a) * 15}
                    cy={Math.sin(a) * 15}
                    rx={10}
                    ry={7}
                    fill={yellow ? "#f0b93c" : "#f7f2e2"}
                    transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 15} ${
                      Math.sin(a) * 15
                    })`}
                  />
                );
              })}
              <circle r={7} fill={yellow ? "#c9852c" : "#ead9a2"} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- main sequence with crossfades ---------------- */

const SceneWrapper: React.FC<{
  from: number;
  to: number;
  fade: number;
  children: React.ReactNode;
}> = ({ from, to, fade, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  if (local < 0 || frame >= to) return null;
  const fFrames = fade * fps;
  const opacity =
    local < fFrames
      ? local / fFrames
      : to - frame < fFrames
      ? (to - frame) / fFrames
      : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const SCENES: { from: number; to: number; el: React.ReactNode }[] = [
  { from: 0, to: 105, el: <NightScene /> },
  { from: 95, to: 240, el: <RainyPondScene /> },
  { from: 230, to: 400, el: <PondParasolScene /> },
  { from: 390, to: 560, el: <WheatFieldScene /> },
  { from: 550, to: 700, el: <RainySkyScene /> },
  { from: 690, to: 880, el: <MeadowScene /> },
  { from: 870, to: 1020, el: <FlowerFieldScene /> },
];

export const DandelionVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070d" }}>
      {SCENES.map((s, i) => (
        <SceneWrapper
          key={i}
          from={s.from}
          to={s.to}
          fade={i === 0 ? 2.0 : 0.9}
        >
          {s.el}
        </SceneWrapper>
      ))}
    </AbsoluteFill>
  );
};
