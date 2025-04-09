// Load environment variables from .env file
;(() => {
  // Default configuration
  window.APP_CONFIG = {
    apiUrl: "",
    apiKey: "",
    appName: "Calendar Notes Pro",
    debug: false,
    enableCloudSync: true,
    enableOfflineMode: true,
    maxStorageSize: 50, // in MB
  }

  // Try to load from .env if available
  fetch(".env")
    .then((response) => {
      if (!response.ok) {
        console.warn("No .env file found. Using default configuration.")
        return null
      }
      return response.text()
    })
    .then((text) => {
      if (!text) return

      // Parse .env file
      const lines = text.split("\n")
      lines.forEach((line) => {
        // Skip comments and empty lines
        if (line.startsWith("#") || !line.trim()) return

        // Parse key=value pairs
        const [key, value] = line.split("=").map((part) => part.trim())
        if (!key || value === undefined) return

        // Convert to appropriate types and store in config
        switch (key) {
          case "API_URL":
            window.APP_CONFIG.apiUrl = value
            break
          case "API_KEY":
            window.APP_CONFIG.apiKey = value
            break
          case "APP_NAME":
            window.APP_CONFIG.appName = value
            document.title = value
            break
          case "DEBUG":
            window.APP_CONFIG.debug = value.toLowerCase() === "true"
            break
          case "ENABLE_CLOUD_SYNC":
            window.APP_CONFIG.enableCloudSync = value.toLowerCase() === "true"
            break
          case "ENABLE_OFFLINE_MODE":
            window.APP_CONFIG.enableOfflineMode = value.toLowerCase() === "true"
            break
          case "MAX_STORAGE_SIZE":
            window.APP_CONFIG.maxStorageSize = Number.parseInt(value, 10) || 50
            break
        }
      })

      if (window.APP_CONFIG.debug) {
        console.log("Environment configuration loaded:", window.APP_CONFIG)
      }
    })
    .catch((error) => {
      console.error("Error loading .env file:", error)
    })
})()
