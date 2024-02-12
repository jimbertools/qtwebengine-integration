#include "jresourceproxy.h"
#include <QDebug>
#include <QString>
#include <QUrl>
#include "httpServer/httpData.h"
#include "httpServer/httpRequestHandler.h"
#include "httpServer/httpRequestRouter.h"
#include "jrequesthandler.h"

JResourceProxy::JResourceProxy() {
  HttpServerConfig config;
  config.port = 9002;
  config.requestTimeout = 20;
  config.verbosity = HttpServerConfig::Verbose::Critical;
  // config.verbosity = HttpServerConfig::Verbose::All;
  config.maxMultipartSize = 512 * 1024 * 1024;
  config.errorDocumentMap[HttpStatus::NotFound] = "data/404_2.html";
  config.errorDocumentMap[HttpStatus::InternalServerError] = "data/404_2.html";
  config.errorDocumentMap[HttpStatus::BadGateway] = "data/404_2.html";
  config.maxConnections = 1000;

  JRequestHandler* handler = new JRequestHandler();
  m_httpServer = new HttpServer(config, handler);
  m_httpServer->listen();
}
