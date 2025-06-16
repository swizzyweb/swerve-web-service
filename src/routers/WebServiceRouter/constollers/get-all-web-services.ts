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
import { json, Request, Response, NextFunction } from "@swizzyweb/express";
import { INpmInstaller, SaveOption } from "../../../npm-installer";
import { ISwerveManager } from "@swizzyweb/swerve";

export interface GetAllWebServicesControllerState {
  swerveManager: ISwerveManager;
}

export interface GetAllWebServicesControllerProps
  extends IWebControllerProps<
    WebServiceRouterState,
    GetAllWebServicesControllerState
  > {}

export class GetAllWebServicesController extends WebController<
  WebServiceRouterState,
  GetAllWebServicesControllerState
> {
  constructor(props: GetAllWebServicesControllerProps) {
    super({
      ...props,
      logger: props.logger.clone({
        ownerName: "GetAllWebServicesControllerProps",
      }),
      method: RequestMethod.get,
      action: "all",
      stateConverter: DefaultStateExporter,
      name: "GetAllWebServicesController",

      middleware: [json],
    });
  }

  protected async getInitializedController(
    props: IWebControllerInitProps<WebServiceRouterState> & {
      state: GetAllWebServicesControllerState | undefined;
    },
  ): Promise<WebControllerFunction> {
    const getState = this.getState.bind(this);
    const logger = this.logger;

    return async function GetAllWebServicesControllerFunction(
      req: Request,
      res: Response,
    ) {
      const { serviceName } = req.query;
      try {
        const { swerveManager } = getState()!;
        const { webServices } = await swerveManager.getRunningWebServices({});

        res.json({
          webServices,
        });
      } catch (e: any) {
        logger.error(`Error installing webservice ${serviceName} with ${e})`);
        res.staus(400);
        res.send();
      }
    };
  }
}
/*
export const GetAllWebServicesControllerMiddleware: SwizzyMiddleware<GetAllWebServicesControllerState> =
  function GetAllWebServicesControllerMiddleware(
    props: SwizzyMiddlewareProps<GetAllWebServicesControllerState>,
  ): SwizzyMiddlewareFunction {
    const state = props.state;
    const logger = props.logger;

    return async function GetAllWebServicesControllerMiddlewareFunction(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      const { serviceName } = req.query;
      try {
        const { npmGetAllWebServiceser } = state;
        npmGetAllWebServiceser.validatePackageName(serviceName);
        next();
      } catch (e: any) {
        logger.error(`Invalid serviceName ${serviceName} is not a package`);
        res.status(400);
        res.send();
        return;
      }
    };
  };*/
