import { NextFunction, Request, Response } from "express";
import { z } from "zod";
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
import {
  PuppeteerScreenRecorder,
  PuppeteerScreenRecorderOptions,
} from "puppeteer-screen-recorder";
puppeteer.use(StealthPlugin());
const getMeetingLinkRequestSchema = z.object({
  meeting_url: z.string().url(),
});
export const getMeetingLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { meeting_url } = getMeetingLinkRequestSchema.parse(req.body);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--incognito",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-infobars",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
    ignoreDefaultArgs: ["--mute-audio"],
  });
  var page = (await browser.pages())[0];
  await page.goto(meeting_url, {
    waitUntil: "networkidle0",
    timeout: 120000,
  });
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start("./report/video/meeting.mp4");

  // Wait for 5 seconds (or however long you want to record)
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Stop recording
  
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://meet.google.com/", [
    "microphone",
    "camera",
    "notifications",
  ]);
  await page.waitForXPath(
    '//button/span[contains(text(), "Continue without microphone and camera")]'
  );
  const buttons = await page.$x(
    '//button/span[contains(text(), "Continue without microphone and camera")]'
  );
  if (buttons.length > 0) {
    await buttons[0].click();
  } else {
    throw new Error("Button not found");
  }

  await page.waitForSelector('input[aria-label="Your name"]', {
    visible: true,
    timeout: 50000,
    hidden: false,
  });
  await page.click(`input[aria-label="Your name"]`);
  await page.type(`input[aria-label="Your name"]`, "Nambiar");
  await page.click(
    `button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc LQeN7 jEvJdc QJgqC"]`
  );
  await page.waitForTimeout(20000);
  const screenshotBuffer = await page.screenshot();
  await recorder.stop();

  await browser.close();

  res.setHeader("Content-Type", "image/png");
  res.send(screenshotBuffer);
};
