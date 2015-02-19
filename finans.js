#!/usr/bin/env node

var finance = require('yahoo-finance'),
    Table = require('cli-table'),
    colors = require('colors'),
    util = require('util'),
    minimist = require('minimist');

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
        chars: tableChars
    });

    var q;

    for (stock in stocks) {
        q = stocks[stock];
        var exchange = q.stockExchange.grey,
            symbol = q.symbol.cyan,
            name = q.name.blue,
            price = q.askRealtime,
            changeVal = (typeof q.changePercentRealtime === 'string')? 0 : q.changePercentRealtime,
            changeValStr = changeVal.toString(),
            decimals = changeValStr.substr(changeValStr.indexOf('.')).length - 1,
            changeStr,
            change;

        changeVal = Math.round(changeVal * Math.pow(10, decimals)) / Math.pow(10, decimals - 2);
        changeStr = changeVal + "%";
        change = changeStr;

        if (parseFloat(q.changePercentRealtime) > 0)
            change = changeStr.green;
        else if (parseFloat(q.changePercentRealtime) < 0)
            change = changeStr.red;

        table.push([exchange, symbol, name, price, change]);
    }

    console.log(table.toString());
});
