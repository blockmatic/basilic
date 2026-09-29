import { Image } from "expo-image";
import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const initialScaleFactor = Dimensions.get("screen").height / 90;
const duration = 600;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: initialScaleFactor }],
    },
    100: {
      easing: Easing.elastic(0.7),
      opacity: 0,
      transform: [{ scale: 1 }],
    },
    20: {
      opacity: 1,
    },
    70: {
      easing: Easing.elastic(0.7),
      opacity: 0,
    },
  });

  return (
    <Animated.View
      entering={splashKeyframe.duration(duration).withCallback((finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.backgroundSolidColor}
    />
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: initialScaleFactor }],
  },
  100: {
    easing: Easing.elastic(0.7),
    transform: [{ scale: 1 }],
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 1.3 }],
  },
  100: {
    easing: Easing.elastic(0.7),
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  40: {
    easing: Easing.elastic(0.7),
    opacity: 0,
    transform: [{ scale: 1.3 }],
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: "0deg" }],
  },
  100: {
    transform: [{ rotateZ: "7200deg" }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        entering={glowKeyframe.duration(60 * 1000 * 4)}
        style={styles.glow}
      >
        <Image
          style={styles.glow}
          source={require("@/assets/images/logo-glow.png")}
        />
      </Animated.View>

      <Animated.View
        entering={keyframe.duration(duration)}
        style={styles.background}
      />
      <Animated.View
        style={styles.imageContainer}
        entering={logoKeyframe.duration(duration)}
      >
        <Image
          style={styles.image}
          source={require("@/assets/images/expo-logo.png")}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    borderRadius: 40,
    // biome-ignore lint/style/useNamingConvention: React Native web style property
    experimental_backgroundImage: "linear-gradient(180deg, #3C9FFE, #0274DF)",
    width: 128,
    height: 128,
    position: "absolute",
  },
  backgroundSolidColor: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#208AEF",
    zIndex: 1000,
  },
  glow: {
    height: 201,
    position: "absolute",
    width: 201,
  },
  iconContainer: {
    alignItems: "center",
    height: 128,
    justifyContent: "center",
    width: 128,
    zIndex: 100,
  },
  image: {
    height: 71,
    position: "absolute",
    width: 76,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
