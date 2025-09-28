import { SwerveManager } from "@swizzyweb/swerve-manager";
import { NpmInstaller } from "./npm-installer.js";
import {
  DynSwerveWebService,
  DynSwerveWebServiceState,
} from "./web-service.js";
import { WebService } from "@swizzyweb/swizzy-web-service";
// @ts-ignore
import { Application } from "@swizzyweb/express";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import { cwd } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAbsolutePath(rawPath: string) {
  if (rawPath.startsWith(".")) {
    return path.join(cwd(), rawPath);
  }

  return rawPath;
}

export function getWebservice(props: any) {
  const { app, logger, port } = props;
  //  const state = buildState(props);

  const apps: {
    [port: number]: { app: Application; server: any; services: any };
  } = {};
  const nodeModulesPath = getAbsolutePath(
    props.serviceArgs.nodeModulesPath ??
      path.join(__dirname, "../local_node_modules/node_modules/"),
  );
  console.log(nodeModulesPath);

  const webServices: WebService<any>[] = [];
  const swerveManager = new SwerveManager({
    apps,
    webServices,
    nodeModulesPath: path.join(nodeModulesPath, "node_modules"),
    logger: props.logger,
  });
  const npmInstaller = new NpmInstaller({
    logger: logger.clone({ ownerName: "NpmInstaller" }),
    nodeModulesPath: path.join(nodeModulesPath),
  });

  //  const
  //  registryClient: ISwerveRegistryClient;
  const state: DynSwerveWebServiceState = {
    swerveManager,
    npmInstaller,
    appDataRoot: props.appDataRoot ?? process.cwd(),
    nodeModulesPath,
  };

  const webService = new DynSwerveWebService({ ...props, logger, state });

  const services: { [instanceId: string]: any } = {};
  services[webService.instanceId] = webService;
  apps[port] = {
    app,
    server: undefined /*TOOD: figure out how to get this maybe*/,
    services,
  };

  webServices.push(webService);
  return webService;
}

function buildState(props: any) {
  const { logger } = props;
  const swerveManager = new SwerveManager({});
  const npmInstaller = new NpmInstaller({
    logger: logger.clone({ ownerName: "NpmInstaller" }),
    nodeModulesPath: props.nodeModulesPath,
  });

  return {
    swerveManager,
    npmInstaller,
    appDataRoot: props.appDataRoot ?? process.cwd(),
  };
}
