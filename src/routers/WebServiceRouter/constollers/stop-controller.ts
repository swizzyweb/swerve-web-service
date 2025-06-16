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
} from "@swizzyweb/swizzy-web-service";
import { WebServiceRouter, WebServiceRouterState } from "../web-service-router";

// @ts-ignore
import { Request, Response, NextFunction } from "@swizzyweb/express";
import { ISwerveManager } from "@swizzyweb/swerve";
import { INpmInstaller } from "../../../npm-installer";

export interface StopControllerState {
  swerveManager: ISwerveManager;
  npmInstaller: INpmInstaller;
}

export interface StopControllerProps
  extends IWebControllerProps<WebServiceRouterState, StopControllerState> {}

export class StopController extends WebController<
  WebServiceRouterState,
  StopControllerState
> {
  constructor(props: StopControllerProps) {
    super({
      ...props,
      logger: props.logger.clone({ ownerName: "StopControllerProps" }),
      method: RequestMethod.get,
      action: "stop",
      stateConverter: DefaultStateExporter,
      name: "StopController",

      middleware: [],
    });
  }

  protected async getInitializedController(
    props: IWebControllerInitProps<WebServiceRouterState> & {
      state: StopControllerState | undefined;
    },
  ): Promise<WebControllerFunction> {
    const getState = this.getState.bind(this);
    const logger = this.logger;

    return async function StopControllerFunction(req: Request, res: Response) {
      const { instanceId, instanceType } = req.query;
      try {
        const { swerveManager } = getState()!;
        logger.info(
          `Stopping webservice instance ${instanceId} with instanceType ${instanceType}`,
        );
        //        const response = await swerveManager.run();
        const response = await swerveManager.stop({
          instanceDetails: { instanceId, instanceType },
        });
        logger.info(
          `Stopped webservice instance ${instanceId} with instanceType ${instanceType}`,
        );

        res.send();
      } catch (e) {
        logger.error(
          `Error stopping webservice instance: ${instanceId} with instanceType ${instanceType} with error ${e}`,
        );
        res.status(500);
        res.send();
      }
    };
  }
}
export const StopControllerMiddleware: SwizzyMiddleware<StopControllerState> =
  function StopControllerMiddleware(
    props: SwizzyMiddlewareProps<StopControllerState>,
  ): SwizzyMiddlewareFunction {
    const state = props.state;
    const logger = props.logger;

    return async function StopControllerMiddlewareFunction(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const { instanceId, instanceType } = req.query;
      const { swerveManager } = state;
      try {
        if (!instanceId || typeof instanceId !== "string") {
          throw new Error(
            `Instance id must be specified as string for stopping web service`,
          );
        }

        if (!instanceType === instanceType.webservice) {
          throw new Error(
            `Unsupported instance type of ${instanceType} in stop controller`,
          );
        }

        next();
      } catch (e: any) {
        logger.error(`Invalid request in StopController`);
        res.status(400);
        res.send();
        return;
      }
    };
  };
