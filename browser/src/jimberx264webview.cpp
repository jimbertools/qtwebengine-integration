#include "jimberx264webview.h"
#include <QTimer>

#include <QContextMenuEvent>
#include <QDropEvent>
#include <QMimeData>
#include <QToolTip>
#include <QWebEngineContextMenuData>
#include <QWebEngineHistory>
#include "JCommandHandler.h"
#include "jimberx264browser.h"

typedef OutgoingCommand OC;

JimberX264WebView::JimberX264WebView(QWebEngineProfile* profile, QWidget* parent, QString clientIp)
    : QWebEngineView(parent), m_page(profile, this, clientIp) {
  this->setAcceptDrops(true);
  this->setFocusPolicy(Qt::StrongFocus);
  this->setAttribute(Qt::WA_AlwaysShowToolTips, true);
  this->setPage(&m_page);
  this->setAttribute(Qt::WA_AcceptTouchEvents, true);
  this->settings()->setAttribute(QWebEngineSettings::FullScreenSupportEnabled, true);
  this->window()->setWindowState(this->window()->windowState() ^ Qt::WindowFullScreen);
  connect(this->page(), &QWebEnginePage::fullScreenRequested, this,
          &JimberX264WebView::fullScreenRequest);
}

int JimberX264WebView::getParentId() {
  return reinterpret_cast<JimberX264Browser*>(parent())->winId();
}

void JimberX264WebView::fullScreenRequest(QWebEngineFullScreenRequest request) {
  JCommand(OC::FULLSCREENREQUEST, getParentId()) << request.toggleOn();
  request.accept();
}

void JimberX264WebView::showTouchSelectionMenu(bool cut,
                                               bool copy,
                                               bool paste,
                                               const QRect& rect,
                                               const QSize&) {
  JCommand(OC::SHOWSELECTIONMENU, getParentId())
      << cut << copy << paste << rect.x() << rect.y() << rect.width() << rect.height();
}

void JimberX264WebView::hideTouchSelectionMenu() {
  JCommand(OC::HIDESELECTIONMENU, getParentId());
}

void JimberX264WebView::setTouchHandleBounds(int id, const QRect& rect) {
  JCommand(OC::SETTOUCHHANDLEBOUNDS, getParentId())
      << id << rect.x() << rect.y() << rect.width() << rect.height();
};

void JimberX264WebView::setTouchHandleOrientation(int id, int orientation) {
  JCommand(OC::SETTOUCHHANDLEORIENTATION, getParentId()) << id << orientation;
};

void JimberX264WebView::setTouchHandleVisibility(int id, bool visible) {
  JCommand(OC::SETTOUCHHANDLEVISIBILITY, getParentId()) << id << visible;
};

void JimberX264WebView::setTouchHandleOpacity(int id, float opacity) {
  JCommand(OC::SETTOUCHHANDLEOPACITY, getParentId()) << id << opacity;
};

bool JimberX264WebView::event(QEvent* ev) {
  return QWebEngineView::event(ev);
}

void JimberX264WebView::contextMenuEvent(QContextMenuEvent* event) {
  QWebEngineContextMenuData data = page()->contextMenuData();
  QWebEngineContextMenuData::EditFlags editFlags = data.editFlags();
  QWebEngineContextMenuData::MediaFlags mediaFlags = data.mediaFlags();
  qInfo() << mediaFlags;
  JCommand(OC::SHOWCONTEXTMENU, getParentId())
      << event->x() << event->y() << editFlags << data.isContentEditable()
      << page()->history()->canGoBack() << page()->history()->canGoForward()
      << data.linkUrl().toString() << data.mediaUrl().toString() << data.mediaType();
}

// void JimberX264WebView::dropEvent(QDropEvent *e)
// {
//     qInfo() << "[JimberX264WebView::dropEvent]" << e->type();
//     // e->acceptProposedAction();
// }