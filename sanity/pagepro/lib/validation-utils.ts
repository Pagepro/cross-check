import get from "lodash/get";
import toString from "lodash/toString";
import {
  isKeyedObject,
  isKeySegment,
  type CustomValidatorResult,
  type KeyedSegment,
  type Path,
  type PathSegment,
  type Rule,
  type RuleBuilder,
  type RuleDef,
  type Schema,
  type ValidationContext,
} from "sanity";
import type {
  CustomValidator,
  FieldDefinition,
  SlugRule,
  SlugValue,
  ValidationBuilder,
  ValidationMarker,
} from "sanity";

/**
 * Marks a field as required
 */
export function requiredField<TRule extends RuleDef<TRule>>(rule: TRule): TRule {
  return rule.required().error("This field is required");
}

/**
 * Validates array length between min and max values
 */
export function minMaxValidation(rule: Rule, min: number, max: number) {
  return rule.min(min).max(max).error(`Must be between ${min} and ${max} items`);
}

/**
 * Ensures array values are unique
 */
export function uniqueArrayValues(rule: Rule) {
  return rule.unique().error("All items must be unique");
}

/**
 * Validates URLs with security checks
 */
export function validateUrl(rule: Rule) {
  return rule
    .uri({
      scheme: ["http", "https", "mailto", "tel"],
    })
    .custom((url) => {
      if (!url) return true;

      // Security checks
      if (typeof url === "string" && url.includes("javascript:")) {
        return "JavaScript in URLs is not allowed for security reasons";
      }

      // Ensure URL is properly formatted
      try {
        if (typeof url === "string") {
          new URL(url);
        }

        return true;
      } catch {
        return "Please enter a valid URL";
      }
    });
}

/**
 * Validates media fields to ensure they meet requirements
 * @param value The field value to validate
 * @returns true if valid, error message if invalid
 */
export const validateMediaField: CustomValidator<unknown[] | undefined> = (value) => {
  const hasImage = value && value.length > 0;

  if (!hasImage) {
    return "An image is required";
  }

  return true;
};

/**
 * Validates date is not in the future
 */
export function validatePastDate(rule: Rule) {
  return rule.custom((date) => {
    if (!date) return true;
    if (typeof date === "string") {
      return new Date(date) <= new Date() ? true : "Date cannot be in the future";
    }

    return true;
  });
}

/**
 * Validates slug format
 */
export function validateSlug(rule: Rule) {
  return rule.custom((slug: any) => {
    if (!slug?.current) return true;

    const current = String(slug.current);

    // Check for valid characters
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // Check length
    if (current.length > 100) {
      return "Slug is too long (max 100 characters)";
    }

    return true;
  });
}

/**
 * Validates hex color code
 */
export function validateHexColor(rule: Rule) {
  return rule.custom((color) => {
    if (!color) return true;
    if (typeof color === "string") {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
        ? true
        : "Must be a valid hex color code";
    }

    return true;
  });
}

const getSegmentField = (
  acc: {
    object: unknown;
    path: string | number | Path | KeyedSegment;
  },
  segment: PathSegment,
  fields: FieldDefinition[],
): unknown | undefined => {
  /**
   * If the segment is a string, then it's a field,
   * if not, then it's an object with _key inside,
   * which means that acc.object is an array
   */

  if (typeof segment === "string") {
    return fields.find((field) => field.name === segment);
  }

  if (Array.isArray(acc.object) && isKeySegment(segment)) {
    return acc.object.find((item) => item._key === segment._key);
  }

  throw new Error("Should never get here, you need to investigate");
};

const getFieldType = (field: unknown): string => {
  if (!field || typeof field !== "object") {
    throw new Error("Field is not an object");
  }

  if ("type" in field && typeof field.type === "string") {
    return field.type;
  }

  if ("_type" in field && typeof field._type === "string") {
    return field._type;
  }

  throw new Error("Field type not found");
};

const getNewPath = (
  value: unknown,
  {
    path,
    segment,
    jsonType,
  }: {
    path: string | number | Path | KeyedSegment;
    segment: PathSegment;
    jsonType: string;
  },
) => {
  const nextSegment = (() => {
    switch (jsonType) {
      case "object":
        return segment;
      case "array":
        if (isKeyedObject(segment)) {
          return { _key: segment._key };
        }

        return Array.isArray(value) ? value.indexOf(segment) : undefined;
      default:
        return undefined;
    }
  })();

  if (!nextSegment) {
    return path;
  }

  return Array.isArray(path) && path.length <= 0
    ? segment
    : [...(Array.isArray(path) ? path : [path]), nextSegment];
};

