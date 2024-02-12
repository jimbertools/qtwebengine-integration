#include <memory>

#include <QtCore/QObject>
#include <QWebEngineNotification>
#include <QCoreApplication>
#include <QMainWindow>
#include <QBuffer>
#include "JCommandHandler.h"
#include "jnotificationhandler.h"

void JNotificationHandler::onNotification(
    std::unique_ptr<QWebEngineNotification> notification)
{
    qInfo() << "notification!!!";
    QImage image = notification->icon();
    QByteArray byteArray;
    QBuffer buffer(&byteArray);
    image.save(&buffer, "PNG");
    QString iconBase64 = QString::fromLatin1(byteArray.toBase64().data());
    QString origin = notification->origin().toEncoded();
    JCommand(OC::NOTIFICATION, -1)
        << notification->title() << origin << notification->message()
        << iconBase64;
}