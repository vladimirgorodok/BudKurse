// Powered by OnSpace.AI
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CYAN = '#00FFFF';

// Split point — lower portion of screen
const SPLIT = height * 0.65;

// Pre-computed static values
const PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % width,
  y: (i * 53 + 7) % height,
  delay: (i * 200) % 3000,
  duration: 2000 + (i * 173) % 2000,
}));

const TECH_LINES_TOP = [
  { w: '28%', top: '18%', left: '5%' },
  { w: '15%', top: '35%', left: '60%' },
  { w: '22%', top: '52%', left: '20%' },
  { w: '18%', top: '68%', left: '45%' },
  { w: '30%', top: '80%', left: '10%' },
  { w: '12%', top: '25%', left: '75%' },
];
const TECH_LINES_BOTTOM = [
  { w: '20%', top: '15%', left: '55%' },
  { w: '25%', top: '35%', left: '8%' },
  { w: '14%', top: '55%', left: '70%' },
  { w: '32%', top: '68%', left: '15%' },
  { w: '16%', top: '80%', left: '40%' },
  { w: '24%', top: '88%', left: '60%' },
];

const GRID_H = Array.from({ length: 14 }, (_, i) => ({ top: (i / 14) * height }));
const GRID_V = Array.from({ length: 10 }, (_, i) => ({ left: (i / 10) * width }));

// ─── Fingerprint SVG ─────────────────────────────────────────────────────────
const FingerprintIcon = memo(function FingerprintIcon({ size = 72 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2 + 4;
  const color = CYAN;
  const op = 0.45;

  // Fingerprint: arching concentric curves widening outward
  const ridges = [
    // innermost small arch
    `M ${cx - 7},${cy + 2} Q ${cx},${cy - 10} ${cx + 7},${cy + 2}`,
    // 2nd
    `M ${cx - 14},${cy + 5} Q ${cx},${cy - 20} ${cx + 14},${cy + 5} Q ${cx + 16},${cy + 12} ${cx + 10},${cy + 18} Q ${cx},${cy + 22} ${cx - 10},${cy + 18} Q ${cx - 16},${cy + 12} ${cx - 14},${cy + 5}`,
    // 3rd
    `M ${cx - 22},${cy + 6} Q ${cx},${cy - 30} ${cx + 22},${cy + 6} Q ${cx + 26},${cy + 16} ${cx + 18},${cy + 26} Q ${cx},${cy + 32} ${cx - 18},${cy + 26} Q ${cx - 26},${cy + 16} ${cx - 22},${cy + 6}`,
    // 4th
    `M ${cx - 30},${cy + 4} Q ${cx},${cy - 40} ${cx + 30},${cy + 4} Q ${cx + 36},${cy + 18} ${cx + 26},${cy + 32} Q ${cx},${cy + 40} ${cx - 26},${cy + 32} Q ${cx - 36},${cy + 18} ${cx - 30},${cy + 4}`,
    // 5th outer
    `M ${cx - 8},${cy + 20} Q ${cx},${cy + 28} ${cx + 8},${cy + 20}`,
    // top ridge continuation left
    `M ${cx - 30},${cy + 4} Q ${cx - 34},${cy - 4} ${cx - 24},${cy - 16} Q ${cx},${cy - 46} ${cx + 24},${cy - 16} Q ${cx + 34},${cy - 4} ${cx + 30},${cy + 4}`,
  ];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {ridges.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={1.4}
          fill="none"
          strokeOpacity={op - i * 0.02}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
});

// ─── Particle ────────────────────────────────────────────────────────────────
const Particle = memo(function Particle({
  x, y, delay, duration,
}: { x: number; y: number; delay: number; duration: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: CYAN,
        opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.2] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
          { scale: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 2, 1] }) },
        ],
      }}
    />
  );
});

// ─── ScanLine (shutter edge) ──────────────────────────────────────────────────
const ScanLine = memo(function ScanLine({ position }: { position: 'top' | 'bottom' }) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(tx, { toValue: 1, duration: 2000, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = tx.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });

  return (
    <Animated.View
      style={[
        styles.scanLine,
        position === 'top' ? { bottom: 0 } : { top: 0 },
        { transform: [{ translateX }] },
      ]}
    />
  );
});

// ─── PulsingDivider ───────────────────────────────────────────────────────────
const PulsingDivider = memo(function PulsingDivider({
  pulseAnim,
}: { pulseAnim: Animated.Value }) {
  const scaleX = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.0] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1.0, 0.4] });

  return (
    <View style={styles.dividerContainer} pointerEvents="none">
      {/* Static base line */}
      <View style={styles.dividerBase} />
      {/* Pulsing glow line */}
      <Animated.View
        style={[
          styles.dividerGlow,
          { opacity, transform: [{ scaleX }] },
        ]}
      />
      {/* Center dot */}
      <Animated.View
        style={[
          styles.dividerDot,
          {
            opacity,
            transform: [
              { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] }) },
            ],
          },
        ]}
      />
    </View>
  );
});

// ─── RotatingRing ─────────────────────────────────────────────────────────────
const RotatingRing = memo(function RotatingRing({
  size, duration, reverse,
}: { size: number; duration: number; reverse: boolean }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });

  const offset = (size - 120) / 2;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -offset,
        left: -offset,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: reverse ? 1 : 2,
        borderColor: reverse ? 'rgba(0,255,255,0.3)' : 'rgba(0,255,255,0.6)',
        borderStyle: 'dashed',
        transform: [{ rotate }],
      }}
    />
  );
});

