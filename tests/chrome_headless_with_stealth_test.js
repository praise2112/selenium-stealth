const os = require("os");
const fs = require("fs");
const SeleniumStealth = require("../selenium_stealth");
const {Builder} = require('selenium-webdriver');
const test = (headless, stealth)=> new Promise(async resolve =>  {
    const driver = new Builder()
        .withCapabilities({
            'goog:chromeOptions': {
                args: headless ? ["--headless"] : [],
                excludeSwitches: [
                    'enable-automation',
                    'useAutomationExtension',
                ],
            },
        })
        .forBrowser('chrome')
        .build();

    const seleniumStealth = new SeleniumStealth(driver)
    if (stealth) {
        await seleniumStealth.stealth({
            languages: ["en-US", "en"],
            vendor: "Google Inc.",
            platform: "Win32",
            webglVendor: "Intel Inc.",
            renderer: "Intel Iris OpenGL Engine",
            fixHairline: true
        })
    }else {
       seleniumStealth.cdpConnection = await seleniumStealth.cdpConnection
    }

    const isWindows = os.type() === "Windows_NT"
    const url = `${isWindows ? 'file:///' : 'file://'}${__dirname.replace('\\', '/')}/static/test.html`
    await driver.get(url)
    await driver.wait(() => {
        return driver
            .executeScript('return document.readyState')
            .then((readyState) => {
                return readyState === 'complete';
            });
    });

    const metrics = await seleniumStealth.executeCDPCommand("Page.getLayoutMetrics")
    const width = Math.ceil(metrics['contentSize']['width'])
    const height = Math.ceil(metrics['contentSize']['height'])
    const screenOrientation = {angle: 0, type: 'portraitPrimary'}
    await seleniumStealth.executeCDPCommand("Emulation.setDeviceMetricsOverride", {
        mobile: false,
        width,
        height,
        screenOrientation,
        deviceScaleFactor: 1
    })
    const clip = {x:0, y:0, width, height, scale: 1}
    const opt = {format: 'png'}
    if (clip)
        opt['clip'] = clip
    const result = await seleniumStealth.executeCDPCommand("Page.captureScreenshot", opt)
    const html = await driver.getPageSource();
    fs.writeFile(`stealthtests/selenium_chrome_${headless ? 'headless' : 'headful' }_${stealth ? 'with' : 'without'}_stealth.png`, result.data, 'base64', async()=>{
        try{
            await driver.close()
            await driver.quit()
        }catch (e) {}
        resolve({html, result})
    });
})


const tests = async()=>{
    await test(true, true)
    await test(true, false)
    await test(false, true)
    await test(false, false)
}
tests()

