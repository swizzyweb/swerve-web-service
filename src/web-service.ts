import {
  IWebServiceProps,
  RequestIdMiddleware,
  RequestLoggerMiddleware,
  SwizzyRequestMiddleware,
  WebService,
} from "@swizzyweb/swizzy-web-service";
import { ISwerveManager } from "@swizzyweb/swerve-manager";
import { INpmInstaller } from "./npm-installer.js";
import { WebServiceRouter } from "./routers/WebServiceRouter/web-service-router.js";
import { ISwerveRegistryClient } from "./client/swerve-registry-client.js";

export interface DynSwerveWebServiceState {
  swerveManager: ISwerveManager;
  npmInstaller: INpmInstaller;
  appDataRoot: string;
  nodeModulesPath: string;
  //  registryClient: ISwerveRegistryClient;
}

export interface DynSwerveWebServiceProps
  extends IWebServiceProps<DynSwerveWebServiceState> {
  path?: string;
  packageName?: string;
}

export class DynSwerveWebService extends WebService<DynSwerveWebServiceState> {
  constructor(props: DynSwerveWebServiceProps) {
    super({
      ...props,
      packageName: props.packageName ?? "@swizzyweb/dyn-swerve-web-service",
      name: "DynSwerveWebService",
      path: props.path ?? "/",
      routerClasses: [WebServiceRouter],
      middleware: [
        SwizzyRequestMiddleware,
        RequestIdMiddleware,
        RequestLoggerMiddleware,
      ],
      logger: props.logger.clone({
        appName: "DynSwerveWebService",
        ownerName: "DynSwerveWebService",
      }),
    });
  }
}

// Service structure.
// WebService
//  Router
//    Controller
