import { exec } from "node:child_process";
import { BrowserLogger, ILogger } from "@swizzyweb/swizzy-common";
import path from "node:path";
import { existsSync } from "node:fs";

const logger: ILogger<any> = new BrowserLogger();
const SLEEP_INTERVAL = 500;

export enum SaveOption {
  none = "--no-save",
  save = "--save",
  optional = "--save-optional",
  dev = "--save-dev",
  prod = "--save-prod",
  peer = "--save-peer",
  bundle = "--save-bundle",
  default = SaveOption.optional,
}

export interface NpmInstallerProps {
  logger: ILogger<any>;
  nodeModulesPath: string;
}

export interface INpmInstaller {
  npmLinkInstall(props: INpmInstallProps): Promise<IInstallResult>;

  npmInstall(props: INpmInstallProps): Promise<IInstallResult>;

  install(
    packageName: string,
    command: string,
    installArgs?: string[],
  ): Promise<IInstallResult>;
  isPackageInstalled(moduleName: string): Promise<boolean>;
  validatePackageName(packageName: string): void;
}

export class NpmInstaller {
  readonly LINK_COMMAND = "npm link";
  readonly INSTALL_COMMAND = `npm install --omit=dev --prefix `; //https://npm.swizzyweb.com"; //"--registry http://localhost:4873 "; // TODO: should we save it?
  readonly PACKAGE_NAME_REGEX = new RegExp(
    "^([@]*[a-zA-Z0-9-]+/)?[a-zA-Z0-9-]+([a-zA-Z0-9-@.])+(?<!.js)$",
  );
  logger: ILogger<any>;
  readonly nodeModulesPath: string;
  constructor(props: NpmInstallerProps) {
    this.logger = props.logger;
    this.nodeModulesPath = props.nodeModulesPath;
  }

  async npmLinkInstall(props: INpmInstallProps): Promise<IInstallResult> {
    const { packageName, saveOption } = props;
    const actualSaveOption = saveOption ?? SaveOption.default;

    this.validatePackageName(packageName);
    return await this.install(packageName, this.LINK_COMMAND, [
      actualSaveOption,
    ]);
  }

  async npmInstall(props: INpmInstallProps): Promise<IInstallResult> {
    const { packageName, saveOption } = props;
    const actualSaveOption: SaveOption = saveOption ?? SaveOption.default;
    this.validatePackageName(packageName);
    return await this.install(
      packageName,
      `${this.INSTALL_COMMAND} ${this.nodeModulesPath}`,
      [actualSaveOption],
    );
  }

  async install(
    packageName: string,
    command: string,
    installArgs?: string[],
  ): Promise<IInstallResult> {
    const installCommand = `${command} ${installArgs?.join(" ") ?? ""} ${packageName}`;
    const logger = this.logger;
    logger.info(`Installing with command ${installCommand}`);

    let a = exec(installCommand, (err, stdout, stderr) => {
      if (err) {
        logger.error(`Error: ${err}`);
      }
      if (stdout) {
        logger.info(stdout);
      }
      if (stderr) {
        logger.error(stderr);
      }
    });

    while (a.exitCode == null) {
      logger.info(`Still running, waiting ${SLEEP_INTERVAL} ms`);
      await sleep(SLEEP_INTERVAL);
    }

    logger.info(`Instalation completed with exit code ${a.exitCode}`);

    return Promise.resolve({ success: a.exitCode === 0 });
  }

  validatePackageName(packageName: string) {
    return;
    if (!packageName || !this.PACKAGE_NAME_REGEX.test(packageName)) {
      throw new Error(
        `Invalid package name provided, could be malicious! packageName: ${packageName}`,
      );
    }
  }

  /**
   * Checks if a Node.js module is available to be required.
   * @param {string} moduleName The name of the module.
   * @returns {Promise<boolean>} True if the module is available, otherwise false.
   */
  async isPackageInstalled(moduleName: string): Promise<boolean> {
    try {
      return existsSync(
        path.join(this.nodeModulesPath, "node_modules", moduleName),
      );
    } catch {
      return false;
    }
  }
}

export interface INpmInstallProps {
  packageName: string;
  saveOption?: SaveOption;
}

export interface IInstallResult {
  success: boolean;
}
async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
