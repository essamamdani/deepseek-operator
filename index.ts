
import StagehandConfig from "./stagehand.config.js";
import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import dotenv from "dotenv";
import { AISdkClient } from "./aisdk_client.js";
import { groq } from "@ai-sdk/groq";
import { announce, getEnvVar, resultBox } from "./utils.js";

dotenv.config();

export async function main({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  await page.goto("https://news.ycombinator.com");

  const headlines = await page.extract({
    instruction: "Extract the top 3 stories from the Hacker News homepage.",
    schema: z.object({
      stories: z
        .array(
          z.object({
            title: z.string(),
            points: z.number(),
          })
        )
        .length(3),
    }),
    useTextExtract: true,
  });

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log("Session completed. Waiting for 10 seconds to see the logs and recording...");
    //   Wait for 10 seconds to see the logs
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(
      announce(
        `View this session recording in your browser: \n${`https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`}`,
        "Browserbase"
      )
    );
  }
  
  resultBox(headlines, "Hacker News Headlines");
  //   Close the browser
  await page.close();

}

(async () => {
  getEnvVar("GROQ_API_KEY",true)
  getEnvVar("BROWSERBASE_LOCAL",true)
  if(!process.env.BROWSERBASE_LOCAL){
    getEnvVar("BROWSERBASE_API_KEY",true)
    getEnvVar("BROWSERBASE_PROJECT_ID",true)
  }
  const stagehand = new Stagehand({
    ...StagehandConfig,
    llmClient: new AISdkClient({
      model: groq("deepseek-r1-distill-llama-70b"),
    }),
  });
  await stagehand.init();
  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
  });
  await stagehand.close();
  process.exit(0);
})().catch(console.error);
