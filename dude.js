#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var dude = require('./instance.js');
//init();
program.version('0.0.1');

program.command('init')
    .description('initialize dude')
    .option('-r, --restart','restart dude')
    .option('-res, --res [value]','testing')
    .action( function(options){
        //dude.init();
    });

program.command('create <domain>')
    .description('create a domain')
    .action( function(domain){
        var container = new dude(domain);
        container.create();
    });

program.command('start <domain>')
    .description('start a domain')
    .action( function(domain){
        var container = new dude(domain);
        container.start();
    });

program.command('stop <domain>')
    .description('stop a domain')
    .action( function(domain){
        var container = new dude(domain);
        container.stop();
    });

program.command('list')
    .description('list domains')
    .action( function(){
        console.log('listing domains...');
    });

program.command('delete <domain>')
    .description('delete a domain')
    .action( function(domain){
        console.log('deleting domain ... ',domain);
    });

program.command('backup <domain>')
    .description('backup domain')
    .action( function(domain){
        console.log(domain);
    });

program.command('ssh <domain>')
    .description('ssh into a domain')
    .action( function(domain){
        console.log(domain);
    });

program.parse(process.argv);

if(process.argv.length == 2){
    program.help();
}
