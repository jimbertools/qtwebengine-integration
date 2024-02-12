

#include "jrequesthandler.h"
#include <QGuiApplication>
#include <QNetworkAccessManager>
#include <QUrl>
#include <QWebEngineCookieStore>
#include <QWebEngineProfile>
#include <QtNetwork>
#include "JCookieJar.h"
#include "jrequest.h"
#include "jupload.h"
#include "juploadmanager.h"

JRequestHandler::JRequestHandler() : m_profile(QWebEngineProfile::defaultProfile()) {
  router.addRoute("GET", "^/resource/?$", this, &JRequestHandler::handleResource);
  router.addRoute("POST", "^/uploaddnd", this, &JRequestHandler::handleFileUploadDragnDrop);
  router.addRoute("POST", "^/upload", this, &JRequestHandler::handleFileUpload);

  m_userId = qgetenv("USER_ID");
  m_networkAccessManager = new QNetworkAccessManager();
  m_networkAccessManager->setRedirectPolicy(
      QNetworkRequest::RedirectPolicy::UserVerifiedRedirectPolicy);

  m_cookieJar = new JCookieJar();

  auto store = m_profile->cookieStore();
  connect(store, &QWebEngineCookieStore::cookieAdded, m_cookieJar, &JCookieJar::handleCookieAdded);
  connect(store, &QWebEngineCookieStore::cookieRemoved, m_cookieJar,
          &JCookieJar::handleCookieRemoved);
  store->loadAllCookies();

  m_networkAccessManager->setCookieJar(m_cookieJar);
}

HttpPromise JRequestHandler::handle(HttpDataPtr data) {
  // qInfo() << "[JRequestHandler::handle]";

  bool foundRoute;
  HttpPromise promise = router.route(data, &foundRoute);
  if (foundRoute)
    return promise;

  data->response->setStatus(HttpStatus::BadRequest, QByteArray(""), QString(""));
  return HttpPromise::resolve(data);
}

HttpPromise JRequestHandler::handleResource(HttpDataPtr data) {
  QString base64Url = data->request->parameter("url");
  QUrl url =
      QUrl(QString(QByteArray::fromBase64(base64Url.toUtf8(), QByteArray::Base64UrlEncoding)));

  m_profile->cookieStore()->loadAllCookies();
  JRequest* request = new JRequest(m_networkAccessManager, url, m_userId);

  request->get();
  // m_reply = m_networkAccessManager->get(QNetworkRequest(m_url));

  HttpPromise promise([=](const HttpResolveFunc& resolve, const HttpRejectFunc& reject) {
    auto output = QtPromise::connect(request, &JRequest::finished);
    output.then([=]() {
      const auto reply = request->getReply();
      data->response->setHeader("accept-ranges", QString("bytes"));  // for video scrubbing

      QByteArray bytes = request->getBytes();
      data->response->setStatus(HttpStatus::Ok, bytes, request->getResponseContentTypeHeader());
      // data->response->setHeader("Cache-Control", "max-age=31536000, public");
      request->deleteLater();
      resolve(data);
    });
  });
  return promise;
}

HttpPromise JRequestHandler::handleFileUpload(HttpDataPtr data) {
  // lib is wrong
  // https://github.com/addisonElliott/HttpServer/issues/11#issuecomment-871531976
  const QUuid uploadId = data->request->formFile("uploadId");
  QSharedPointer<Upload> upload = JUploadManager::instance().getUploadById(uploadId);

  std::unordered_map<QString, FormFile> formFiles = data->request->formFiles();
  for (std::pair<const QString, FormFile> field : formFiles) {
    const FormFile formFile = field.second;
    const QString fileName = formFile.filename;
    QByteArray bytes = formFile.file->readAll();
    upload->addFile(fileName, bytes);
  }

  upload->finish();

  data->response->setStatus(HttpStatus::Ok);
  return HttpPromise::resolve(data);
}

HttpPromise JRequestHandler::handleFileUploadDragnDrop(HttpDataPtr data) {
  const QString uploadId = data->request->formFile("uploadId");

  auto upload = QSharedPointer<Upload>::create(uploadId);
  JUploadManager::instance().addUpload(upload);
  auto promise = JRequestHandler::handleFileUpload(data);
  auto func = reinterpret_cast<void (*)(QUuid, QList<QUrl>)>(
      QGuiApplication::platformFunction("fileUploadReady"));
  func(uploadId, upload->getUrls());
  return promise;
}