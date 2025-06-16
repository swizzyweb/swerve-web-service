import {
  DefaultStateExporter,
  IWebControllerInitProps,
  IWebControllerProps,
  RequestMethod,
  SwizzyMiddleware,
  SwizzyMiddlewareFunction,
  SwizzyMiddlewareProps,
  WebController,
  WebControllerFunction,
  WebService,
} from "@swizzyweb/swizzy-web-service";
import { WebServiceRouter, WebServiceRouterState } from "../web-service-router";

// @ts-ignore
import { Request, Response, NextFunction } from "@swizzyweb/express";
import { INpmInstaller, SaveOption } from "../../../npm-installer";
import { ISwerveManager } from "@swizzyweb/swerve";

export interface InstallControllerState {
  swerveManager: ISwerveManager;
  npmInstaller: INpmInstaller;
}

export interface InstallControllerProps
  extends IWebControllerProps<WebServiceRouterState, InstallControllerState> {}

export class InstallController extends WebController<
  WebServiceRouterState,
  InstallControllerState
> {
  constructor(props: InstallControllerProps) {
    super({
      ...props,
      logger: props.logger.clone({ ownerName: "InstallControllerProps" }),
      method: RequestMethod.get,
      action: "install",
      stateConverter: DefaultStateExporter,
      name: "InstallController",

      middleware: [InstallControllerMiddleware],
    });
  }

  protected async getInitializedController(
    props: IWebControllerInitProps<WebServiceRouterState> & {
      state: InstallControllerState | undefined;
    },
  ): Promise<WebControllerFunction> {
    const getState = this.getState.bind(this);
    const logger = this.logger;

    return async function InstallControllerFunction(
      req: Request,
      res: Response,
    ) {
      const { serviceName } = req.query;
      try {
        const npmInstaller = getState()!.npmInstaller;
        const result = await npmInstaller.npmInstall({
          packageName: serviceName,
          saveOption: SaveOption.save,
        });
        if (!result.success) {
          res.status(500);
          res.send();
          return;
        }

        res.send();
      } catch (e: any) {
        logger.error(`Error installing webservice ${serviceName} with ${e})`);
        res.staus(400);
        res.send();
      }
    };
  }
}

export const InstallControllerMiddleware: SwizzyMiddleware<InstallControllerState> =
  function InstallControllerMiddleware(
    props: SwizzyMiddlewareProps<InstallControllerState>,
  ): SwizzyMiddlewareFunction {
    const state = props.state;
    const logger = props.logger;

    return async function InstallControllerMiddlewareFunction(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const { serviceName } = req.query;
      try {
        const { npmInstaller } = state;
        npmInstaller.validatePackageName(serviceName);
        next();
      } catch (e: any) {
        logger.error(`Invalid serviceName ${serviceName} is not a package`);
        res.status(400);
        res.send();
        return;
      }
    };
  };
