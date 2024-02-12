#include "jrequest.h"
#include "broccoli.h"

JRequest::JRequest(QNetworkAccessManager* mgr, QUrl url, QString userId)
    : m_networkAccessManager(mgr), m_url(url), m_userId(userId) {}

JRequest::~JRequest() {
  // requests are not sent?
  // delete m_networkAccessManager;
  delete m_reply;
}

QNetworkReply* JRequest::getReply() {
  return m_reply;
}

void JRequest::get() {
  auto req = QNetworkRequest(m_url);
  req.setRawHeader(QByteArray("referer"), QByteArray(m_url.toString().toUtf8()));
  // req.setRawHeader(QByteArray("User-Agent"), QByteArray("Mozilla/5.0 (X11; Linux x86_64)
  // AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"));
  m_reply = m_networkAccessManager->get(req);
  QObject::connect(m_reply, &QNetworkReply::redirected, [&]() { emit m_reply->redirectAllowed(); });
  connect(m_reply, &QNetworkReply::downloadProgress, this, &JRequest::downloadProgress);
  connect(m_reply, &QNetworkReply::finished, this, &JRequest::httpFinished);
  connect(m_reply, &QNetworkReply::errorOccurred, this, &JRequest::error);
}

void JRequest::httpFinished() {
  QString ctypeheader = m_reply->header(QNetworkRequest::ContentTypeHeader).toString();
  QList<QByteArray>::iterator i;

  QByteArray data = m_reply->readAll();
  if (m_reply->rawHeader("Content-Encoding") == "br") {
    std::string brotliEncodedString = std::string(data.constData(), data.length());
    std::string decodedString = broccoli::decompress(brotliEncodedString);
    data = QByteArray(decodedString.c_str());
  }

  if (ctypeheader.split(";").at(0) == "text/css") {
    QString str(data);
    str.replace(":hover", ".j-fake-hover");
    fixCSS(str);
    m_bytes = str.toUtf8();
  } else {
    m_bytes = data;
  }

  m_responseContentTypeHeader = ctypeheader;

  m_ready = true;
  emit finished();
}

void JRequest::error(const QNetworkReply::NetworkError& err) {
  m_ready = true;
};

void JRequest::downloadProgress(qint64 bytesReceived, qint64 bytesTotal) {}

void JRequest::fixCSS(QString& stylesheet) {
  replaceAllURLs(stylesheet);
  replaceFontFamily(stylesheet);
  replaceFontDisplayOptional(stylesheet);
}

void JRequest::replaceFontFamily(QString& stylesheet) {
  stylesheet.replace(QRegularExpression("(font-family:([a-zA-Z, '\"-]*)?)(system-ui)"), "\\1j-system-ui");
  stylesheet.replace(QRegularExpression("(font-family:([a-zA-Z, '\"-]*)?)(initial)"), "\\1j-initial");
  stylesheet.replace(QRegularExpression("(font-family:([a-zA-Z, '\"-]*)?)(ui-sans-serif)"), "\\1j-ui-sans-serif");
  stylesheet.replace(QRegularExpression("(font-family:([a-zA-Z, '\"-]*)?)(-apple-system)"), "\\1j-apple-system");
  stylesheet.replace(QRegularExpression("(font-family:([a-zA-Z, '\"-]*)?)(BlinkMacSystemFont)"), "\\1j-BlinkMacSystemFont");
  // QRegularExpression re("font-family:( .*)?(system-ui)");

  // QRegularExpressionMatchIterator matches = re.globalMatch(stylesheet);

  // while (matches.hasNext()) {
  //   QRegularExpressionMatch match = matches.next();
  //   QString matched = match.captured(2);

  //   stylesheet.replace(matched, "j-" + matched);
  // }
}

void JRequest::replaceFontDisplayOptional(QString& stylesheet) {
  stylesheet.replace(QRegularExpression("(font-display:([a-zA-Z, '\"-]*)?)(optional)"), "\\1auto");
  // stylesheet.replace("optional", "auto");

  // QRegularExpression re("font-display:( )?(optional)");

  // QRegularExpressionMatchIterator matches = re.globalMatch(stylesheet);

  // while (matches.hasNext()) {
  //   QRegularExpressionMatch match = matches.next();
  //   QString matched = match.captured(2);

  //   stylesheet.replace(matched, "auto");
  // }
}

void JRequest::replaceAllURLs(QString& stylesheet) {
  QRegularExpression re(
      "(@import |@import "
      "url|url)\\(?('|\")?((?!data:)[a-zA-Z0-9\\?\\/"
      ":.\\-_#=&~@]+?)('|\"|\\))");

  QRegularExpressionMatchIterator matches = re.globalMatch(stylesheet);
  while (matches.hasNext()) {
    QRegularExpressionMatch match = matches.next();
    QString matched = match.captured(3);
    QUrl cssUrl(matched);

    if (cssUrl.scheme().isEmpty()) {
      cssUrl.setScheme(m_url.scheme());
    }
    if (cssUrl.host().isEmpty()) {
      cssUrl = m_url.resolved(matched);
    }

    QString cssUrlString = cssUrl.toString();

    QString hashPart;
    if (cssUrlString.contains("#")) {
      QStringList urlSplit = cssUrlString.split("#");
      cssUrlString = urlSplit.at(0);
      hashPart = urlSplit.at(1);
    }

    QString newUrl("/resource");

    if (m_userId.size() > 1) {
      newUrl.append("/");
      newUrl.append(m_userId);
    }
    newUrl.append("?url=");
    newUrl.append(
        QString(QByteArray(cssUrlString.toUtf8())
                    .toBase64(QByteArray::Base64UrlEncoding | QByteArray::OmitTrailingEquals)));

    if (!hashPart.isEmpty()) {
      newUrl.append("#");
      newUrl.append(hashPart);
    }

    stylesheet.replace(matched, newUrl);
  }
}