export const isStringIndexable = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAnyOfAncestorsHidden = (fieldContext: ValidationContext) => {
  let isHidden = false;

  // TODO: Make it work with the global getSchemaByType util,
  // example: add a decor with empty link in richText

  const _getSchemaByType = (schema: Schema, documentType: string | undefined) => {
    if (!documentType) {
      return undefined;
    }

    return schema._original?.types.find((schemaType) => schemaType.name === documentType);
  };

  fieldContext.path?.reduce<{
    object: unknown | undefined;
    path: string | number | Path | KeyedSegment;
  }>(
    (acc, segment, index) => {
      // We don't need to check further
      if (isHidden) {
        return acc;
      }

      const parentSchemaType = !Array.isArray(acc.object)
        ? _getSchemaByType(
            fieldContext.schema,
            typeof acc.object === "object" &&
              acc.object &&
              "_type" in acc.object &&
              typeof acc.object._type === "string"
              ? acc.object._type
              : undefined,
          )
        : (() => {
            /* If acc.object is an array, then it doesn't have a type property,
               but we can still get it from context */
            if (typeof segment === "string" || !segment) {
              return undefined;
            }

            const parentType = fieldContext?.path?.[index - 1];

            return parentType
              ? _getSchemaByType(fieldContext.schema, String(parentType))
              : undefined;
          })();

      if (!parentSchemaType) {
        return acc;
      }

      const { fields = [] } =
        "fields" in parentSchemaType ? parentSchemaType : { fields: [] };

      const segmentField = getSegmentField(acc, segment, fields);

      if (!segmentField) {
        return acc;
      }

      const object: unknown = (() => {
        if (typeof segment === "string") {
          return isStringIndexable(acc.object) ? acc.object[segment] : undefined;
        }

        if (Array.isArray(acc.object) && isKeySegment(segment)) {
          return acc.object.find((item) => item._key === segment._key);
        }

        return acc;
      })();

      const { hidden } =
        typeof segmentField === "object" && "hidden" in segmentField
          ? segmentField
          : { hidden: false };

      const segmentSchemaType = fieldContext.schema.get(getFieldType(segmentField));

      const newPath = getNewPath(object, {
        path: acc.path,
        jsonType: segmentSchemaType?.jsonType || "",
        segment,
      });

      isHidden =
        typeof hidden === "function"
          ? hidden({
              document: fieldContext.document,
              getDocumentExists: fieldContext.getDocumentExists,
              parent: acc.object,
              path: newPath,
              type: segmentSchemaType,
            })
          : !!hidden;

      return {
        ...acc,
        object,
        path: newPath,
      };
    },
    {
      object: fieldContext.document,
      path: [],
    },
  );

  return isHidden;
};

export const getValidationResultMessage = (validationResult: ValidationMarker[]) => {
  if (!validationResult || !validationResult.length) {
    return true;
  }

  const [{ message }] = validationResult;

  if (!message) {
    return true;
  }

  return message;
};

export const makeVisibleFieldValidator =
  <TRule extends RuleDef<TRule>>(rules: (_rule: TRule) => TRule) =>
  (rule: TRule): RuleBuilder<TRule> => {
    const combinedRules = rules(rule);

    return rule.custom(async (value, context): Promise<CustomValidatorResult> => {
      const hiddenDelegate = context.type?.hidden;

      const isHidden =
        typeof hiddenDelegate === "function"
          ? hiddenDelegate({
              value,
              currentUser: null,
              parent: context.parent || {},
              document: context.document,
              path: context.path ?? [],
            })
          : !!hiddenDelegate;

      if (
        isHidden ||
        isAnyOfAncestorsHidden(context) ||
        !("validate" in combinedRules) ||
        typeof combinedRules.validate !== "function"
      ) {
        return true;
      }

      const validationResult = await combinedRules.validate(value, context);

      return getValidationResultMessage(validationResult);
    });
  };

export const makeBaseSlugValidator =
  (
    rules?: (_rule: SlugRule) => SlugRule,
    required = true,
  ): ValidationBuilder<SlugRule, SlugValue> =>
  (rule) =>
    rule.custom(async (slug, context) => {
      const { document } = context;

      if (!document) {
        return true;
      }

      const allRules = rules ? rules(rule) : rule;

      if (required) {
        allRules.required();
      }

      /**
       * The cast to Rule is needed here, because Sanity transforms the RuleDef into the Rule in runtime
       * But this is not reflected in the types and the helpers functions are not exported
       */
      const validationResult = await (allRules as Rule).validate(slug, context);

      const errorOrResult = getValidationResultMessage(validationResult);

      return errorOrResult;
    });

export const makeSlugPrefixValidator = (prefix: string) => (rule: SlugRule) =>
  rule.custom((slug) => {
    const slugString = toString(get(slug, "current"));

    if (!slugString) {
      return true;
    }

    return slugString.startsWith(prefix)
      ? true
      : `The slug has to start with "${prefix}"`;
  });

// @TODO: Fix this once we will have category type
export const makeBasePageCategoriesValidator =
  <TRule extends RuleDef<TRule>>(rules: (_rule: TRule) => TRule) =>
  (rule: TRule): RuleBuilder<TRule> =>
    (rules ? rules(rule) : rule).custom<CustomValidatorResult>(
      async (value: any = []) => {
        const primaryCategories = value.filter((category: any) => category.primary);

        if (primaryCategories.length <= 0) {
          return "A page has to have a primary category";
        }

        if (primaryCategories.length > 1) {
          return "A page can only have one primary category";
        }

        return true;
      },
    );

const VALID_SCHEMES = ["http", "https", "mailto", "tel"];

export const externalLinkValidator = (value: unknown, validSchemes?: string[]) => {
  const message = `Url must start with ${(!!validSchemes?.length ? validSchemes : VALID_SCHEMES).join("|")} to be valid`;

  try {
    if (!value || typeof value !== "string") {
      return true;
    }

    const url = new URL(value);

    if (!(validSchemes || VALID_SCHEMES).includes(url.protocol.replace(":", ""))) {
      return message;
    }

    return true;
  } catch {
    return message;
  }
};
