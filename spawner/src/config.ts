class Config {
    debug = false;
    testing = false;
    port = 5000;
    origins = ['*'];
    download_path = process.env.DOWNLOAD_PATH ? process.env.DOWNLOAD_PATH : '/tmp/downloads';
    downloadsEnabled = true;
    webcamEnabled = false;
    autoRemove = true;
    persistentClientStorage = true;
    dockerImage = `registry.gitlab.com/jimber/browser/jimberbrowser:${process.env.BROWSER_VERSION}`;
    dockerNetwork = '';
    domRenderingDisabled = process.env.DOMRENDERING_DISABLED ? process.env.DOMRENDERING_DISABLED : "false"
}

class Development extends Config {
  debug = true;
  env = "dev";
  dockerImage = "jimberbrowser";
  dockerNetwork = "jimberbrowser";
}

class Testing extends Config {
  debug = true;
  env = "test";
  // dockerImage = 'jimberbrowser:testing';
  dockerNetwork = "jimberbrowser";
}

class Staging extends Config {
  env = "stag";
  dockerNetwork = "jimber_brokerv2_staging_net";
}

class Production extends Config {
  env = "prod";
  dockerNetwork = "jimber_brokerv2_net";
}
class Demo extends Config {
  env = "demo";
  dockerNetwork = "jimberbrowser";
}


const configs: any = {
  development: Development,
  staging: Staging,
  production: Production,
  testing: Testing,
  demo: Demo,
};

const environment: string = process.env.ENVIRONMENT
  ? process.env.ENVIRONMENT
  : "development";

export const config: Config = new configs[environment]();
