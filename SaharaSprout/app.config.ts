import { ExpoConfig, ConfigContext } from '@expo/config';

const APP_NAME = "SaharaSprout";
const BUNDLE_IDENTIFIER = "com.saharasprout.app";
const PACKAGE_NAME = "com.saharasprout.app";
const PROJECT_SLUG = "SaharaSprout";
const EAS_PROJECT_ID = "342c5db1-38da-4c6a-b1c4-49cff5f880c7";
const SCHEME = "saharasprout";
const VERSION = "1.0.0";

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log("⚙️ Building SaharaSprout for:", process.env.APP_ENV);

  const envConfig = getDynamicAppConfig(
    (process.env.APP_ENV as "development" | "preview" | "production") || "development"
  );

  return {
    ...config,
    name: envConfig.name,
    slug: PROJECT_SLUG,
    version: VERSION,
    runtimeVersion: VERSION,
    orientation: "portrait",
    icon: envConfig.icon,
    scheme: envConfig.scheme,
    userInterfaceStyle: "automatic",
    updates: {
      url: "https://u.expo.dev/342c5db1-38da-4c6a-b1c4-49cff5f880c7",
    },
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: envConfig.bundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      package: envConfig.packageName,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "@react-native-google-signin/google-signin",
       "expo-localization",
      ["expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-maps",
        {
          "requestLocationPermission": "true",
          "locationPermission": "Allow $(PRODUCT_NAME) to use your location"
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      
    },
  };
};

const getDynamicAppConfig = (env: "development" | "preview" | "production") => {
  if (env === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: "./assets/images/icon.png",
      scheme: SCHEME,
    };
  }

  if (env === "preview") {
    return {
      name: `${APP_NAME}`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}`,
      packageName: `${PACKAGE_NAME}`,
      icon: "./assets/images/icon.png",
      scheme: `${SCHEME}`,
    };
  }

  // default = development
  return {
    name: `${APP_NAME}`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}`,
    packageName: `${PACKAGE_NAME}`,
    icon: "./assets/images/icon.png",
    scheme: `${SCHEME}`,
  };
};
