#include <QNetworkCookieJar>

class JCookieJar : public QNetworkCookieJar {
 public:
  JCookieJar(){};
  void handleCookieAdded(const QNetworkCookie& cookie);
  void handleCookieRemoved(const QNetworkCookie& cookie);

 protected:
  bool insertCookie(const QNetworkCookie& cookie);
  bool deleteCookie(const QNetworkCookie& cookie);
};