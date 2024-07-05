const { spawn } = require('child_process');

const { chromium } = require ('playwright');

//Update browser path to use the desired browser
const browserPath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

spawn(browserPath, ['--remote-debugging-port=9222'], { detached: true });

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    await wait(3000);
    
    let isGetSticker = true;
    let isGetCard    = true;

    process.argv.forEach( arg => {
                                    if (arg === '-c') //Only get card
                                        isGetSticker = false;
                                    if (arg === '-s') //Only get sticker
                                        isGetCard = false;
                                }
                        );

    const browser = await chromium.connectOverCDP('http://localhost:9222', {
        headless: false,
    });
    const defaultContext = browser.contexts()[0];
    const page           = defaultContext.pages()[0];

    await page.goto('https://store.steampowered.com/category/action');

    if (isGetSticker) {
        //Get sticker button
        const button = "#SaleSection_512062 > div > div > button";
        
        await page.waitForLoadState("load");

        await page.locator(button).click();

        //Close button
        const closeButton = "body > div.FullModalOverlay > div.ModalOverlayContent.active > div > div > div.DialogContent._DialogLayout.GenericConfirmDialog._DialogCenterVertically > div > form > div.DialogBody.Panel.Focusable > div.DialogFooter > button"

        await page.locator(closeButton).click();
    }

    if (isGetCard) {
        await page.goto('https://store.steampowered.com');

        //Open queue
        const selector = "#discovery_queue_start_link";

        await page.locator(selector).click();

        await page.waitForLoadState("load");

        //10 times for queue length
        for (let i = 0; i < 10; i++) {
            //Next button
            const nextButton = "#nextInDiscoveryQueue > div.btn_next_in_queue.btn_next_in_queue_trigger";

            //Next button for age restriction
            const nextButtonForAge = "#app_agegate > div.main_content_ctn > div.agegate_text_container.btns > div > a.btn_next_in_queue.btn_next_in_queue_trigger > div";
    
            await page.waitForLoadState("load");

            const button = page.locator(nextButton);
        
            await button.waitFor({
                timeout: 1000,
            });

            if (button)
                await page.click(nextButton);
            else
                await page.click(nextButtonForAge);
        }
    }

    await browser.close();
})();
