#define TARGET "nalfile.nal"
#define OUTPUT_CODEC AV_CODEC_ID_VP9
// #define OUTPUT_CODEC AV_CODEC_ID_VP8
#define OUTPUT_PIX_FMT AV_PIX_FMT_YUV420P
#include <csignal>
#include <fstream>
#include <iostream>
#include "canvasstreamer.h"

std::ofstream myfile;

CanvasStreamer::CanvasStreamer() : width_(1920), height_(1080), crf_(23) {
  std::cout << "CanvasStreamer::CanvasStreamer " << width_ << " " << height_ << std::endl
            << std::flush;
  // myfile.open("test.av1");
  std::string name = "/tmp/nals/";
  name.append(std::to_string((intptr_t)this));
  name.append(".nal");

  myfile.open(name, std::ios_base::binary);

  avformat_network_init();

  int err;
  // AVOutputFormat *fmt;

  av_register_all();
  fmt_ctx_ = avformat_alloc_context();
  if (fmt_ctx_ == nullptr) {
    std::cerr << "[CanvasStreamer::ctor] can not alloc av context" << std::endl;
  }

  fmt_ctx_->debug = AV_LOG_DEBUG;
  snprintf(fmt_ctx_->filename, sizeof(fmt_ctx_->filename), "%s", TARGET);

  codec_ = avcodec_find_encoder(OUTPUT_CODEC);
  if (!codec_) {
    std::cerr << "[CanvasStreamer::ctor] can't find encoder" << std::endl;
  }
  codec_ctx_ = avcodec_alloc_context3(codec_);

  resize(1920, 1080);
  uint8_t test[1920 * 1080 * 4] = {255};
  flush(test, width(), height());
  flush(test, width(), height());
  flush(test, width(), height());
  flush(test, width(), height());
  flush(test, width(), height());
  flush(test, width(), height());
};

void CanvasStreamer::cleanup() {
  return;
  if (frame_) {
    av_free(frame_->data[0]);
    av_frame_free(&frame_);
    if (fmt_ctx_) {
      avio_close(fmt_ctx_->pb);
    }
  }
}

CanvasStreamer::~CanvasStreamer() {
  cleanup();
}

void CanvasStreamer::flush(uint8_t* rgba, int realWidth, int realHeight) {
  const int in_linesize[1] = {4 * width_};

  sws_scale(sws_context_, (const uint8_t* const*)&rgba, in_linesize, 0, height_, frame_->data,
            frame_->linesize);

  int err;
  int got_output = 1;
  AVPacket pkt = {0};

  av_init_packet(&pkt);

  // Set frame pts, monotonically increasing, starting from 0
  // if (frame != NULL)
  if (frame_ == NULL) {
    std::cout << "[whaaaaaat?]" << std::endl;
  }
  frame_->pts = pts_++;

  err = avcodec_encode_video2(this->codec_ctx_, &pkt, frame_, &got_output);

  if (err < 0) {
    std::cerr << AVException(err, "encode frame").what() << std::endl;
    // return err;
  } else {
    // std::cout << "[CanvasStreamer::flush]avcodec_encode_video2  no error?"
    //           << std::endl;
  }

  if (got_output) {
    std::cout << "pkt.size: " << pkt.size << " -- pkt.data: " << pkt.data << std::endl;
    pkt.stream_index = 1;
    myfile.write((char*)pkt.data, pkt.size);
  } else {
    std::cout << "got no output!" << std::endl;
  }
};

void CanvasStreamer::resize(int width, int height) {
  //   if (width_ == width && height_ == height) {
  //     return;
  //   }

  width_ = width;
  height_ = height;
  cleanup();
  createNewContext();
}

