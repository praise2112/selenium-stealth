const chromeApp = require("./evasions/chrome.app");
const chromeRuntime = require("./evasions/chrome.runtime");
const hairlineFix = require("./evasions/hairline.fix");
const iframeContentWindow = require("./evasions/iframe.contentWindow");
const mediaCodecs = require("./evasions/media.codecs");
const navigatorLanguages = require("./evasions/navigator.languages");
const navigatorPermissions = require("./evasions/navigator.permissions");
const navigatorPlugins = require("./evasions/navigator.plugins");
const navigatorVendor = require("./evasions/navigator.vendor");
const navigatorWebdriver = require("./evasions/navigator.webdriver");
const utils = require("./evasions/utils");
const webglVendorOverride = require("./evasions/webgl.vendor");
const windowOuterDimensions = require("./evasions/window.outerdimensions");


/**
 If user_agent = None then selenium-stealth only remove the 'headless' from userAgent
 Here is an example of args:
 user_agent: str = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.53 Safari/537.36',
 languages: [str] = ["en-US", "en"],
 vendor: str = "Google Inc.",
 platform: str = "Win32",
 webgl_vendor: str = "Intel Inc.",
 renderer: str = "Intel Iris OpenGL Engine",
 fix_hairline: bool = False,
 run_on_insecure_origins: bool = False,
 """
 **/
const DEFAULT_OPTIONS = {
    driver: null,
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
    platform: null,
    webglVendor: "Intel Inc.",
    renderer: "Intel Iris OpenGL Engine",
    fixHairline: false,
    runOnInsecureOrigins: false
}

class SeleniumStealth {
    /**
     * Initialize selenium stealth and create cdp connection
     *  @param {Driver}  driver - selenium driver instance
     **/
    constructor (driver) {
        if (driver?.constructor?.name !== "thenableWebDriverProxy")
            throw new Error(
                "Driver must be of type 'thenableWebDriverProxy'"
            );
        this.driver = driver
        this.cdpConnection =  driver.createCDPConnection('page')
    }


    /**
     * Run evasion scripts, override user agent and listen to new tab
     *  @returns {Promise}
     *  @param {{
     *  userAgent: string=,
     *  languages: [string]=,
     *  vendor: string=,
     *  platform: string=,
     *  webglVendor: string=,
     *  renderer: string=,
     *  fixHairline: boolean=,
     *  runOnInsecureOrigins: boolean=
     *  }=} options
     * */
    async stealth(options){
        const _options = {...DEFAULT_OPTIONS, ...options}
        const {
            userAgent,
            languages,
            vendor,
            platform,
            webglVendor,
            renderer,
            fixHairline,
            runOnInsecureOrigins,
        } = _options
        const uaLanguages = languages.join(',')
        this.cdpConnection = await this.cdpConnection
        await this.executeCDPCommand('Runtime.enable')
        await this.executeCDPCommand('Page.enable')
        await this.addScriptToEvaluateOnNewDocument(utils )
        await this.addScriptToEvaluateOnNewDocument(chromeApp)
        await this.addScriptToEvaluateOnNewDocument(chromeRuntime, {runOnInsecureOrigins})
        await this.addScriptToEvaluateOnNewDocument(iframeContentWindow)
        await this.addScriptToEvaluateOnNewDocument(mediaCodecs)
        await this.addScriptToEvaluateOnNewDocument(navigatorLanguages, {languages})
        await this.addScriptToEvaluateOnNewDocument(navigatorPermissions)
        await this.addScriptToEvaluateOnNewDocument(navigatorPlugins)
        await this.addScriptToEvaluateOnNewDocument(navigatorVendor, {vendor})
        await this.addScriptToEvaluateOnNewDocument(navigatorWebdriver)
        await this.userAgentOverride(userAgent, uaLanguages, platform)
        await this.addScriptToEvaluateOnNewDocument(webglVendorOverride, {webglVendor, renderer})
        await this.addScriptToEvaluateOnNewDocument(windowOuterDimensions)
        if (fixHairline)
            await this.addScriptToEvaluateOnNewDocument(hairlineFix)
    }


    getRandId(){
      return Math.floor(Math.random() * (1 - 10000 + 1)) + 10000;
    }

    /**
     * @param {function} func - the evasion function
     * @param {Object=} args - argument to pass to script
     * */
    async addScriptToEvaluateOnNewDocument(func, args={}){
        const _args = Object.values(args).map(arg => {
            if(typeof arg === 'string') return `"${arg}"`
            else if (Array.isArray(arg)) return JSON.stringify(arg)
            else return arg
        }).join(',')
        await this.driver.executeScript(`(${func.toString()})(${_args})`)
        await this.executeCDPCommand("Page.addScriptToEvaluateOnNewDocument", {source: `(${func.toString()})(${_args})`, func})
    }

    /**
     * Override browser user agent
     * @param {string} userAgent
     * @param {string} language
     * @param {string} platform
     * **/
    async userAgentOverride(
        userAgent,
        language,
        platform,
    ){
        let ua
        if (!userAgent)
            ua = await this.getUserAgent()
        else
            ua = userAgent
        ua = ua.replace("HeadlessChrome", "Chrome") // hide headless nature
        let override = {}
        if (language && platform)
            override = {"userAgent": ua, "acceptLanguage": language, "platform": platform}
        else if (!language && platform)
            override = {"userAgent": ua, "platform": platform}
        else if (language && !platform)
            override = {"userAgent": ua, "acceptLanguage": language}
        else
            override = {"userAgent": ua}
        await this.executeCDPCommand("Network.setUserAgentOverride", override)
    }

    async getUserAgent(){
        const result = await this.executeCDPCommand("Browser.getVersion", {})
        return result.userAgent
    }

    /**
    * Execute cpd command
    * @param {string} method - Name of cdp method
     * @param {Object=} params - method params
    * */
    executeCDPCommand(method, params={}) {
       return new Promise(async resolve => {
            const randId = this.getRandId()
            const messageHandler = (message) => {
               const {id, result, method, error} = JSON.parse(message)
                if (error){
                    throw new Error(`An error occurred when executing cdp command from ${method} \n ${error}`)
                }
               const runtimeContextCreated = method === 'Runtime.executionContextCreated'
                if (!id) {
                    return this.cdpConnection._wsConnection.once('message', messageHandler)
                }
               if ((id === randId) || runtimeContextCreated) {
                   resolve(result)
               }
           }
            this.cdpConnection._wsConnection.once('message', messageHandler)
            this.cdpConnection.execute(
                method,
                randId,
                params,
                null
            )
        })
    }
}


module.exports = SeleniumStealth

