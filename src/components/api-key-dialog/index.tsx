import React, { useRef, useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { checkKey } from "../../utils/api";

interface Props {
  onLoad(): void;
}

export default function ApiKeyDialog({ onLoad }: Props) {
  // 是否已初始化
  const inited = useRef(false);
  // 按钮loading
  const [loading, setLoading] = useState(false);
  // apiKey校验
  const [error, setError] = useState<string | null>();
  // 弹窗是否展示
  const [open, setOpen] = useState(false);

  // 初始化检验apiKey
  useEffect(() => {
    if (inited.current) {
      return;
    }

    // 初始化只执行一次
    inited.current = true;

    const apiKey = sessionStorage.getItem("apiKey");

    if (apiKey) {
      checkKey(apiKey)
        .then(() => onLoad())
        .catch(() => {
          sessionStorage.removeItem("apiKey");
          setOpen(true);
        });
    } else {
      setOpen(true);
    }
  }, [onLoad]);

  // 关闭弹窗
  const handleClose = (_?, reason?: string) => {
    // 阻止点击蒙层关闭
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  // 输入
  const changeInput = () => {
    if (error) {
      setError(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown
      PaperProps={{
        component: "form",
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();

          setLoading(true);

          const formData = new FormData(e.currentTarget);
          const { apiKey } = Object.fromEntries((formData as any).entries());

          checkKey(apiKey)
            .then(() => {
              sessionStorage.setItem("apiKey", apiKey);
              onLoad();
              handleClose();
            })
            .catch(() => {
              setError("api key 不正确或服务异常");
            })
            .finally(() => {
              setLoading(false);
            });
        },
      }}
    >
      <DialogTitle>OpenRouter API key</DialogTitle>
      <DialogContent>
        <DialogContentText>
          请填入 OpenRouter API key 来调用 gpt-3.5-turbo-1106：
        </DialogContentText>
        <TextField
          autoFocus
          required
          error={!!error}
          name="apiKey"
          margin="dense"
          fullWidth
          variant="standard"
          helperText={error}
          label="OpenRouter API key"
          onChange={changeInput}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={loading}
          loadingIndicator="SAVING..."
          type="submit"
        >
          确定
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
