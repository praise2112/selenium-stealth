# selenium-stealth [![Build Status](https://travis-ci.com/diprajpatra/selenium-stealth.svg?branch=main)](https://travis-ci.com/diprajpatra/selenium-stealth)

A nodejs package **selenium-stealth** to prevent detection. This programme is trying to make nodejs selenium more stealthy. 

As of now selenium-stealth
- Only support Selenium Chrome/Chromium 
- Only works with selenium 4
- Only works on the first tab open by the browser

After using selenium-stealth you can prevent almost all selenium detections. 
***
This a nodeJs version of selenium stealth forked from the [python version](https://github.com/diprajpatra/selenium-stealth). \
And the python version is a re-implementation of JavaScript [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) developed by [@berstend](https://github.com/berstend>).
***


Features that currently selenium-stealth can offer:

- ✅️ **`selenium-stealth` with stealth passes all public bot tests.**

- ✅️ **With `selenium-stealth` selenium can do google account login.**

- ✅️ **`selenium-stealth` help with maintaining a normal reCAPTCHA v3 score**

## Install
Selenium-stealth is available on npm.
```
$ npm install selenium-stealth
```

## Usage

```javascript
const SeleniumStealth = require("./selenium_stealth");
const {Builder} = require('selenium-webdriver');

const driver = new Builder()
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
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
    platform: "Win32",
    webglVendor: "Intel Inc.",
    renderer: "Intel Iris OpenGL Engine",
    fixHairline: true
})
driver.get("https://bot.sannysoft.com/");
```

## Args

``` javascript
new SeleniumStealth(driver: Driver)


seleniumStealth.stealth(
       userAgent: string= "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.53 Safari/537.36",
       languages: [string]= ["en-US", "en"],
       vendor: string= "Google Inc.",
       platform: string= "Win32",
       webglVendor: string = "Intel Inc.",
       renderer: string = "Intel Iris OpenGL Engine",
       fixHairline: boolean = false,
       runOnInsecureOrigins: boolean = false
       )
```

## Test results (red is bad)

### Selenium without <strong>selenium-stealth 😢</strong>

<table class="image">
<tr>
  <td><figure class="image"><a href="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headless_without_stealth.png"><img src="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headless_without_stealth.png"></a><figcaption>headless</figcaption></figure></td>
  <td><figure class="image"><a href="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headful_without_stealth.png"><img src="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headful_without_stealth.png"></a><figcaption>headful</figcaption></figure></td>
</tr>
</table>

### Selenium with <strong>selenium-stealth 💯</strong>

<table class="image">
<tr>
  <td><figure class="image"><a href="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headless_with_stealth.png"><img src="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headless_with_stealth.png"></a><figcaption>headless</figcaption></figure></td>
  <td><figure class="image"><a href="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headful_with_stealth.png"><img src="https://raw.githubusercontent.com/diprajpatra/selenium-stealth/main/stealthtests/selenium_chrome_headful_with_stealth.png"></a><figcaption>headful</figcaption></figure></td>
</tr>
</table>

## License

Copyright © 2020, [praise2112](https://github.com/praise2112). Released under the MIT License.
