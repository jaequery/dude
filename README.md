#dude - The cPanel killer! 

Dude is an automated LEMP management tool for Ubuntu.


###Example

To create a vhost, just do the following:
```
dude create site.com
dude start site.com
```


====

```
root@1c14046357b7:~/# node dude.js

  Usage: dude [options] [command]

  Commands:

    init [options]
       initialize dude

    create <domain>
       create a domain

    start <domain>
       start a domain

    stop <domain>
       stop a domain

    list
       list domains

    delete <domain>
       delete a domain

    backup <domain>
       backup domain


  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    
```
