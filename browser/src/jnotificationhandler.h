#pragma once
#include <memory>

#include <QtCore/QObject>
#include <QWebEngineNotification>

class JNotificationHandler : public QObject
{
    Q_OBJECT
public:
    static JNotificationHandler &instance()
    {
        static JNotificationHandler instance; // Guaranteed to be destroyed.
                                              // Instantiated on first use.
        return instance;
    }

    ~JNotificationHandler() {};

    void onNotification(std::unique_ptr<QWebEngineNotification> notification);

private:
    JNotificationHandler() {};
};