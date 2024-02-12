#include "JCookieJar.h"
#include <QDebug>
#include <QNetworkCookie>

void JCookieJar::handleCookieAdded(const QNetworkCookie& cookie) {
  insertCookie(cookie);
}

bool JCookieJar::insertCookie(const QNetworkCookie& cookie) {
  return QNetworkCookieJar::insertCookie(cookie);
};

void JCookieJar::handleCookieRemoved(const QNetworkCookie& cookie) {
  deleteCookie(cookie);
}

bool JCookieJar::deleteCookie(const QNetworkCookie& cookie) {
  return QNetworkCookieJar::deleteCookie(cookie);
};
