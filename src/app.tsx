import React, { useRef, useState, useEffect } from "react";
import { TextField, Button, InputAdornment } from "@mui/material";
import ChatItem, { ChatItemProps } from "./components/chat-item";
import ApiKeyDialog from "./components/api-key-dialog";
import { gptSvg, sendSvg } from "./components/svg";
import { getAnswer } from "./utils/api";
import S from "./app.module.scss";

interface ItemAttrs extends ChatItemProps {
  id: string;
}

export default function App() {
  // app元素
  const appRef = useRef<HTMLDivElement>(null);
  // 停止响应方法
  const abortRef = useRef<(() => void) | null>();
  // 是否展示
  const [show, setShow] = useState(false);
  // 是否请求加载中
  const [loading, setLoading] = useState(false);
  // 输入框内容
  const [content, setContent] = useState("");
  // 聊天记录
  const [chatRecords, setChatRecords] = useState<ItemAttrs[]>([]);

  const scrollToBottom = () => {
    if (!appRef.current) {
      return;
    }

    // 滚动到底部
    appRef.current.scrollTop = appRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatRecords]);

  // 初始化完成
  const onLoad = () => {
    setShow(true);
  };

  // 输入
  const onChange = (e) => {
    setContent(e.target.value);
  };

  // 提交
  const handleSubmit = (e?) => {
    if (!content) {
      return;
    }

    // 输入框按回车
    if (e && e.keyCode !== 13) {
      return;
    }

    setLoading(true);

    const id = Date.now();
    const last: ItemAttrs = {
      role: "ChatGPT",
      id: `ChatGPT-${id}`,
      content: "",
      loading: true,
    };

    const next: ItemAttrs[] = [
      ...chatRecords,
      {
        content,
        role: "You",
        id: `You-${id}`,
      },
    ];

    setChatRecords(next);

    // 发送请求
    getAnswer(content, (raw, stream) => {
      last.content = raw;
      setChatRecords([...next, last]);

      // 记录终止请求方法
      if (stream && !abortRef.current) {
        abortRef.current = () => {
          stream.controller.abort();
        };
      }
    })
      .catch(() => {
        last.content = "服务异常！";
      })
      .finally(() => {
        last.loading = false;
        setChatRecords([...next, last]);
        abortRef.current = null;
        setLoading(false);
      });

    // 清空输入框
    setContent("");
  };

  // 停止响应
  const handleStop = () => {
    // 停止响应
    abortRef.current?.();
  };

  // 渲染聊天记录列表
  const renderList = () => {
    if (chatRecords.length) {
      return chatRecords.map(({ id, ...props }) => (
        <ChatItem key={id} {...props} />
      ));
    }

    return (
      <div className={S.welcome}>
        <span className="icon">{gptSvg}</span>
        <h1>今天能帮您些什么？</h1>
      </div>
    );
  };

  return (
    <div className={S.app}>
      {show && (
        <>
          <div ref={appRef} className={S.body}>
            {renderList()}
          </div>
          <div className={S.foot}>
            <TextField
              fullWidth
              value={content}
              variant="outlined"
              placeholder={`给“chatGPT”发送消息`}
              onChange={onChange}
              onFocus={scrollToBottom}
              onKeyDown={handleSubmit}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loading ? (
                      <span className={S.stop} onClick={handleStop} />
                    ) : (
                      <Button
                        variant="contained"
                        disabled={!content}
                        className={S.submit}
                        onClick={() => handleSubmit()}
                      >
                        {sendSvg}
                      </Button>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </>
      )}

      <ApiKeyDialog onLoad={onLoad} />
    </div>
  );
}
