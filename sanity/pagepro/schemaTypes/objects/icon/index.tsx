import { defineField } from "sanity";

import utilityIcons from "@/sanity/pagepro/stubs/utility-icons";

import IconSelectInput from "./IconSelectInput";

export default defineField({
  name: "icon",
  title: "Icon",
  description: "Select an icon from the available options below",
  type: "string",
  options: {
    list: utilityIcons.map((icon) => ({
      title: icon.name,
      value: icon.value,
    })),
  },
  components: {
    input: IconSelectInput,
  },
});
