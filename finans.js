#!/usr/bin/env node

var finance = require('yahoo-finance'),
    Table = require('cli-table'),
    colors = require('colors'),
    util = require('util'),
    minimist = require('minimist'),
    Decimal = require('decimal.js');

var argv = minimist(process.argv.slice(2)),
    myPrices = argv.myPrices ? argv.myPrices.split(',') : [];

finance.snapshot({
    symbols: argv['_'][0].split(',')
}, function (err, stocks) {
    if (err) {
        console.log('Could not find a stock with that symbol.'.red);
        return;
    }

    var tableChars = {},
        head = ['Exchange', 'Symbol', 'Name', 'Price', 'Change'],
        colAligns = [null, null, null, 'right', 'right'];

    if (myPrices.length > 0) {
        head.push('My Change');
        colAligns.push('right');
    }

    if (argv.style === 'compact')
        tableChars = {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''};

    var table = new Table({
        head: head,
        colAligns: colAligns,
        chars: tableChars
    });

    var q, maxDecimals = 2;

    for (stock in stocks) {
        q = stocks[stock];
        var price = new Decimal(q.askRealtime),
            decimals = Math.max(2, price.minus(Math.floor(q.askRealtime)).toString().length - 2);

        if (decimals > maxDecimals)
            maxDecimals = decimals;
    }

    for (stock in stocks) {
        q = stocks[stock];
        var exchange = q.stockExchange.grey,
            symbol = q.symbol.cyan,
            name = q.name.blue,
            price = new Decimal(q.askRealtime),
            changeVal = (typeof q.changePercentRealtime === 'string')? 0 : q.changePercentRealtime,
            changeValStr = changeVal.toString(),
            decimals = Math.max(2, price.minus(Math.floor(q.askRealtime)).toString().length - 2),
            changeStr,
            change,
            decimalPadding = '',
            myPrice = myPrices.length > stock ? new Decimal(myPrices[stock]) : null,
            myChangePercent,
            myChangePercentStr = '';

        if (myPrice) {
            myChangePercent = price.dividedBy(myPrice).minus(1).times(100);
            myChangePercentStr = myChangePercent.toFixed(2).toString() + '%';
        }

        changeVal = Math.round(changeVal * Math.pow(10, 4)) / Math.pow(10, 2);
        changeStr = changeVal.toFixed(2) + "%";
        change = changeStr;

        for (var i = decimals; i < maxDecimals; i++) {
            decimalPadding += ' ';
        }

        if (parseFloat(q.changePercentRealtime) > 0)
            change = changeStr.green;
        else if (parseFloat(q.changePercentRealtime) < 0)
            change = changeStr.red;

        if (parseFloat(myChangePercentStr) > 0)
            myChangePercentStr = myChangePercentStr.green;
        else if (parseFloat(myChangePercentStr) < 0)
            myChangePercentStr = myChangePercentStr.red;

        var rendered = [exchange, symbol, name, price.toFixed(decimals) + decimalPadding, change];

        if (myPrices.length > 0) {
            rendered.push(myChangePercentStr);
        }

        table.push(rendered);
    }

    console.log(table.toString());
});
