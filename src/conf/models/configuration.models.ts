import { N9NodeRouting, ValidateNested, IsString, IsNotEmpty, Type } from '@neo9/n9-node-routing';

export class GoogleEventConfiguration {
	@IsString()
	@IsNotEmpty()
	baseUrl: string;

	@IsString()
	@IsNotEmpty()
	apiKey: string;

	@IsString()
	@IsNotEmpty()
	callbackUrl: any;
}

export class Configuration extends N9NodeRouting.N9NodeRoutingBaseConf {
	@ValidateNested()
	@Type(() => GoogleEventConfiguration)
	googleEvents: GoogleEventConfiguration;
}
