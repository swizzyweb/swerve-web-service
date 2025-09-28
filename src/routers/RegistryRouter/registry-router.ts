import {
  IWebRouterProps,
  StateConverter,
  StateConverterProps,
  WebRouter,
} from "@swizzyweb/swizzy-web-service";
import { DynSwerveWebServiceState } from "../../web-service.js";
import { ISwerveManager } from "@swizzyweb/swerve-manager";
import { INpmInstaller } from "../../npm-installer.js";
//import { ISwerveRegistryClient } from "../../client/swerve-registry-client.js";

export interface RegistryRouterState {
  swerveManager: ISwerveManager;
  npmInstaller: INpmInstaller;
  appDataRoot: string;
  //  registryClient: ISwerveRegistryClient;
}

export interface RegistryRouterProps
  extends IWebRouterProps<DynSwerveWebServiceState, RegistryRouterState> {}

export class RegistryRouter extends WebRouter<
  DynSwerveWebServiceState,
  RegistryRouterState
> {
  constructor(props: RegistryRouterProps) {
    super({
      ...props,
      name: "RegistryRouter",
      path: "webservice",
      middleware: [],
      stateConverter: RegistryRouterStateConverter,
      webControllerClasses: [],
    });
  }
}

export const RegistryRouterStateConverter: StateConverter<
  DynSwerveWebServiceState,
  RegistryRouterState
> = async function (
  props: StateConverterProps<DynSwerveWebServiceState>,
): Promise<RegistryRouterState> {
  return { ...props.state };
};
