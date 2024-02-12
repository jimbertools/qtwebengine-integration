
// #include <QtCore/qobject.h>
#include <QJsonDocument>
#include <QMap>
#include <QObject>
#include <QSqlDatabase>
#include "credentials.h"

class JimberPasswordManager : public QObject {
  Q_OBJECT
 public:
  static JimberPasswordManager& instance() {
    static JimberPasswordManager instance;  // Guaranteed to be destroyed.
    return instance;
  }

  void credentialsFormSubmitted(const QString& domain, const QVariant& credentials, int winId);
  void saveCredentials(const QString& domain, const QString& username, const QString& password);
  void insertCredentialsForDomain(const QString& domain,
                                  const QString& username,
                                  const QString& password);
  void updateCredentialsForDomain(const QString& domain,
                                  const QString& username,
                                  const QString& password);

  bool domainHasCredentials(const QString& domain);
  void encryptQString(const QString& string);

  void saveMasterSaltAndHash(const QString& salt, const QString& hash);
  QString getMasterSalt();
  QString getMasterHash();

  void requestPasswordDecryption(const QString& domain, int winId);
  void cachePlaintextPassword(const QString& domain, const QString& password);
  QString getUsernameForDomain(const QString& domain);
  const Credentials getCredentialsForDomain(const QString& domain);
  bool areCredentialsCached(const QString& domain);
  void reset();

  void cacheMasterKey(const QString&);
  void sendMasterKeyToNewTab(int winId);

 signals:
  void newCredentialsAvailable();

 private:
  QSqlDatabase m_db;
  JimberPasswordManager();
  void setupDB();
  QString m_masterKey;
  QMap<QString, Credentials> m_inMemoryCredentials;
};