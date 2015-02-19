#!/usr/bin/env node

var finance = require('yahoo-finance'),
    Table = require('cli-table'),
    colors = require('colors'),
    util = require('util'),
    minimist = require('minimist'),
    Decimal = require('decimal.js');

var argv = minimist(process.argv.slice(2));

finance.snapshot({
    symbols: argv['_'][0].split(',')
}, function (err, stocks) {
    if (err) {
        console.log('Could not find a stock with that symbol.'.red);
        return;
    }

    var tableChars = {};

    if (argv.style === 'compact')
        tableChars = {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''};

    var table = new Table({
        head: ['Exchange', 'Symbol', 'Name', 'Price', 'Change'],
        colAligns: [null, null, null, 'right', 'right'],
        chars: tableChars
    });

    var q;

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
            change;

        changeVal = Math.round(changeVal * Math.pow(10, 4)) / Math.pow(10, 2);
        changeStr = changeVal.toFixed(2) + "%";
        change = changeStr;

        if (parseFloat(q.changePercentRealtime) > 0)
            change = changeStr.green;
        else if (parseFloat(q.changePercentRealtime) < 0)
            change = changeStr.red;

        table.push([exchange, symbol, name, price.toFixed(decimals), change]);
    }

    console.log(table.toString());
});
