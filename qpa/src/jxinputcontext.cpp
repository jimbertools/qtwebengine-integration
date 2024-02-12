#include <QtCore/qdebug.h>

#include <QGuiApplication>
#include <QInputMethodQueryEvent>
#include <QRectF>
#include <QWindow>
#include "JCommandHandler.h"
#include "jxinputcontext.h"
#include "jxwsserver.h"
JxInputContext::JxInputContext() : QPlatformInputContext() {}

void JxInputContext::showInputPanel() {
  this->m_visible = true;
  if (QGuiApplication::focusWindow()) {
    JCommand(OC::SHOWINPUT, QGuiApplication::focusWindow()->winId());
  }
  emitInputPanelVisibleChanged();
}
void JxInputContext::hideInputPanel() {
  this->m_visible = false;

  if (QGuiApplication::focusWindow()) {
    JCommand(OC::HIDEINPUT, QGuiApplication::focusWindow()->winId());
  }

  emitInputPanelVisibleChanged();
}

bool JxInputContext::isInputPanelVisible() const {
  return this->m_visible;
}