void CanvasStreamer::createNewContext() {
  std::cout << "[CanvasStreamer::createNewContext] " << width_ << " " << height_ << std::endl;
  // Set codec_ctx to stream's codec structure
  codec_ctx_ = avcodec_alloc_context3(codec_);
  /* put sample parameters */

  // width = 700;
  // height = 800;
  codec_ctx_->time_base.den = 25;
  codec_ctx_->time_base.num = 1;
  codec_ctx_->width = width_;
  codec_ctx_->height = height_;
  codec_ctx_->pix_fmt = OUTPUT_PIX_FMT;
  codec_ctx_->gop_size = 5000;
  codec_ctx_->max_b_frames = 500;
  /* Apparently it's in the example in master but does not work in V11
  if (o_format_ctx->oformat->flags & AVFMT_GLOBALHEADER)
      codec_ctx->flags |= AV_CODEC_FLAG_GLOBAL_HEADER;
  */
  // H.264 specific options
  std::string s = std::to_string(crf_);
  char const* crfString = s.c_str();  // use char const* as target type

  // std::cout << "crfstring " << crfString << std::endl;
  int err;
  err = av_opt_set(codec_ctx_->priv_data, "crf", crfString, 0);
  if (err < 0) {
    std::cerr << "Error crf : " << AVException(err, "av_opt_set crf").what() << std::endl;
  }

  // Required for h264 - idk why
  // err = av_opt_set(codec_ctx_->priv_data, "profile", "baseline", 0);
  // if (err < 0) {
  //   std::cerr << "Error : profile "
  //             << AVException(err, "av_opt_set profile").what() << std::endl;
  // }

  // err = av_opt_set(codec_ctx_->priv_data, "tune", "zerolatency", 0);
  // if (err < 0) {
  //   // codec_ctx_->time_base.den = 25;
  //   // codec_ctx_->time_base.num = 1;
  //   std::cerr << "Error : " << AVException(err, "av_opt_set zerolatency").what()
  //             << std::endl;
  // }
  // end

  // Optional for h264
  // err = av_opt_set(codec_ctx_->priv_data, "preset", "ultrafast", 0);
  // if (err < 0) {
  //   std::cerr << "Error :  preset"
  //             << AVException(err, "av_opt_set preset").what() << std::endl;
  // }
  // end

  // ??? for vp9
  err = av_opt_set(codec_ctx_->priv_data, "quality", "realtime", 0);
  if (err < 0) {
    std::cerr << "Error : " << AVException(err, "av_opt_set quality").what() << std::endl;
  }
  err = av_opt_set(codec_ctx_->priv_data, "speed", "8", 0);
  if (err < 0) {
    std::cerr << "Error : " << AVException(err, "av_opt_set quality").what() << std::endl;
  }

  err = av_opt_set(codec_ctx_->priv_data, "rc_lookahead", "0", 0);
  if (err < 0) {
    std::cerr << "Error : " << AVException(err, "av_opt_set quality").what() << std::endl;
  }
  // end

  // It's necessary to open stream codec to link it to "codec" (the encoder).
  err = avcodec_open2(codec_ctx_, codec_, NULL);
  if (err < 0) {
    std::cerr << AVException(err, "avcodec_open2").what() << std::endl;
  }

  //* dump av format informations
  // std::cout << codec_ctx_ << " " << target << " ############# " <<
  // std::flush; av_dump_format(fmt_ctx_, 0, TARGET, 1);
  //*/
  AVDictionary* options = NULL;
  // av_dict_set(&options, "pkt_size", "130", 0);
  // av_dict_set(&options, "buffer_size", "0", 0);

  av_dict_set(&options, "pkt_size", "5000", 0);
  av_dict_set(&options, "buffer_size", "0", 0);
  int flags = AVIO_FLAG_WRITE;
  flags |= AVIO_FLAG_DIRECT;

  err = avio_open2(&fmt_ctx_->pb, TARGET, flags, NULL, &options);
  char errbuf[256];
  if (err < 0) {
    av_strerror(err, errbuf, sizeof(errbuf));
    std::cerr << AVException(err, "avio_open2").what() << std::endl;
    std::cerr << errbuf << std::endl;
  }
  frame_ = av_frame_alloc();

  frame_->format = OUTPUT_PIX_FMT;
  frame_->width = width_;
  frame_->height = height_;
  err = av_image_alloc(frame_->data, frame_->linesize, width_, height_, OUTPUT_PIX_FMT, 32);
  if (err < 0) {
    std::cerr << AVException(err, "av_image_alloc").what() << std::endl;
  }

  if (!frame_) {
    fprintf(stderr, "Could not allocate video frame\n");
    exit(1);
  }
  sws_context_ =
      sws_getCachedContext(NULL, width_, height_, AV_PIX_FMT_RGBA, width_, height_, OUTPUT_PIX_FMT,
                           // 394, 656, AV_PIX_FMT_YUV420P,
                           0, 0, 0, 0);
}

int main() {
  CanvasStreamer bus;
  std::cout << bus.width();
  return 1;
}