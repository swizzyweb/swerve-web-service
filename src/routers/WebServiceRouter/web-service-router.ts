import {
  IWebRouterProps,
  StateConverter,
  StateConverterProps,
  WebRouter,
} from "@swizzyweb/swizzy-web-service";
import { DynSwerveWebServiceState } from "../../web-service";
import { ISwerveManager } from "@swizzyweb/swerve";
import { INpmInstaller } from "../../npm-installer";
import { InstallController } from "./constollers/install-controller";
import { RunController } from "./constollers/run-controller";
import { StopController } from "./constollers/stop-controller";
import { GetAllWebServicesController } from "./constollers/get-all-web-services";

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
