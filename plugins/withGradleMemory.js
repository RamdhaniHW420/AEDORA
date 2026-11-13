const { withGradleProperties } = require("expo/config-plugins");

const SETTINGS = {
  "org.gradle.jvmargs":
    "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError",
  // x86 dan x86_64 hanya dipakai emulator, membuang keduanya memangkas waktu kompilasi native.
  reactNativeArchitectures: "armeabi-v7a,arm64-v8a",
};

module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter(
      (item) => !(item.type === "property" && item.key in SETTINGS),
    );
    for (const [key, value] of Object.entries(SETTINGS)) {
      cfg.modResults.push({ type: "property", key, value });
    }
    return cfg;
  });
};
