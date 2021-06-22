const SeleniumStealth = require("./selenium_stealth");
const {Builder} = require('selenium-webdriver');

let driver

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const init = async () => {
    driver = new Builder()
        .withCapabilities({
            'goog:chromeOptions': {
                excludeSwitches: [
                    'enable-automation',
                    'useAutomationExtension',
                ],
            },
        })
        .forBrowser('chrome')
        .build();
    const seleniumStealth = new SeleniumStealth(driver)
    await seleniumStealth.stealth({
        languages: ["ja", "en-US", "en"],
        vendor: "Google Inc.",
        platform: "Win32",
        webglVendor: "Intel Inc.",
        renderer: "Intel Iris OpenGL Engine",
        fixHairline: true
    })
    await driver.get("https://bot.sannysoft.com/");


    /** wait for page to fully load* */
    driver.wait(() => {
        return driver
            .executeScript('return document.readyState')
            .then((readyState) => {
                return readyState === 'complete';
            });
    });
    await timeout(5000)
    await driver.quit()
}

init()
