#pragma once
#include <QString>

struct Credentials
{
    Credentials(){};
    Credentials(const QString user, const QString password)
    {
        this->user = user;
        this->password = password;
    }
    QString user;
    QString password;
};
