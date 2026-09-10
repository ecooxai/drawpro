import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.spec.js',timeout:30000,expect:{timeout:5000},fullyParallel:false,workers:2,retries:0,
 outputDir:'tests/artifacts/results',
 reporter:[['list'],['json',{outputFile:'tests/artifacts/test-results.json'}],['html',{outputFolder:'tests/artifacts/report',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4173',channel:'chrome',headless:true,viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure',actionTimeout:8000},
 projects:[{name:'Chrome desktop',use:{deviceScaleFactor:1}},{name:'Chrome Retina',use:{deviceScaleFactor:2}}],
 webServer:{command:'npm start',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:10000}
});
