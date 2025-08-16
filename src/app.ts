import { SwerveManager } from "@swizzyweb/swerve-manager";
import { NpmInstaller } from "./npm-installer.js";
import { DynSwerveWebService } from "./web-service.js";
import { WebService } from "@swizzyweb/swizzy-web-service";
// @ts-ignore
import { Application } from "@swizzyweb/express";

export function getWebservice(props: any) {
  const { app, logger, port } = props;
  //  const state = buildState(props);

  const apps: {
    [port: number]: { app: Application; server: any; services: any };
  } = {};
  const webServices: WebService<any>[] = [];
  const swerveManager = new SwerveManager({ apps, webServices });
  const npmInstaller = new NpmInstaller({
    logger: logger.clone({ ownerName: "NpmInstaller" }),
  });

  const state = {
    swerveManager,
    npmInstaller,
    appDataRoot: props.appDataRoot ?? process.cwd(),
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
  });

  return {
    swerveManager,
    npmInstaller,
    appDataRoot: props.appDataRoot ?? process.cwd(),
  };
}
