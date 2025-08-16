import {
  IWebRouterProps,
  StateConverter,
  StateConverterProps,
  WebRouter,
} from "@swizzyweb/swizzy-web-service";
import { DynSwerveWebServiceState } from "../../web-service.js";
import { ISwerveManager } from "@swizzyweb/swerve-manager";
import { INpmInstaller } from "../../npm-installer.js";
import { InstallController } from "./constollers/install-controller.js";
import { RunController } from "./constollers/run-controller.js";
import { StopController } from "./constollers/stop-controller.js";
import { GetAllWebServicesController } from "./constollers/get-all-web-services.js";

export interface WebServiceRouterState {
  swerveManager: ISwerveManager;
  npmInstaller: INpmInstaller;
  appDataRoot: string;
}

export interface WebServiceRouterProps
  extends IWebRouterProps<DynSwerveWebServiceState, WebServiceRouterState> {}

export class WebServiceRouter extends WebRouter<
  DynSwerveWebServiceState,
  WebServiceRouterState
> {
  constructor(props: WebServiceRouterProps) {
    super({
      ...props,
      name: "WebServiceRouter",
      path: "webservice",
      middleware: [],
      stateConverter: WebServiceRouterStateConverter,
      webControllerClasses: [
        InstallController,
        RunController,
        StopController,
        GetAllWebServicesController,
      ],
    });
  }
}

export const WebServiceRouterStateConverter: StateConverter<
  DynSwerveWebServiceState,
  WebServiceRouterState
> = async function (
  props: StateConverterProps<DynSwerveWebServiceState>,
): Promise<WebServiceRouterState> {
  return { ...props.state };
};
