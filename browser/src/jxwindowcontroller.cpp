
#include "jxwindowcontroller.h"
#include "jimberx264browser.h"
#include "jpopupwindow.h"

void JxWindowController::addTabWindow(JTabWindowPtr window) {
  this->m_tabWindows.insert(window->winId(), window);
}

JxWindowController& JxWindowController::instance() {
  static JxWindowController instance;
  return instance;
}
void JxWindowController::addPopupWindow(JPopupWindowPtr window) {
  this->m_popupWindows.insert(window->winId(), window);
}

void JxWindowController::removeWindow(int winId) {
  // this->m_tabWindows.value(winId).clear();

  this->m_popupWindows.remove(winId);
  this->m_tabWindows.remove(winId);
}

void JxWindowController::closeWindow(int winId) {
  JxWindowController::instance().removeWindow(winId);
}
void closeWindow(int winId) {
  JxWindowController::instance().closeWindow(winId);
}

void JxWindowController::focusWindow(int winId) {
  auto popupWindow = m_popupWindows.value(winId);
  if (!popupWindow.isNull()) {
    popupWindow->setFocus();
    popupWindow->raise();
    popupWindow->show();
    return;
  }

  auto tabWindow = m_tabWindows.value(winId);
  if (!tabWindow.isNull()) {
    tabWindow->setFocus();
    tabWindow->raise();
    tabWindow->show();
    for (int i = 0; i < tabWindow->children().size(); i++) {
      if (tabWindow->children().at(i)->isWidgetType())
        reinterpret_cast<QWidget*>(tabWindow->children().at(i))->setFocus();
    }
    return;
  }
}
void focusWindow(int winId) {
  JxWindowController::instance().focusWindow(winId);
}

void JxWindowController::blurWindow(int winId) {
  auto popupWindow = m_popupWindows.value(winId);
  if (!popupWindow.isNull()) {
    popupWindow->releaseKeyboard();
    return;
  }

  auto tabWindow = m_tabWindows.value(winId);
  if (!tabWindow.isNull()) {
    tabWindow->releaseKeyboard();
    return;
  }
}
void blurWindow(int winId) {
  JxWindowController::instance().blurWindow(winId);
}

void JxWindowController::clearFocus(int winId) {
  auto popupWindow = m_popupWindows.value(winId);
  if (!popupWindow.isNull()) {
    popupWindow->hide();
    popupWindow->releaseKeyboard();
    popupWindow->clearFocus();
    return;
  }

  auto tabWindow = m_tabWindows.value(winId);
  if (!tabWindow.isNull()) {
    tabWindow->hide();
    tabWindow->clearFocus();
    tabWindow->releaseKeyboard();
    return;
  }
}
void clearFocus(int winId) {
  JxWindowController::instance().clearFocus(winId);
}
