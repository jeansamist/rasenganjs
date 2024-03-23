import { RouterComponent } from "../interfaces.js";
import {
  RouterProvider,
  createBrowserRouter,
  useLoaderData,
} from "react-router-dom";
import {
  RouteDecoratorProps,
  RouteLayoutDecoratorProps,
  RouterDecoratorProps,
} from "../../decorators/types.js";
import {
  DefaultLayout,
  LayoutComponent,
  LoaderResponse,
  PageComponent,
} from "../../index.js";
import {
  ClientComponent,
  NotFoundComponentContainer,
  NotFoundPageComponent,
  ServerComponent,
} from "../components/index.js";
import { ErrorBoundary } from "../../core/components/index.js";
import { Metadata } from "../types.js";

/**
 * This function receives a router component and get a formated router first
 * and then return a router.
 */
export const getRouter = (router: RouterComponent) => {
  const routes = generateBrowserRoutes(router);

  let Router = createBrowserRouter(routes);

  return () => (
    <RouterProvider fallbackElement={<>Not Found</>} router={Router} />
  );
};

/**
 * This function receives a router component and return a formated router.
 */
const generateBrowserRoutes = (router: RouterComponent, isRoot = true) => {
  // Initialization of the list of routes
  const routes = [] as any;

  // Get information about the layout and the path
  const layout = router.layout;
  const LayoutToRender = layout.render;

  const route = {
    path: layout.path,
    elementError: <ErrorBoundary />,
    Component() {
      // Default data
      const defaultData = {
        props: {},
      };

      const { props } = (useLoaderData() as LoaderResponse) || defaultData;

      return <LayoutToRender {...props} />;
    },
    children: [] as unknown as any,
  };

  // Defining the page not found route
  if (isRoot) {
    routes.push({
      path: "*",
      element: (
        <NotFoundComponentContainer content={router.notFoundComponent} />
      ),
    });
  }

  // Get informations about pages
  const pages = router.pages.map((page) => {
    // Get the path of the page
    const path = page.path === "/" ? layout.path : page.path;

    // Add metadata to the page
    page.addMetadata(layout.metadata);

    return {
      path,
      element: (
        <ClientComponent page={page} loader={router.loaderComponent({})} />
      ),
      elementError: <ErrorBoundary />,
    };
  });

  // Add pages into children of the current route
  pages.forEach((page) => {
    route.children.push(page);
  });

  // Loop throug sub routers in order to apply the same thing.
  // for (const SubRouter of router.routers) {
  //   const subRouter = new SubRouter();

  //   const subRoutes = generateBrowserRoutes(subRouter);

  //   // Add sub routes into the lists of route
  //   route.children.push(subRoutes);
  // }

  routes.push(route);

  // Loop throug besides routers in order to apply the same thing.
  for (const besideRouter of router.routers) {
    const besidesRoutes = generateBrowserRoutes(besideRouter, false);

    // Add besides routes into the lists of route
    routes.push(...besidesRoutes);
  }

  // Return the formated router
  return routes;
};

/**
 * This function receives a router component and return a formated router for static routing
 * @param router Represents the router component
 * @returns
 */
