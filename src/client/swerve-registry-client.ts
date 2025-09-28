export interface GetAllServicesRequest {}
export interface GetAllServicesResponse {}

export interface GetServiceConfigurationRequest {}
export interface GetServiceConfigurationResponse {}

export interface ISwerveRegistryClient {
  getAllServices(request: GetAllServicesRequest): GetAllServicesResponse;
  getServiceConfiguration(
    request: GetServiceConfigurationRequest,
  ): GetServiceConfigurationResponse;
}

/*export class SwerveRegistryClient implements ISwerveRegistryClient {
  getAllServices(request: GetAllServicesRequest): GetAllServicesResponse {}

  getServiceConfiguration(
    request: GetServiceConfigurationRequest,
  ): GetServiceConfigurationResponse {}
}*/
