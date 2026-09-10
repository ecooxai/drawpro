import {defineConfig} from '@playwright/test';
const port=process.env.APP_PORT||'4173';
export default defineConfig({
 testDir:'./tests/v2',timeout:30000,expect:{timeout:5000},workers:2,retries:0,
 outputDir:'tests/artifacts/v2/results',
 reporter:[['list'],['json',{outputFile:'tests/artifacts/v2/test-results.json'}],['html',{outputFolder:'tests/artifacts/v2/report',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:'+port,channel:'chrome',headless:true,viewport:{width:1280,height:800},screenshot:'only-on-failure',trace:'retain-on-failure'},
 projects:[{name:'Chrome desktop',use:{deviceScaleFactor:1}},{name:'Chrome Retina',use:{deviceScaleFactor:2}}],
 webServer:{command:port==='4174'?'PORT=4174 node staging-v2/server.mjs':'npm start',url:'http://127.0.0.1:'+port,reuseExistingServer:true}
});
