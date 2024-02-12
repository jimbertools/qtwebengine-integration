#ifndef JIMBERX264WEBVIEW_H
#define JIMBERX264WEBVIEW_H

#include <QWebEngineView>
#include <QWebEngineFullScreenRequest>
#include <QWebEngineSettings>
#include <QTouchEvent>
#include <QGestureEvent>
#include <QCommandLineParser>

#include "jimberx264webpage.h"
#include "socketcommunication.h"
QT_BEGIN_NAMESPACE

class JimberX264WebView : public QWebEngineView
{
  Q_OBJECT
public:
  explicit JimberX264WebView(QWebEngineProfile *profile = Q_NULLPTR, QWidget *parent = Q_NULLPTR, QString clientIp = "");
  ~JimberX264WebView() override = default;
  void contextMenuEvent(QContextMenuEvent *event) override;

  void setTouchHandleVisibility(int id, bool visible) override;
  void setTouchHandleOpacity(int id, float opacity) override;
  void setTouchHandleBounds(int id, const QRect &rect) override;
  void setTouchHandleOrientation(int id, int orientation) override;
  void showTouchSelectionMenu(bool cut, bool copy, bool paste, const QRect &rect, const QSize &size) override;
  void hideTouchSelectionMenu() override;

  // virtual QWebEngineView *createWindow(QWebEnginePage::WebWindowType type);

  //    void grabGestures(const QVector<Qt::GestureType> &gestures);
  bool event(QEvent *);
public slots:
  void fullScreenRequest(QWebEngineFullScreenRequest request);
  

private:
  int getParentId();
  JimberX264WebPage m_page;
};

QT_END_NAMESPACE

#endif