#ifndef CLOSEEVENTFILTER
#define CLOSEEVENTFILTER

#include <QObject>
#include <QEvent>
#include <QDebug>
#include <QGuiApplication>
#include "JStreamer.h"
#include "../jxbackingstore.h"
class CloseEventFilter : public QObject
{
  Q_OBJECT
public:
  CloseEventFilter(QObject *parent) : QObject(parent) {}
  virtual ~CloseEventFilter()
  {
  }
  bool isClosed()
  {
    return closed;
  }

protected:
  bool eventFilter(QObject *obj, QEvent *event) override
  {
    if (event->type() == QEvent::Hide)
    {
      closed = true;
      QWindow *window = reinterpret_cast<QWindow *>(obj);
      if (!window->objectName().isEmpty())
      {
        // QWindow *parent = QGuiApplication::focusWindow();
        //I don't know of any other way to get the top window of this Widget. It has no "parent"...
        // int topLevelId = 0;
        // if (parent)
        // {
        //   topLevelId = parent->winId();
        // }
        for(auto streamer: JxBackingStore::streamers().values()) {
          streamer->windowClosed(window);
        }
      }
    }

    return QObject::eventFilter(obj, event);
  }

private:
  bool closed = false;
};
#endif