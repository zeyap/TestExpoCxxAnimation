# Expo 57 / React Native 0.87 C++ Animated test app

This app intentionally runs Expo SDK 57 with React Native 0.87.1 to exercise
React Native's C++ Native Animated implementation. The native build uses the
stable release-level defaults with one override:

- `cxxNativeAnimatedEnabled`: `true`
- `useSharedAnimatedBackend`: `false`

Open the **RNTester** tab to see the values read from the running binary and to
run the focused Native Animated tests.

This is an experimental version combination: Expo SDK 57 normally targets
React Native 0.86. The checked-in `patch-package` patches provide the small
React Native and Expo compatibility changes needed by this app. Keep the exact
dependency versions in `package.json`; running `npx expo install --fix` would
restore Expo's default React Native version.

## Build and run

```bash
npm ci
npm run ios
```

The app must use a development build; Expo Go does not contain this custom
React Native binary. `expo-build-properties` is configured to build React
Native from source.

## Original Expo starter notes

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