// ─── SplashOverlay ────────────────────────────────────────────────────────────
interface Props {
  onFinish: () => void;
}

export function SplashOverlay({ onFinish }: Props) {
  const [isLocked, setIsLocked] = useState(true);

  const shutterTopY = useRef(new Animated.Value(0)).current;
  const shutterBottomY = useRef(new Animated.Value(0)).current;
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const lockScale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleUnlock = useCallback(() => {
    if (!isLocked) return;
    setIsLocked(false);

    // Flash
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.4, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();

    // Lock fades out
    Animated.parallel([
      Animated.timing(lockOpacity, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(lockScale, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();

    // Shutters open
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(shutterTopY, {
          toValue: -(SPLIT + 4),
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(shutterBottomY, {
          toValue: height - SPLIT + 4,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]).start(() => onFinish());
    }, 280);
  }, [isLocked]);

  const glowOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const glowScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#000D1A', '#00111F', '#000D1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Grid */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {GRID_H.map((g, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: g.top }]} />
        ))}
        {GRID_V.map((g, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: g.left }]} />
        ))}
      </View>

      {/* Particles */}
      {PARTICLES.map((p) => <Particle key={p.id} {...p} />)}

      {/* Shutter Top — height = SPLIT */}
      <Animated.View style={[styles.shutterTop, { transform: [{ translateY: shutterTopY }] }]}>
        <LinearGradient
          colors={['rgba(0,15,35,0.97)', 'rgba(0,35,70,0.93)', 'rgba(0,55,110,0.85)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <ScanLine position="top" />
        {TECH_LINES_TOP.map((l, i) => (
          <View key={i} style={[styles.techLine, { width: l.w as any, top: l.top as any, left: l.left as any }]} />
        ))}
        <View style={[styles.cornerTL, { borderColor: CYAN }]} />
        <View style={[styles.cornerTR, { borderColor: CYAN }]} />
        {/* Currency labels — positioned in the upper half of the top shutter */}
        <View style={styles.shutterLabel}>
          <Text style={styles.shutterCode}>BYN</Text>
          <Text style={styles.shutterSeparator}>·</Text>
          <Text style={styles.shutterCode}>USD</Text>
          <Text style={styles.shutterSeparator}>·</Text>
          <Text style={styles.shutterCode}>EUR</Text>
          <Text style={styles.shutterSeparator}>·</Text>
          <Text style={styles.shutterCode}>RUB</Text>
        </View>
      </Animated.View>

      {/* Shutter Bottom — height = height - SPLIT */}
      <Animated.View style={[styles.shutterBottom, { transform: [{ translateY: shutterBottomY }] }]}>
        <LinearGradient
          colors={['rgba(0,55,110,0.85)', 'rgba(0,35,70,0.93)', 'rgba(0,15,35,0.97)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <ScanLine position="bottom" />
        {TECH_LINES_BOTTOM.map((l, i) => (
          <View key={i} style={[styles.techLine, { width: l.w as any, top: l.top as any, left: l.left as any }]} />
        ))}
        <View style={[styles.cornerBL, { borderColor: CYAN }]} />
        <View style={[styles.cornerBR, { borderColor: CYAN }]} />
        <View style={styles.bottomBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>api.nbrb.by · Официальные данные</Text>
        </View>
      </Animated.View>

      {/* Flash overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: CYAN, opacity: flashOpacity }]}
        pointerEvents="none"
      />

      {/* Pulsing divider line + Lock — anchored at SPLIT */}
      <Animated.View
        style={[
          styles.lockWrapper,
          {
            top: SPLIT - 90, // center the 180px wrapper on the SPLIT line
            opacity: lockOpacity,
            transform: [{ scale: lockScale }],
          },
        ]}
      >
        {/* Rotating rings */}
        <RotatingRing size={180} duration={10000} reverse={false} />
        <RotatingRing size={140} duration={7000} reverse={true} />

        {/* Glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            { opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}
        />

        {/* Lock button with fingerprint */}
        <Pressable onPress={handleUnlock}>
          {({ pressed }) => (
            <View style={[styles.lockCircle, pressed && { opacity: 0.75 }]}>
              <FingerprintIcon size={72} />
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Pulsing divider line — at SPLIT */}
      <PulsingDivider pulseAnim={pulseAnim} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  // Grid
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.06)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,255,255,0.06)',
  },
  // Shutters
  shutterTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SPLIT + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,255,255,0.5)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 56,
  },
  shutterBottom: {
    position: 'absolute',
    top: SPLIT,
    left: 0,
    right: 0,
    height: height - SPLIT + 2,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,255,255,0.5)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: width * 0.4,
    height: 2,
    backgroundColor: CYAN,
    opacity: 0.9,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  techLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.25)',
  },
  // Corner accents
  cornerTL: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  // Shutter labels
  shutterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shutterCode: {
    color: 'rgba(0,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  shutterSeparator: {
    color: 'rgba(0,255,255,0.3)',
    fontSize: 13,
  },
  bottomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  badgeText: {
    color: 'rgba(0,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  // Divider
  dividerContainer: {
    position: 'absolute',
    top: SPLIT - 1,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 3,
  },
  dividerBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.25)',
  },
  dividerGlow: {
    position: 'absolute',
    width: width * 0.6,
    height: 3,
    borderRadius: 2,
    backgroundColor: CYAN,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  dividerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CYAN,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  // Lock
  lockWrapper: {
    position: 'absolute',
    left: width / 2 - 90,
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: CYAN,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  lockCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CYAN,
  },
});
