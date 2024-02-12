import express from "express";
import Docker from "dockerode";
import { config } from "./config";

const port: number = config.port;
const docker: Docker = new Docker({ socketPath: "/var/run/docker.sock" });
let webcamCounter: number = 2; // We start at /dev/video2
const maxWebcams = 7; // The max amount of installed webcams on the server

export const startApi = async () => {
  const app = express();
  app.use(express.json());
  app.post("/container", async (req, res) => {
    const userId = req.body.userId;
    const timezone = req.body.timezone; // timezone = {"timezone":"Europe/Brussels"}
    const adblockEnabled = req.body.adblockEnabled;
    const domRenderingDisabled = config.domRenderingDisabled;

    const isolation = req.header("X-App-Isolation-Domains");
    const isolationProtocol = req.header("X-App-Isolation-Protocols");
    const isProxy = req.header("X-Proxying");

    if (!userId) {
      res.json({
        error: "No userId given.",
      });
      return;
    }

    if (!timezone) {
      res.json({
        error: "No timezone given.",
      });
      return;
    }

    if (!(await isContainerRunning(userId))) {
      docker
        .createContainer({
          Image: config.dockerImage,
          Tty: false,
          name: userId,
          HostConfig: {
            AutoRemove: config.autoRemove,
            NetworkMode: config.dockerNetwork,
            Devices: generateDevices(),
            Binds: await generateBinds(userId),
          },
          Labels: { jimber: "browser" },
          Env: generateEnvironment(
            userId,
            timezone,
            isolation,
            isolationProtocol,
            domRenderingDisabled,
            adblockEnabled
          ),
        })
        .then((container) => {
          container.start();
        });
    }

    res.send({
      downloadsEnabled: config.downloadsEnabled,
      userId: userId,
      timezone: timezone,
      isolation: isolation,
      isProxy: isProxy,
      domRenderingDisabled: domRenderingDisabled,
      isolationProtocol: isolationProtocol,
      adblockEnabled: adblockEnabled,
    });
  });

  app.listen(port);
};

const generateEnvironment = (
  userId: string,
  timezone: string,
  isolation: string,
  isolationProtocol: string,
  domRenderingDisabled: string,
  adblockEnabled: string
) => {
  const environment: any = [];
  environment.push(`WEBCAM_ENABLED=${config.webcamEnabled}`);
  // could one insert \n into the expanded env vars?
  environment.push(`USER_ID=${userId}`);
  environment.push(`TZ=${timezone}`);
  if (domRenderingDisabled == "true") {
    environment.push(`DOMRENDERING_DISABLED=${domRenderingDisabled}`);
  }
  if (isolation) {
    environment.push(
      `APP_ISOLATION_DOMAINS=${isolation};login.microsoftonline.com;microsoft.com;go.microsoft.com;accounts.youtube.com;accounts.google.com;appleid.apple.com;login.live.com;signup.live.com;login.microsoftonline.com`
    );
    environment.push(`APP_ISOLATION_PROTOCOLS=${isolationProtocol}`);
  }
  environment.push(`ADBLOCK_ENABLED=${adblockEnabled}`);
  return environment;
};

const generateBinds = async (userId: string): Promise<any> => {
  const binds: any = [];
  if (!userId) {
    return [];
  }

  if (config.persistentClientStorage) {
    const volumeName = `browser_storage${userId}`;
    await docker.createVolume({
      name: volumeName,
      labels: { jimber: "volume" },
    });
    binds.push(`${volumeName}:/root/.local/share/browser/QtWebEngine/Default`);
  }

  if (config.downloadsEnabled) {
    binds.push(`/opt/jimber/downloads/${userId}:/jimber_downloads:rw`);
  }

  binds.push(`/opt/jimber/browser/license:/tmp/license`);

  return binds;
};

const generateDevices = () => {
  const devices: any = [];
  if (config.webcamEnabled) {
    const webcamId = createWebcam();
    devices.push(`/dev/video${webcamId}:/dev/video0`);
  }
};

const createWebcam = () => {
  // Testcode from @azertyalex
  const webcamId = webcamCounter;
  webcamCounter += 1;
  if (webcamCounter > maxWebcams) {
    webcamCounter = 2;
  }
  return webcamId;
};

const isContainerRunning = async (userId: string): Promise<boolean> => {
  const containers = await docker.listContainers({
    filters: { name: [userId] },
  });
  return containers.length > 0;
};
