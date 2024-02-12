#include "jpopupwindow.h"
#include <QCloseEvent>

#include "JCommandHandler.h"
#include "jimberx264browser.h"
#include "jimberx264webview.h"
#include "jxwindowcontroller.h"

typedef OutgoingCommand OC;

JPopupWindow::JPopupWindow(QWebEngineProfile *profile, int parentWinId, QWidget *parent )
    : QWidget(parent) ,m_webview(profile, this)
{
  this->setFocusPolicy(Qt::StrongFocus);
  this->setAttribute(Qt::WA_Hover);
  m_layout.setMargin(0);
  setLayout(&m_layout);
  m_layout.addWidget(&m_webview);

  connect(page(), &QWebEnginePage::geometryChangeRequested, this,
          &JPopupWindow::adjustGeometry);
  connect(m_webview.page(), &QWebEnginePage::windowCloseRequested, this,
          &QWidget::close);
  this->resize(500, 500);

  JCommand(OC::POPUPOPENED, parentWinId)
      << QString::number(this->winId()) << this->geometry().x()
      << this->geometry().y() << this->geometry().width()
      << this->geometry().height();
};

QWebEnginePage *JPopupWindow::page() const { return m_webview.page(); }

void JPopupWindow::closeEvent(QCloseEvent *event) //event
{
  int winId = this->winId();
  JxWindowController::instance().removeWindow(winId);
  JCommand(OC::POPUPCLOSED, winId);

  QWidget::closeEvent(event);
};

bool JPopupWindow::event(QEvent *event)
{
  return QWidget::event(event);
}

// void JPopupWindow::resizeEvent(QResizeEvent *event)
// {
//   auto newSize = event->size();

//   // JCommand(OC::POPUPRESIZED, this->winId())
//   //     << newSize.width() << newSize.height();

//   // QWidget::resizeEvent(event);
// }

void JPopupWindow::adjustGeometry(const QRect &newGeometry)
{
  const int x1 = frameGeometry().left() - geometry().left();
  const int y1 = frameGeometry().top() - geometry().top();
  const int x2 = frameGeometry().right() - geometry().right();
  const int y2 = frameGeometry().bottom() - geometry().bottom();
  setGeometry(newGeometry.adjusted(x1, y1, x2, y2));
  this->m_webview.resize(newGeometry.width(), newGeometry.height());
    JCommand(OC::POPUPRESIZED, this->winId())
      << newGeometry.width() <<  newGeometry.height();
};

