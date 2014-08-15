var Q = require('q'),
    exec = require('child_process').exec,
    handlebars = require('handlebars'),
    fs = require('fs');

var dude_path = '/tmp/dude/';

var Instance = function instance(domain){
    var self = this;
    this.domain = domain;
    this.project_dir = dude_path + domain;
    this.project_vhost = this.project_dir + '/vhost';
    this.project_app = '/var/www/'+domain;
    this.project_doc_root = this.project_app + '/public';
    this.symlink_path = '/etc/nginx/sites-enabled/' + domain;
    this.create = function(){
	return self.create_directories()
	    .then(self.generate_vhost)
            .then(self.generate_sample_index)
	    .fail(console.log)
	    .done(console.log(self.domain + ' created'));
    }

    this.start = function(){
	var cmd = '/bin/ln -s '+self.vhost_path + ' ' + self.symlink_path;
	exec(cmd, function(err,stout,sterr){
	    if(err){
		//console.log('err',err);
		console.log(self.domain + ' already started')
	    }else{

		var cmd = "/etc/init.d/nginx restart";
		exec(cmd, function(err, stout, sterr){
		    if(err) {
			console.log(err);
		    }else{
			console.log(self.domain + ' started');
		    }
		});
	    }
	})
    }

    this.stop = function(){
	var cmd = '/bin/rm ' + self.symlink_path;
	exec(cmd, function(err,stout,sterr){
	    if(err){
		console.log('err',err);
	    }else{

		// restart nginx
		var cmd = "/etc/init.d/nginx restart";
		exec(cmd, function(err, stout, sterr){
		    if(err) {
			console.log(err);
		    }else{
			console.log(self.domain + ' stopped');
		    }
		});
	    }
	})

    }

    this.create_directories = function(){
        return Q.promise(function(resolve,reject,notify){
	    //console.log('create folders');
            create_directory(self.project_dir)
                .then( function(){
                    return create_directory(self.project_vhost);
                }).then( function(){
                    return create_directory(self.project_app);
                }).then( function(){
                    return create_directory(self.project_doc_root);
                }).fail( function(){
                    reject()
                }).done( function(){
                    resolve();
                })
        });
    }

    this.generate_sample_index = function(){
        return Q.promise( function(resolve, reject, notify){
            read_template('sample.html').then( function(html){
                var template = handlebars.compile(html);
                var string = template( {domain:self.domain} )
                //write string to vhost/default
                console.log(string);
                fs.writeFile(self.project_doc_root + '/index.html', string, function(err){
                    if(err){
                        return reject(err);
                    }
                    console.log('sample generated');
                    resolve();
                });
            })
        })
    }

    this.generate_vhost = function(){
        return Q.promise( function(resolve, reject, notify){

            read_template('nginx_vhost.conf').then( function(conf){

                var template = handlebars.compile(conf);
                var string = template( {domain:self.domain} )
		var vhost_path = self.project_vhost + '/default';

                fs.writeFile(vhost_path, string, function(err){
                    if(err){
                        return reject(err);
                    }else{
			//console.log('vhost generated');
		    }
                });
            })
        })
    }

}

module.exports = Instance;

function check_directory(dir_path){
    //console.log('checking for directory');
    return Q.promise( function(resolve,reject,notify){
        var cmd = 'touch ' + dir_path + '/test';
        exec(cmd, function(err,stout,sterr){
            if(err){
                //console.log('err',err);
                return reject(dir_path);
            }else{
                //console.log('directory found: ' + dir_path);
                return resolve();
            }
        })
    });
}

function create_directory(dir_path){
    //console.log('creating directory');
    return Q.Promise(function(resolve,reject,notify){
        check_directory(dir_path).then( function(){
            resolve();
        }).fail(function(){
            var cmd = 'mkdir -p ' + dir_path;
            exec(cmd, function(err,stout,sterr){
                if(err){
                    console.log('error creating directory',err);
                    reject();
                }else{
                    //console.log('directory created');
                    resolve();
                }
            })
        })
    })
}

function read_template(file){
    //console.log('reading template');
    return Q.promise( function(resolve,reject,notify){
        fs.readFile('templates/' + file, function(err, data){
            if(err){ return reject(err); }
            return resolve(data.toString());
        });
    })
}
