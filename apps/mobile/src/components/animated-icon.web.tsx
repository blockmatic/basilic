import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";

import classes from "./animated-icon.module.css";

const duration = 300;

export function AnimatedSplashOverlay() {
  return null;
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  100: {
    easing: Easing.elastic(1.2),
    transform: [{ scale: 1 }],
  },
  60: {
    easing: Easing.elastic(1.2),
    transform: [{ scale: 1.2 }],
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  100: {
    easing: Easing.elastic(1.2),
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  60: {
    easing: Easing.elastic(1.2),
    opacity: 0,
    transform: [{ scale: 1.2 }],
  },
});

const glowEntranceKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ rotateZ: "-180deg" }, { scale: 0.8 }],
  },
  100: {
    easing: Easing.elastic(0.7),
    opacity: 1,
    transform: [{ rotateZ: "0deg" }, { scale: 1 }],
  },
});

const longRunningRotationKeyframe = new Keyframe({
  0: { transform: [{ rotateZ: "0deg" }] },
  100: { transform: [{ rotateZ: "7200deg" }] },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        entering={longRunningRotationKeyframe.duration(60 * 1000 * 4)}
        style={styles.glow}
      >
        <Animated.View
          entering={glowEntranceKeyframe.duration(duration)}
          style={styles.glow}
        >
          <Image
            style={styles.glow}
            source={require("@/assets/images/logo-glow.png")}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={styles.background}
        entering={keyframe.duration(duration)}
      >
        <div className={classes.expoLogoBackground} />
      </Animated.View>

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
    height: 128,
    position: "absolute",
    width: 128,
  },
  container: {
    alignItems: "center",
    position: "absolute",
    top: 128 / 2 + 138,
    width: "100%",
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
