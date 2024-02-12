#include <QDebug>
#include <QFile>
#include <QSqlDatabase>
#include <QSqlError>
#include <QSqlQuery>
#include <QWebEngineProfile>

#include "../JCommandHandler.h"
#include "credentials.h"
#include "jpasswordmanager.h"

JimberPasswordManager::JimberPasswordManager() : m_db(QSqlDatabase::addDatabase("QSQLITE")) {
  setupDB();
  const QString salt = getMasterSalt();
  const QString hash = getMasterHash();
  if (salt != "" && hash != "") {
    JCommand(OC::MASTERSALTANDHASHFROMDATABASE, -1) << salt << hash;
  }
}

void JimberPasswordManager::setupDB() {
  // for now default profile is fine
  QString path(QWebEngineProfile::defaultProfile()->persistentStoragePath());
  path.append("/credentials.db");
  m_db.setDatabaseName(path);
  m_db.open();

  QFile credentials(":/scripts/sql/credentials.sql");
  QFile master_credentials(":/scripts/sql/master_credentials.sql");
  if (credentials.open(QIODevice::ReadOnly | QIODevice::Text) &&
      master_credentials.open(QIODevice::ReadOnly | QIODevice::Text)) {
    QSqlQuery query(m_db);
    query.exec(credentials.readAll());
    query.exec(master_credentials.readAll());
    credentials.close();
    master_credentials.close();
    qInfo() << "[JimberPasswordManager::setupDB]" << query.lastError();
  }
}

QString JimberPasswordManager::getMasterSalt() {
  QSqlQuery query(m_db);
  query.prepare("SELECT password_salt FROM master_credentials");
  query.exec();
  if (!query.first()) {
    return "";
  }
  return query.value(0).toString();
};

QString JimberPasswordManager::getMasterHash() {
  QSqlQuery query(m_db);
  query.prepare("SELECT password_hash FROM master_credentials");
  query.exec();
  if (!query.first()) {
    return "";
  }
  return query.value(0).toString();
};

void JimberPasswordManager::credentialsFormSubmitted(const QString& domain,
                                                     const QVariant& credentials,
                                                     int winId) {
  QJsonDocument doc(QJsonDocument::fromVariant(credentials));
  // qInfo() << "[JimberPasswordManager::credentialsFormSubmitted]" << credentials << doc;
  if (!credentials.isValid()) {
    return;
  }
  const Credentials newCredentials(doc["username"].toString(), doc["password"].toString());
  if (newCredentials.user == "" || newCredentials.password == "")
    return;

  if (domainHasCredentials(domain)) {
    auto oldCredentials = getCredentialsForDomain(domain);
    if (oldCredentials.user == newCredentials.user &&
        oldCredentials.password == newCredentials.password)
      return;
    if (oldCredentials.user.length() > 0 && newCredentials.user.length() <= 0)
      return;
    if (oldCredentials.password.length() > 0 && newCredentials.password.length() <= 0)
      return;
  }

  JCommand(OC::CREDENTIALSFORMSUBMITTED, winId)
      << domain << QUrl::toPercentEncoding(newCredentials.user)
      << QUrl::toPercentEncoding(newCredentials.password);
};

void JimberPasswordManager::saveCredentials(const QString& domain,
                                            const QString& username,
                                            const QString& password) {
  qInfo() << domain << username << password;
  if (domainHasCredentials(domain)) {
    updateCredentialsForDomain(domain, QUrl::fromPercentEncoding(username.toUtf8()), password);
    this->m_inMemoryCredentials.remove(domain);
    return;
  }
  insertCredentialsForDomain(domain, QUrl::fromPercentEncoding(username.toUtf8()), password);
}
void JimberPasswordManager::updateCredentialsForDomain(const QString& domain,
                                                       const QString& username,
                                                       const QString& password) {
  QSqlQuery update(m_db);
  update.prepare(
      "UPDATE credentials "
      "SET username = :username, password = :password "
      "WHERE domain = :domain");
  update.bindValue(":domain", domain);
  update.bindValue(":username", username);
  update.bindValue(":password", password);
  update.exec();
  // qInfo() << "[JimberPasswordManager::updateCredentialsForDomain]" << update.lastError();
}
void JimberPasswordManager::insertCredentialsForDomain(const QString& domain,
                                                       const QString& username,
                                                       const QString& password) {
  QSqlQuery insert(m_db);
  insert.prepare(
      "INSERT INTO credentials (domain, username, password) "
      "VALUES (:domain, :username, :password)");
  insert.bindValue(":domain", domain);
  insert.bindValue(":username", username);
  insert.bindValue(":password", password);
  insert.exec();
  // qInfo() << "[JimberPasswordManager::insertCredentialsForDomain]" << insert.lastError();
}

bool JimberPasswordManager::domainHasCredentials(const QString& domain) {
  QSqlQuery query(m_db);
  query.prepare(
      "SELECT * FROM credentials "
      "WHERE domain = :domain");
  query.bindValue(":domain", domain);
  query.exec();
  // qInfo() << "[JimberPasswordManager::domainHasCredentials]" << domain << query.first();
  return query.first();
}

void JimberPasswordManager::saveMasterSaltAndHash(const QString& salt, const QString& hash) {
  QSqlQuery insert(m_db);
  insert.prepare(
      "INSERT INTO master_credentials (password_salt, password_hash) "
      "VALUES (:password_salt)");
  insert.bindValue(":password_salt", salt);
  insert.bindValue(":password_hash", hash);
  insert.exec();
  // qInfo() << "[JimberPasswordManager::saveMasterSalt]" << insert.lastError();
}

void JimberPasswordManager::requestPasswordDecryption(const QString& domain, int winId) {
  QSqlQuery query(m_db);
  query.prepare(
      "SELECT password FROM credentials "
      "WHERE domain = :domain");
  query.bindValue(":domain", domain);
  query.exec();
  query.first();
  JCommand(OC::PASSWORDDECRYPTIONREQUEST, winId) << domain << query.value(0).toString();
}

QString JimberPasswordManager::getUsernameForDomain(const QString& domain) {
  QSqlQuery query(m_db);
  query.prepare(
      "SELECT username FROM credentials "
      "WHERE domain = :domain");
  query.bindValue(":domain", domain);
  query.exec();
  query.first();
  return query.value(0).toString();
}

void JimberPasswordManager::cachePlaintextPassword(const QString& domain, const QString& password) {
  Credentials credentials(getUsernameForDomain(domain), password);
  this->m_inMemoryCredentials.insert(domain, credentials);
  emit newCredentialsAvailable();
}

const Credentials JimberPasswordManager::getCredentialsForDomain(const QString& domain) {
  return m_inMemoryCredentials.value(domain);
}

void JimberPasswordManager::reset() {
  m_inMemoryCredentials.clear();
  QSqlQuery query(m_db);
  query.exec("DELETE FROM master_credentials");
  query.exec("DELETE FROM credentials");
  qInfo() << "[JimberPasswordManager::reset]" << query.lastError();
}

bool JimberPasswordManager::areCredentialsCached(const QString& domain) {
  return m_inMemoryCredentials.contains(domain);
}

void JimberPasswordManager::cacheMasterKey(const QString& masterKey) {
  this->m_masterKey = masterKey;
}
void JimberPasswordManager::sendMasterKeyToNewTab(int winId) {
  if (m_masterKey.length() <= 0)
    return;
  JCommand(OC::MASTERKEY, winId) << m_masterKey;
}
