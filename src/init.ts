import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  setDebug,
  init as initSDK,
  closingBehavior,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the Telegram Mini App and configures all required dependencies.
 * 
 * This function performs the following operations:
 * 1. Sets up debug mode and tools
 * 2. Initializes the SDK
 * 3. Verifies component support
 * 4. Mounts UI components (miniApp, viewport)
 * 5. Mounts navigation components (backButton, closingBehavior)
 * 6. Restores application data
 * 
 * @param debug - Whether to enable debug mode with additional logging and tools
 * @throws Error if required components are not supported by the environment
 */
export function init(debug: boolean) {
  // Set @telegram-apps/sdk-react debug mode.
  setDebug(debug);
  debug && console.log('Initializing Telegram Mini App SDK in', debug ? 'debug' : 'production', 'mode');

  // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
  // Also, configure the package.
  initSDK();
  debug && console.log('SDK initialized successfully');

  // Add Eruda debugging tool if in debug mode
  if (debug) {
    console.log('Loading Eruda debugging tools...');
    import('eruda')
      .then((lib) => {
        lib.default.init();
        console.log('Eruda debugging tools loaded successfully');
      })
      .catch((error) => console.error('Failed to load Eruda:', error));
  }

  // Check if all required components are supported.
  if (!backButton.isSupported()) {
    debug && console.error('Back button is not supported in this environment');
    throw new Error('ERR_BACK_BUTTON_NOT_SUPPORTED');
  }

  if (!miniApp.isSupported()) {
    debug && console.error('Mini App is not supported in this environment');
    throw new Error('ERR_MINI_APP_NOT_SUPPORTED');
  }

  debug && console.log('All required components are supported');

  /**
   * Mounts UI-related components and binds their CSS variables
   */
  const mountUI = async () => {
    debug && console.log('Mounting UI components...');
    
    try {
      // Mount miniApp component and bind CSS variables
      debug && console.log('Mounting miniApp component...');
      await miniApp.mount();
      miniApp.bindCssVars();
      themeParams.bindCssVars();
      debug && console.log('miniApp component mounted successfully');
      
      // Mount viewport component and bind CSS variables
      debug && console.log('Mounting viewport component...');
      await viewport.mount();
      viewport.bindCssVars();
      debug && console.log('viewport component mounted successfully');
    } catch (error) {
      console.error('Failed to mount UI components:', error);
      throw error;
    }
  };

  /**
   * Mounts navigation-related components
   */
  const mountNavigation = () => {
    debug && console.log('Mounting navigation components...');
    
    // Mount back button
    debug && console.log('Mounting back button...');
    backButton.mount();
    debug && console.log('Back button mounted successfully');
    
    // Mount closing behavior if available
    if (closingBehavior.mount.isAvailable()) {
      debug && console.log('Mounting closing behavior...');
      closingBehavior.mount();
      debug && console.log('Closing behavior mounted successfully');
    } else {
      debug && console.log('Closing behavior is not available, skipping');
    }
  };

  /**
   * Restores application data
   */
  const restoreData = () => {
    debug && console.log('Restoring application data...');
    initData.restore();
    debug && console.log('Application data restored successfully');
  };

  // Execute mounting in a logical sequence
  mountUI()
    .then(() => {
      mountNavigation();
      restoreData();
      debug && console.log('All components mounted successfully');
    })
    .catch((error) => {
      console.error('Failed to initialize application:', error);
    });
}