export const generateStaticRoutes = (
  router: RouterComponent,
  isRoot = true
) => {
  // Initialization of the list of routes
  const routes = [] as any;

  // Get information about the layout and the path
  const layout = router.layout;
  const LayoutToRender = layout.render;

  const route = {
    path: layout.path,
    elementError: <ErrorBoundary />,
    Component() {
      return <LayoutToRender />;
    },
    loader: async ({ params, request }: any) => {
      try {
        // Get the response from the loader
        const response = await layout.loader({ params, request });

        // Handle redirection
        if (response.redirect) {
          const formData = new FormData();

          formData.append("redirect", response.redirect);

          return new Response(formData, {
            status: 302,
            headers: {
              Location: response.redirect,
            },
          });
        }

        return response;
      } catch (error) {
        return {
          props: {},
        };
      }
    },
    children: [] as unknown as any,
  };

  // Defining the page not found route
  if (isRoot) {
    routes.push({
      path: "*",
      element: (
        <NotFoundComponentContainer content={router.notFoundComponent} />
      ),
    });
  }

  // Get informations about pages
  const pages = router.pages.map((page) => {
    // Get the path of the page
    const path = page.path === "/" ? layout.path : page.path;

    // Add metadata to the page
    page.addMetadata(layout.metadata);

    return {
      path,
      async loader({ params, request }: any) {
        try {
          // Get the response from the loader
          const response = await page.loader({ params, request });

          // Handle redirection
          if (response.redirect) {
            const formData = new FormData();

            formData.append("redirect", response.redirect);

            return new Response(formData, {
              status: 302,
              headers: {
                Location: response.redirect,
              },
            });
          }

          return response;
        } catch (error) {
          return {
            props: {},
          };
        }
      },
      Component() {
        return (
          <ServerComponent page={page} loader={router.loaderComponent({})} />
        );
      },
      elementError: <ErrorBoundary />,
    };
  });

  // Add pages into children of the current route
  pages.forEach((page) => {
    route.children.push(page);
  });

  // Loop throug sub routers in order to apply the same thing.
  // for (const SubRouter of router.routers) {
  //   const subRouter = new SubRouter();
  //   const subRoutes = generateStaticRoutes(subRouter);

  //   // Add sub routes into the lists of route
  //   route.children.push(subRoutes);
  // }

  routes.push(route);

  // Loop throug besides routers in order to apply the same thing.
  for (const besideRouter of router.routers) {
    const besidesRoutes = generateStaticRoutes(besideRouter, false);

    // Add besides routes into the lists of route
    routes.push(...besidesRoutes);
  }

  // Return the formated router
  return routes;
};

/**
 * This function adds metadata to a page or a layout
 * @param option
 * @returns
 */
export const defineRoutePage = (option: RouteDecoratorProps) => {
  const { path, title, description, metadata } = option;

  return (Component: new () => PageComponent) => {
    if (!path) throw new Error("You must provide a path to the page");

    // Create a new instance of the component
    const component = new Component();

    // Set properties
    component.path = path;
    component.title = title || Component.name;
    component.description = description || "";
    component.metadata = metadata || [];

    return component;
  };
};

/**
 * This function adds metadata to a page or a layout
 * @param option
 * @returns
 */
export const defineRouteLayout = (option: RouteLayoutDecoratorProps) => {
  const { path, metadata } = option;

  return (Component: new () => LayoutComponent) => {
    if (!path) throw new Error("You must provide a path to the layout");

    // Create a new instance of the component
    const component = new Component();

    // Set properties
    component.path = path;
    component.metadata = metadata || [];

    return component;
  };
};

/**
 * This function adds metadata to a router
 * @param option
 * @returns
 */
export const defineRouter = (option: RouterDecoratorProps) => {
  const { imports, layout, pages, loaderComponent, notFoundComponent } = option;

  return (Component: new () => RouterComponent) => {
    // Handle errors
    if (!option.pages)
      throw new Error(
        "You must provide a list of pages in the router decorator"
      );

    // Create router
    const router = new Component();

    // Set properties
    router.routers = imports || [];
    router.layout = layout || new DefaultLayout();
    router.pages = pages;
    router.loaderComponent = loaderComponent || (() => null);
    router.notFoundComponent = notFoundComponent || NotFoundPageComponent;

    return router;
  };
};

/**
 * This function generates metadata useful for pages to show images when sharing on social media
 * @param {Metadata[]} metadatas 
 */
export const generateMetadata = (metadatas: Metadata[]) => {
  return metadatas.map((metadata) => {
    return (
      <meta
        key={metadata.property || metadata.name}
        name={metadata.name}
        property={metadata.property}
        content={metadata.content}
      />
    );
  });
}
