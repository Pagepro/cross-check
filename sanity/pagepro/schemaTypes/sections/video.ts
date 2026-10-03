import { VscDeviceCameraVideo } from "react-icons/vsc";
import { defineField, defineType } from "sanity";

/**
 * Video (rulings R-3B-5 / R-3B-6 / R-3B-17). One section carries both Storyblok
 * video bloks, split by `variant`:
 *
 * - `player` (`video_player`, 14) — the click-to-play YouTube player with the
 *   schema.org VideoObject group (`molecules/VideoPlayer/index.tsx:46-59`).
 *   Ships UNGATED: nothing third-party loads before the visitor clicks play.
 * - `autoplay` (`autoplayVideo`, 13) — the silent looping Vimeo background clip
 *   (`molecules/AutoplayVideo/index.tsx:9-26`). Its iframe mounts with the page,
 *   so the renderer wraps it in the `functionality` consent gate (NO-10).
 *
 * The source's `width` (only ever `"672"`) and `alignment` (only ever the
 * centred `"0 auto"`) are NOT fields: the wrapper is a fixed, centred 42rem box
 * (`--width-video`), matching `molecules/VideoPlayer/styles.ts:37-41`.
 */
export default defineType({
  name: "video",
  title: "Video",
  icon: VscDeviceCameraVideo,
  type: "object",
  groups: [{ name: "content", default: true }, { name: "seo" }, { name: "options" }],
  fields: [
    defineField({
      name: "options",
      title: "Section options",
      type: "section-options",
      group: "options",
    }),
    defineField({
      name: "variant",
      title: "Variant",
      description:
        "Player — a thumbnail the visitor clicks to play, with optional search-engine video data. Autoplay — a silent looping background clip, which visitors must consent to before it loads.",
      type: "string",
      initialValue: "player",
      options: {
        layout: "radio",
        list: [
          { title: "Player — click to play, with captions data", value: "player" },
          { title: "Autoplay — muted looping background clip", value: "autoplay" },
        ],
      },
      group: "options",
    }),
    defineField({
      name: "url",
      title: "Video URL",
      description:
        "YouTube (player) or Vimeo (autoplay) URL — source `video_player.url` / `autoplayVideo.url`.",
      type: "url",
      /* https only (final review M7): `toEmbedUrl` rewrites YouTube/Vimeo to
         https regardless, so the only shape `http:` could reach is the direct-
         file fallback — which would emit `<video src="http://…">` and be blocked
         as mixed content on every https page. `calendly-widget` is already
         https-only; this matches it. */
      validation: (Rule) =>
        Rule.required()
          .uri({ scheme: ["https"] })
          .error("Without an https video URL the section renders nothing."),
      group: "content",
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      description:
        "Shown before playback and when reduced motion is requested. Leave empty for YouTube — the thumbnail is derived automatically. Aspect ratio 16:9, recommended 1920×1080px (landscape).",
      type: "img",
      group: "content",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      description:
        "Short line under the video. Also names the player for screen readers.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "aspectPercent",
      title: "Height (% of width)",
      description:
        "Height as a percentage of width (source `autoplayVideo.height`: 10 values spanning 42.48–60.28 — R-3B-6). 56.25 is 16:9.",
      type: "number",
      initialValue: 56.25,
      validation: (Rule) => Rule.min(10).max(200),
      hidden: ({ parent }) => parent?.variant !== "autoplay",
      group: "options",
    }),
    defineField({
      name: "videoObject",
      title: "Search engine video data",
      description:
        "schema.org VideoObject data emitted as JSON-LD when `name` is set (source `video_player`, `molecules/VideoPlayer/index.tsx:46-59`).",
      type: "object",
      group: "seo",
      hidden: ({ parent }) => parent?.variant !== "player",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "name",
          title: "Title",
          description: "Required by schema.org — without it nothing is emitted at all.",
          type: "string",
        }),
        defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
        defineField({ name: "thumbnailUrl", title: "Thumbnail URL", type: "url" }),
        defineField({ name: "uploadDate", title: "Upload date", type: "datetime" }),
        defineField({
          name: "duration",
          title: "Duration",
          description: "ISO-8601, e.g. PT2M55S",
          type: "string",
          /* A WARNING, not an error: schema.org wants an ISO-8601 duration and
             Google drops a `VideoObject` whose `duration` it cannot parse, but
             the four migrated values are transcribed content — a legacy value
             must never block a publish. `PT` alone is rejected (the lookahead
             requires at least one component), as is a bare `PT5` with no unit. */
          validation: (Rule) =>
            Rule.regex(
              /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/,
              { name: "ISO-8601 duration" },
            ).warning("Use an ISO-8601 duration, e.g. PT2M55S (2 minutes 55 seconds)."),
        }),
        defineField({ name: "embedUrl", title: "Embed URL", type: "url" }),
        defineField({
          name: "interactionCount",
          title: "View count",
          type: "number",
        }),
      ],
    }),
  ],
  initialValue: { variant: "player", aspectPercent: 56.25 },
  preview: {
    select: {
      variant: "variant",
      caption: "caption",
      url: "url",
      media: "poster.image",
    },
    prepare: ({ variant, caption, url, media }) => ({
      title: caption || "Video",
      subtitle: `${variant === "autoplay" ? "Autoplay" : "Player"} · ${url || "No URL yet"}`,
      media,
    }),
  },
});
