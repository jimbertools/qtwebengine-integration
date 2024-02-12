#include "jxcursor.h"
#include <QtGui/private/qguiapplication_p.h>
#include "JCommandHandler.h"
#include "jxintegration.h"
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

typedef OutgoingCommand OC;

JxCursor::JxCursor()
    : QPlatformCursor(),
      first(true)

{}

void JxCursor::changeCursor(QCursor* windowCursor, QWindow* window) {
  if (windowCursor == nullptr || window == nullptr) {
    return;
  }

  int topLevelId = window->winId();
  if (window->parent()) {
    topLevelId = window->parent()->winId();
  }

  JCommand(OC::CURSOR, topLevelId) << QString::number(windowCursor->shape());
}