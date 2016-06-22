'use strict';

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

driver.get('https://koudaitong.com/v2/showcase/goods#list&keyword=&p=1&orderby=created_time&order=desc&page_size=20');
driver.findElement(By.name('account')).sendKeys('13621822254');
driver.findElement(By.name('password')).sendKeys('z5896321');
driver.findElement(By.name('captcha_code')).sendKeys('z5896321');
driver.wait(until.titleIs('商品管理 - 尖叫设计'), 15000);




// driver.quit();
