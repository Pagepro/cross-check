import { type SchemaTypeDefinition } from "sanity";

import typeSource from "./documents/__type-source";
import agentSkill from "./documents/agent-skill";
import author from "./documents/author";
import caseStudiesListingPage from "./documents/case-studies-listing-page";
import caseStudy from "./documents/case-study";
import footer from "./documents/footer";
import globalSection from "./documents/global-section";
import header from "./documents/header";
import jobOverride from "./documents/job-override";
// documents
import page from "./documents/page";
import redirect from "./documents/redirect";
import sharedSection from "./documents/shared-section";
import site from "./documents/site";
import testimonial from "./documents/testimonial";
import buttonIcon from "./objects/buttonIcon";
// objects
import calendlyCard from "./objects/calendly-card";
import contactFormFields from "./objects/contact-form-fields";
import cta from "./objects/cta";
import dataTableCell from "./objects/data-table-cell";
import headerMegaMenu from "./objects/header-mega-menu";
import headerCta from "./objects/headerCta";
import headerLink from "./objects/headerLink";
import headerLinkList from "./objects/headerLink.list";
import icon from "./objects/icon";
import img from "./objects/img";
import link from "./objects/link";
import linkList from "./objects/link.list";
import marqueeBand from "./objects/marquee-band";
import megaMenuCard from "./objects/mega-menu-card";
import megaMenuTile from "./objects/mega-menu-tile";
import metadata from "./objects/metadata";
import richText from "./objects/richText";
import callout from "./objects/richText/blocks/callout";
import checklist from "./objects/richText/blocks/checklist";
import decoratedList from "./objects/richText/blocks/decorated-list";
import pullquote from "./objects/richText/blocks/pullquote";
import rule from "./objects/richText/blocks/rule";
import videoEmbed from "./objects/richText/blocks/video-embed";
import featureCardRichText from "./objects/richText/featureCardRichText";
import pageRichText from "./objects/richText/pageRichText";
import simpleRichText from "./objects/richText/simpleRichText";
import tableCellRichText from "./objects/richText/tableCellRichText";
import timelineRichText from "./objects/richText/timelineRichText";
import sectionOptions from "./objects/section-options";
import seoFields from "./objects/seo-fields";
import simpleLink from "./objects/simpleLink";
import slaComparisonRow from "./objects/sla-comparison-row";
import slaPackageCopy from "./objects/sla-package-copy";
// sections
import aiAssessment from "./sections/ai-assessment";
import calendlyWidget from "./sections/calendly-widget";
import cardGrid from "./sections/card-grid";
import careerJobs from "./sections/career-jobs";
import caseStudies from "./sections/case-studies";
import caseStudiesListing from "./sections/case-studies-listing";
import caseStudyHero from "./sections/case-study-hero";
import clutchWidget from "./sections/clutch-widget";
import comparisonTable from "./sections/comparison-table";
import contactForm from "./sections/contact-form";
import content from "./sections/content";
import contentColumns from "./sections/content-columns";
import ctaBanner from "./sections/cta-banner";
import dataTable from "./sections/data-table";
import downloadForm from "./sections/download-form";
import faq from "./sections/faq";
import featureBlock from "./sections/feature-block";
import featureGrid from "./sections/feature-grid";
import healthReport from "./sections/health-report";
import hero from "./sections/hero";
import imageComparison from "./sections/image-comparison";
import logosCarousel from "./sections/logos-carousel";
import mediaGallery from "./sections/media-gallery";
import newsletter from "./sections/newsletter";
import offices from "./sections/offices";
import pricing from "./sections/pricing";
import questionnaireForm from "./sections/questionnaire-form";
import servicesGrid from "./sections/services-grid";
import sharedSectionRef from "./sections/shared-section-ref";
import slaPackages from "./sections/sla-packages";
import splitSections from "./sections/split-sections";
import stats from "./sections/stats";
import tabs from "./sections/tabs";
import technologiesGrid from "./sections/technologies-grid";
import testimonials from "./sections/testimonials";
import textBlock from "./sections/text-block";
import timeline from "./sections/timeline";
import video from "./sections/video";

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  caseStudiesListingPage,
  site,
  header,
  footer,
  page,
  globalSection,
  sharedSection,
  redirect,
  testimonial,
  caseStudy,
  author,
  jobOverride,
  agentSkill,
  typeSource,

  // objects
  calendlyCard,
  contactFormFields,
  cta,
  img,
  link,
  linkList,
  marqueeBand,
  metadata,
  sectionOptions,
  seoFields,
  simpleLink,
  richText,
  simpleRichText,
  featureCardRichText,
  tableCellRichText,
  timelineRichText,
  pageRichText,
  pullquote,
  callout,
  videoEmbed,
  checklist,
  decoratedList,
  rule,
  headerLink,
  headerLinkList,
  headerCta,
  headerMegaMenu,
  megaMenuTile,
  megaMenuCard,
  icon,
  buttonIcon,
  dataTableCell,
  slaPackageCopy,
  slaComparisonRow,

  // sections
  aiAssessment,
  calendlyWidget,
  cardGrid,
  careerJobs,
  caseStudies,
  caseStudiesListing,
  caseStudyHero,
  clutchWidget,
  comparisonTable,
  contactForm,
  content,
  contentColumns,
  ctaBanner,
  dataTable,
  downloadForm,
  faq,
  featureBlock,
  featureGrid,
  healthReport,
  hero,
  imageComparison,
  logosCarousel,
  mediaGallery,
  newsletter,
  offices,
  pricing,
  questionnaireForm,
  servicesGrid,
  sharedSectionRef,
  slaPackages,
  splitSections,
  stats,
  tabs,
  technologiesGrid,
  testimonials,
  textBlock,
  timeline,
  video,
];
