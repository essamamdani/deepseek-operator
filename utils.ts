import boxen from "boxen";
import chalk from "chalk";
import { z } from "zod";
export function announce(message: string, title?: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}

export function danger(message: string, title?: string) {
  console.log(
    boxen(chalk.red(message), {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}

export function resultBox(result: object, title?: string) {
  console.log(
    boxen(chalk.green(JSON.stringify(result, null, 2)), {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}

/**
 * Get an environment variable and throw an error if it's not found
 * @param name - The name of the environment variable
 * @returns The value of the environment variable
 */
export function getEnvVar(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (!value && required) {
    danger(`${name} not found in environment variables`, "Error");
    throw ''
  }
  return value;
}

/**
 * Validate a Zod schema against some data
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Whether the data is valid against the schema
 */
export function validateZodSchema(schema: z.ZodTypeAny, data: unknown) {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}
