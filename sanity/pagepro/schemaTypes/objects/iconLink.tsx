import { VscLink } from "react-icons/vsc";
import { defineType } from "sanity";

import { extendModel } from "@/sanity/pagepro/lib/model";
import resolveSlug from "@/sanity/pagepro/lib/resolveSlug";
import Icon from "@/sanity/pagepro/stubs/Icon";

import { linkBaseFields, linkBasePreviewSelect } from "../partials/linkBaseSchema";

import iconField from "./icon";

export default defineType({
  name: "iconLink",
  title: "Icon link",
  icon: VscLink,
  type: "object",
  fields: [
    ...linkBaseFields,
    extendModel(
      iconField,
      {
        title: "Icon",
        name: "icon",
      },
      {
        fieldsToSkip: ["iconPlacement"],
      },
    ),
  ],
  preview: {
    select: {
      icon: "icon.icon",
      ...linkBasePreviewSelect,
    },
    prepare: ({ type, internal, params, external, icon: linkIcon }) => ({
      title: `${resolveSlug({ type, internal, params, external })} • Icon Link`,
      media: linkIcon ? <Icon icon={linkIcon as never} className="fill-current" /> : null,
    }),
  },
});
