#pragma once

#include <private/qsimpledrag_p.h>
#include <qbackingstore.h>
#include <qdatetime.h>
#include <qpa/qplatformdrag.h>
#include <qpixmap.h>
#include <qpoint.h>
#include <qpointer.h>
#include <qrect.h>
#include <qsharedpointer.h>
#include <qvector.h>
#include <QtCore/QDebug>

QT_BEGIN_NAMESPACE

class QWindow;
class QPlatformWindow;
class QDrag;
class QPoint;

class JDrag : public QBasicDrag {
 public:
  JDrag();
  ~JDrag();

  //   bool eventFilter(QObject* o, QEvent* e) override;

  void startDrag() override;
  //   void cancel() override;
  void move(const QPoint& globalPos, Qt::MouseButtons b, Qt::KeyboardModifiers mods) override;
  void drop(const QPoint& globalPos, Qt::MouseButtons b, Qt::KeyboardModifiers mods) override;
  void endDrag() override;


 protected:
 private:
  QScreen* m_screen;
  QPoint lastMousePosition;
};

QT_END_NAMESPACE