import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ElementHandle } from "puppeteer";
import puppeteer from "puppeteer-extra";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(AdblockerPlugin()).use(StealthPlugin());
const getMeetingLinkRequestSchema = z.object({
  meeting_id: z.string(),
  meeting_pwd: z.string(),
});
export const joinZoomLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { meeting_id, meeting_pwd } = getMeetingLinkRequestSchema.parse(
    req.body
  );

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
  await page.goto(
    `https://app.zoom.us/wc/${meeting_id}/join?fromPWA=1&pwd=${meeting_pwd}&_x_zm_rtaid=znGhkwvMRr-KDv1o1Cq92g.1706010978832.15acb61c215967df3145161258456b40&_x_zm_rhtaid=419`,
    {
      waitUntil: "networkidle0",
      timeout: 12000000,
    }
  );

  const f = await page.waitForSelector("#webclient");
  if (!f) {
    throw new Error("Input not found");
  }

  const frame = await f.contentFrame();
  if (!frame) {
    throw new Error("Frame not found");
  }
  await frame.waitForSelector("#input-for-name");
  await frame.type("#input-for-name", "joineeName");
  console.log("Found input");
  await frame.$$eval("button", (els: any) =>
    els.find((el: any) => el.textContent.trim() === "Join").click()
  );
  await frame.waitForSelector(".join-dialog");
  res.setHeader("Content-Type", "image/png");
  const screenshotBuffer = await page.screenshot({ path: "zoom.png" });
  res.send(screenshotBuffer);
  return;
};
