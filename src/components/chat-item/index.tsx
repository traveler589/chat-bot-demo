import React from "react";
import { gptSvg, userSvg } from "../svg";
import S from "./index.module.scss";

export interface ChatItemProps {
  /** 角色 */
  role: "You" | "ChatGPT";
  /** 是否正在请求 */
  loading?: boolean;
  /** 聊天内容 */
  content: string;
}

export default function ChatItem({ role, content, loading }: ChatItemProps) {
  return (
    <div className={S.chatItem}>
      <div className={`${S.avatar} ${role}`}>
        {role === "You" ? userSvg : gptSvg}
      </div>
      <div className={S.panel}>
        <span className={S.role}>{role}</span>
        <div className={S.content}>
          {content}
          {loading && <i className={S.loading} />}
        </div>
      </div>
    </div>
  );
}
