"use client";

import { Box, Button, Flex, Spinner } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import { useState } from "react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

const PreviewOG = ({ title }: { title?: string }) => {
  const [open, setOpen] = useState(false);

  const url = `${BASE_URL}/api/og?title=${encodeURIComponent(title ?? "")}`;

  return (
    <Popover
      style={{ overflow: "hidden" }}
      constrainSize
      animate
      placement="right-start"
      open={open}
      content={
        <Box style={{ display: "grid", placeItems: "center" }}>
          <Flex style={{ gridArea: "1 / 1 / -1 / -1" }}>
            <Spinner muted />
          </Flex>
          <img
            style={{
              gridArea: "1 / 1 / -1 / -1",
              position: "relative",
              display: "block",
              width: 300,
              height: "auto",
            }}
            alt=""
            src={url}
            width={1200}
            height={630}
          />
        </Box>
      }
    >
      <Button
        mode="bleed"
        padding={2}
        style={{ marginTop: -4 }}
        icon={open ? VscEyeClosed : VscEye}
        title="Preview Open Graph image"
        onClick={() => setOpen((o) => !o)}
      />
    </Popover>
  );
};

export default PreviewOG;
