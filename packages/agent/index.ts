import fs from "fs";
import path from "path";

const template = fs.readFileSync(
  path.join(__dirname, "templates/base-agent.txt"),
  "utf8"
);

export function buildAgentPrompt(config: {
  companyName: string;
  description: string;
  context: string;
}) {
  return template
    .replace("{{company_name}}", config.companyName)
    .replace("{{company_description}}", config.description)
    .replace("{{context}}", config.context);
}
