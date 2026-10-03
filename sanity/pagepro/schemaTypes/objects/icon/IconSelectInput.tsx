import { Stack, Card, Text, Flex, Button } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import { useState, useRef, useEffect, Suspense } from "react";
import type { FC, SVGProps } from "react";
import type { StringInputProps } from "sanity";
import { set, unset } from "sanity";

import utilityIconsMap from "@/sanity/pagepro/stubs/utility-icons-map";

// We can modify that to include different type of icons in the future
// Like navigation icons, featured icons, etc.
// You need to follow the same pattern as the utility icons directory and files

// Helper component to render SVG icon components
const LazyIcon: FC<{
  component: FC<SVGProps<SVGSVGElement>>;
  style?: React.CSSProperties;
}> = ({ component: Component, style }) => <Component style={style} />;

const IconSelectInput = (props: StringInputProps) => {
  const { value, onChange, schemaType } = props;
  const { options } = schemaType || {};
  const { list } = options || {};

  const currentIcon = value;
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const utilityIconsList =
    list?.filter(
      (icon) => typeof icon !== "string" && icon?.value?.startsWith("utility-"),
    ) || [];

  const allIcons = utilityIconsList?.length
    ? [
        {
          category: "Utility",
          icons: utilityIconsList.map((icon) => {
            const name = typeof icon === "string" ? icon : icon.title;
            const itemValue = typeof icon === "string" ? icon : icon.value;
            const component = utilityIconsMap[itemValue as keyof typeof utilityIconsMap];

            return {
              name,
              value: itemValue,
              component,
            };
          }),
        },
      ]
    : [];

  const handleIconSelect = (iconValue: string) => {
    onChange(iconValue ? set(iconValue) : unset());
    setIsOpen(false);
  };

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const selectedIconData = allIcons
    .flatMap(({ icons }) => icons)
    .find((icon) =>
      typeof icon === "string" ? icon === currentIcon : icon.value === currentIcon,
    );

  return (
    <Stack gap={4} ref={popoverRef}>
      <Popover
        content={
          <Card
            padding={3}
            radius={2}
            shadow={2}
            style={{ maxHeight: "350px", overflowY: "auto" }}
          >
            <Stack gap={3}>
              {allIcons.map(({ category, icons }) => (
                <Stack key={category} gap={2}>
                  <Text size={1} weight="semibold" style={{ padding: "4px 0" }}>
                    {category} Icons
                  </Text>
                  <Stack gap={1}>
                    {icons.map((icon) => {
                      const IconComponent = icon.component;
                      const isSelected = currentIcon === icon.value;

                      return (
                        <Button
                          key={icon.value}
                          padding={2}
                          radius={2}
                          mode={isSelected ? "default" : "ghost"}
                          onClick={() => handleIconSelect(icon.value || "")}
                        >
                          <Flex align="center" gap={2}>
                            <Flex
                              align="center"
                              justify="center"
                              style={{ width: "20px", height: "20px", flexShrink: 0 }}
                            >
                              <Suspense
                                fallback={
                                  <div
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      fill: "currentColor",
                                    }}
                                  />
                                }
                              >
                                <LazyIcon
                                  component={IconComponent}
                                  style={{ fill: "currentColor", fontSize: "20px" }}
                                />
                              </Suspense>
                            </Flex>
                            <Text
                              size={2}
                              style={{
                                flex: 1,
                              }}
                            >
                              {icon.name}
                            </Text>
                          </Flex>
                        </Button>
                      );
                    })}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Card>
        }
        open={isOpen}
        placement="bottom-start"
        portal
        referenceElement={popoverRef.current}
      >
        <Button
          ref={buttonRef}
          mode="ghost"
          padding={3}
          radius={2}
          style={{
            width: "100%",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Flex align="center" gap={2}>
            {selectedIconData ? (
              <>
                <Flex
                  align="center"
                  justify="center"
                  style={{ width: "32px", height: "32px" }}
                >
                  <Suspense
                    fallback={
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          fill: "currentColor",
                        }}
                      />
                    }
                  >
                    <LazyIcon
                      component={selectedIconData.component}
                      style={{ fill: "currentColor", fontSize: "32px" }}
                    />
                  </Suspense>
                </Flex>
                <Text size={2}>{selectedIconData.name}</Text>
              </>
            ) : (
              <Text size={2} style={{ color: "#666" }}>
                Select an icon...
              </Text>
            )}
          </Flex>
        </Button>
      </Popover>
    </Stack>
  );
};

export default IconSelectInput;
