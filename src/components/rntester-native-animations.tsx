/**
 * Adapted from React Native 0.87.1's RNTester NativeAnimationsExample (MIT).
 * https://github.com/facebook/react-native/blob/v0.87.1/packages/rn-tester/js/examples/NativeAnimation/NativeAnimationsExample.js
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FeatureFlags = {
  cxxNativeAnimatedEnabled: () => boolean;
  useSharedAnimatedBackend: () => boolean;
};

type NativeAnimatedFlags = {
  cxxNativeAnimatedEnabled: boolean;
  useSharedAnimatedBackend: boolean;
};

function readNativeAnimatedFlags(): NativeAnimatedFlags | null {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // React Native does not expose its internal feature-flag module as a typed public API.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const featureFlags = require(
      'react-native/src/private/featureflags/ReactNativeFeatureFlags'
    ) as FeatureFlags;
    return {
      cxxNativeAnimatedEnabled: featureFlags.cxxNativeAnimatedEnabled(),
      useSharedAnimatedBackend: featureFlags.useSharedAnimatedBackend(),
    };
  } catch {
    return null;
  }
}

function TestCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </ThemedView>
  );
}

function TestButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.textSecondary },
        pressed && styles.buttonPressed,
      ]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

function DriverComparison() {
  const [nativeValue] = useState(() => new Animated.Value(0));
  const [jsValue] = useState(() => new Animated.Value(0));
  const target = useRef(0);

  const run = () => {
    target.current = target.current === 0 ? 1 : 0;
    const config = {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      toValue: target.current,
    };

    Animated.timing(nativeValue, { ...config, useNativeDriver: true }).start();
    Animated.timing(jsValue, { ...config, useNativeDriver: false }).start();
  };

  const renderBox = (value: Animated.Value) => (
    <Animated.View
      style={[
        styles.box,
        {
          opacity: Animated.multiply(
            value.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }),
            value.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] })
          ),
          transform: [
            { translateX: value.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }) },
            { rotate: value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
          ],
        },
      ]}
    />
  );

  return (
    <TestCard title="RNTester: native and JS drivers">
      <ThemedText type="small" themeColor="textSecondary">
        Tap the card to compare the same timing graph on both drivers.
      </ThemedText>
      <Pressable onPress={run} style={styles.comparison}>
        <ThemedText type="small">Native driver</ThemedText>
        <View style={styles.track}>{renderBox(nativeValue)}</View>
        <ThemedText type="small">JavaScript driver</ThemedText>
        <View style={styles.track}>{renderBox(jsValue)}</View>
      </Pressable>
    </TestCard>
  );
}

function JsStallTest() {
  const [progress] = useState(() => new Animated.Value(0));
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => () => animation.current?.stop(), []);

  const run = () => {
    animation.current?.stop();
    progress.setValue(0);
    animation.current = Animated.timing(progress, {
      duration: 3000,
      easing: Easing.linear,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.current.start();

    setTimeout(() => {
      const stopAt = Date.now() + 1500;
      while (Date.now() < stopAt) {
        // Intentionally block JS. A native-driven animation should keep moving.
      }
    }, 250);
  };

  return (
    <TestCard title="Native driver during a JS stall">
      <ThemedText type="small" themeColor="textSecondary">
        The square should keep moving while JavaScript is blocked for 1.5 seconds.
      </ThemedText>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.box,
            {
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }) },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
              ],
            },
          ]}
        />
      </View>
      <TestButton label="Animate and block JS" onPress={run} />
    </TestCard>
  );
}

function ValueListenerTest() {
  const [value] = useState(() => new Animated.Value(0));
  const target = useRef(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = value.addListener(({ value: nextValue }) => setDisplayValue(nextValue));
    return () => value.removeListener(listener);
  }, [value]);

  const run = () => {
    target.current = target.current === 0 ? 1 : 0;
    Animated.timing(value, {
      duration: 1000,
      toValue: target.current,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TestCard title="RNTester: native value listener">
      <View style={styles.track}>
        <Animated.View style={[styles.box, { opacity: value }]} />
      </View>
      <ThemedText type="code">value: {displayValue.toFixed(3)}</ThemedText>
      <TestButton label="Toggle opacity" onPress={run} />
    </TestCard>
  );
}

function NativeScrollEventTest() {
  const [scrollX] = useState(() => new Animated.Value(0));

  return (
    <TestCard title="RNTester: native animated event">
      <Animated.View
        style={[
          styles.eventBox,
          {
            transform: [
              {
                rotate: scrollX.interpolate({
                  inputRange: [0, 300],
                  outputRange: ['0deg', '360deg'],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
      <Animated.ScrollView
        horizontal
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator>
        <View style={styles.scrollContent}>
          <ThemedText style={styles.scrollLabel}>Scroll horizontally to rotate the square</ThemedText>
        </View>
      </Animated.ScrollView>
    </TestCard>
  );
}

export function RNTesterNativeAnimations() {
  const theme = useTheme();
  const [flagValues] = useState(readNativeAnimatedFlags);

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.webMessage}>
        <ThemedText type="subtitle">RNTester Native Animated</ThemedText>
        <ThemedText themeColor="textSecondary">
          This suite exercises native React Native animation code and is available in the iOS and
          Android builds.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <ThemedText type="subtitle">RNTester Native Animated</ThemedText>
        <ThemedText themeColor="textSecondary">
          Ported from RNTester 0.87.1. These examples use React Native&apos;s core Animated API,
          not Reanimated.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.flagCard}>
          <FeatureFlagStatus
            expectedValue
            name="cxxNativeAnimatedEnabled"
            value={flagValues?.cxxNativeAnimatedEnabled ?? null}
          />
          <FeatureFlagStatus
            expectedValue={false}
            name="useSharedAnimatedBackend"
            value={flagValues?.useSharedAnimatedBackend ?? null}
          />
        </ThemedView>

        <DriverComparison />
        <JsStallTest />
        <ValueListenerTest />
        <NativeScrollEventTest />
      </View>
    </ScrollView>
  );
}

function FeatureFlagStatus({
  expectedValue,
  name,
  value,
}: {
  expectedValue: boolean;
  name: string;
  value: boolean | null;
}) {
  return (
    <View style={styles.flagRow}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: value === expectedValue ? '#30A46C' : '#E5484D' },
        ]}
      />
      <View style={styles.flagText}>
        <ThemedText type="smallBold">{name}</ThemedText>
        <ThemedText type="code">
          {value === null ? 'unavailable on this platform' : String(value)} (expected{' '}
          {String(expectedValue)})
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMessage: {
    alignSelf: 'center',
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  flagCard: {
    borderRadius: Spacing.three,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  flagRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flagText: {
    gap: Spacing.one,
  },
  statusDot: {
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  comparison: {
    gap: Spacing.two,
  },
  track: {
    backgroundColor: '#D7DBE0',
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  box: {
    backgroundColor: '#087EA4',
    borderRadius: 4,
    height: 36,
    width: 36,
  },
  eventBox: {
    alignSelf: 'center',
    backgroundColor: '#E5484D',
    borderRadius: 4,
    height: 48,
    width: 48,
  },
  scrollContent: {
    height: 70,
    justifyContent: 'center',
    width: 650,
  },
  scrollLabel: {
    paddingHorizontal: Spacing.three,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  buttonPressed: {
    opacity: 0.6,
  },
});
