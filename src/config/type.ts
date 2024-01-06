export type AppConfig = {
  /**
   * Enable strict mode
   * @default true
   */
  reactStrictMode?: boolean;

  /**
   * Configure server both in development and production
   */
  server?: {
    /**
     * Configure server in development
     */
    development?: {
      /**
       * Port to listen on
       * @default 3000
       */
      port?: number;
    };

    /**
     * Configure server in production
     */
    production?: {
      /**
       * Set the hosting strategy
       * @default "custom"
       */
      hosting?: HostingStrategy;
    };
  };

  /**
   * Configure Vite
   */
  vite?: {
    /**
     * Configure Vite plugins
     */
    plugins?: any[];

    /**
     * Optimize dependencies
     */
    optimizeDeps?: {
      exclude?: string[];
    };

    /**
     * Configure css options
     */
    css?: {
      postcss?: {
        plugins?: any[];
      };
    };

    /**
     * Configure build options
     */
    build?: {
      /**
       * Configure external dependencies
       */
      external?: string[];
    }
  };
  // More config options...
};

/**
 * Hosting strategy
 */
export type HostingStrategy = "vercel" | "netlify" | "heroku" | "custom";
