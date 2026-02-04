import {
  DefaultStateExporter,
  IWebControllerInitProps,
  IWebControllerProps,
  RequestMethod,
  SwizzyMiddleware,
  SwizzyMiddlewareFunction,
  SwizzyMiddlewareProps,
  SwizzyRequest,
  WebController,
  WebControllerFunction,
} from "@swizzyweb/swizzy-web-service";
import {
  WebServiceRouter,
  WebServiceRouterState,
} from "../web-service-router.js";
import path from "node:path";
// @ts-ignore
import { json, Request, Response, NextFunction } from "express";
import {
  getArgs,
  getPackageJson,
  IService,
  ISwerveManager,
  SwerveConfigException,
  SwerveManager,
} from "@swizzyweb/swerve-manager";
import { INpmInstaller } from "../../../npm-installer.js";

export interface RunControllerState {
  swerveManager: ISwerveManager;
  npmInstaller: INpmInstaller;
  appDataRoot: string;
  nodeModulesPath: string;
}

export interface RunControllerProps
  extends IWebControllerProps<WebServiceRouterState, RunControllerState> {}

export class RunController extends WebController<
  WebServiceRouterState,
  RunControllerState
> {
  constructor(props: RunControllerProps) {
    super({
      ...props,
      logger: props.logger.clone({ ownerName: "RunControllerProps" }),
      method: RequestMethod.post,
      action: "run",
      stateConverter: DefaultStateExporter,
      name: "RunController",

      middleware: [json as any, RunControllerMiddleware],
    });
  }

  protected async getInitializedController(
    props: IWebControllerInitProps<WebServiceRouterState> & {
      state: RunControllerState | undefined;
    },
  ): Promise<WebControllerFunction> {
    const getState = this.getState.bind(this);
    const logger = this.logger;

    return async function RunControllerFunction(
      req: Request & SwizzyRequest,
      res: Response,
    ) {
      //      const { serviceName, port } = req.query;
      const { serviceConfig } = req.body;
      const { requestId } = req.swizzy;
      const { services, port, logLevel } = serviceConfig;
      try {
        const { swerveManager, appDataRoot, nodeModulesPath, npmInstaller } =
          getState()!;

        logger.info(
          `Installing webservices for requestId ${requestId} on port ${port}`,
        );
        logger.debug(
          `Installing for request ${requestId} with request ${JSON.stringify(req.body)} on port ${port}`,
        );

        for (const [key, service] of Object.entries(services) as any) {
          logger.info(`Key: ${key}, service ${service}`);
          if (!(await npmInstaller.isPackageInstalled(service.packageName))) {
            throw new SwerveConfigException(
              `Package is not installed ${service.packageName}`,
            );
          }
        }
        const { services: servicesWithServicePath } =
          await getServicesWithServicePaths({ services, nodeModulesPath });
        console.error(servicesWithServicePath);
        const { webServices } = await swerveManager.run({
          args: {
            port,
            appDataRoot,
            services: servicesWithServicePath,
            logLevel: logLevel ?? "info",
          },
        });
        const instanceDetails: { [instanceId: string]: any } = {};
        const instanceIds = [];
        for (const service of webServices) {
          instanceDetails[service.instanceId] = {
            name: service.name,
            packageName: service.packageName,
            port: service.port,
            path: service.path,
          };
          instanceIds.push(service.instanceId);
        }

        logger.info(
          `Installed ${instanceIds.length} webservice for requestId ${requestId} on port ${port} with instanceIds ${instanceIds.join(", ")}`,
        );
        res.json({ instances: instanceDetails });
      } catch (e) {
        logger.error(
          `Error running webservice: ${requestId} on port ${port} with error ${typeof e === "object" ? JSON.stringify(e) : e}`,
        );
        res.status(500);
        res.json({});
      }
    };
  }
}

interface Service {
  packageName: string;
  servicePath?: string;
  logLevel?: string;
  [key: string]: string | undefined;
}

type Services = {
  [name: string]: Service;
};

type WebServiceConfig = {
  port: number;
  logLevel?: string;
  services: { [services: string]: Service }[];
};

async function getServicesWithServicePaths(props: {
  services: Services;
  nodeModulesPath: string;
}): Promise<{ services: Services }> {
  const { services, nodeModulesPath } = props;
  const outServices: Services = {};
  for (const [name, service] of Object.entries(services)) {
    const { packageName } = service;
    if (!packageName) {
      throw new Error(`Invalid service does not have packageName`);
    }
    const { servicePath } =
      getPackageJson(path.join(nodeModulesPath, "node_modules", packageName)) ??
      {};
    const outService = { ...service, servicePath };
    outServices[name] = outService;
  }

  return { services: outServices };
}

export const RunControllerMiddleware: SwizzyMiddleware<RunControllerState> =
  function RunControllerMiddleware(
    props: SwizzyMiddlewareProps<RunControllerState>,
  ): SwizzyMiddlewareFunction {
    const state = props.state;
    const logger = props.logger;

    return async function RunControllerMiddlewareFunction(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      //const { serviceName } = req.query;
      //      const { serviceArgs } = req.body;
      const { serviceConfig } = req.body;
      try {
        const { services, port, logLevel } = serviceConfig;
        if (typeof services != "object") {
          res.status(400);
          res.send();
          return;
        }

        if (port && typeof port !== "number") {
          throw new Error(`Invalid port provided, not a number`);
        }
        if (logLevel && typeof logLevel !== "string") {
          throw new Error(`Invalid logLevel provided, not a string`);
        }

        const { npmInstaller } = state;
        for (const serviceEntry of Object.entries(services)) {
          const service: IService = serviceEntry[1] as IService;
          validateService(service);

          npmInstaller.validatePackageName(service.packageName!);
        }

        next();
      } catch (e: any) {
        logger.error(
          `Invalid request in RunControllerMiddlewareFunction with error ${e}`,
        );
        res.status(400);
        res.send();
        return;
      }
    };
  };

function validateService(service: IService) {
  if (!service.packageName) {
    throw new Error(
      `No packagename supplied for service configuration in run controller`,
    );
  }

  if (service.servicePath) {
    throw new Error(`Service path cannot be specificed for DynSwerve services`);
  }
}
