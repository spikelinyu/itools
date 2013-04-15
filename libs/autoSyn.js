/**
 * Created with JetBrains WebStorm.
 * User: spikelinyu
 * Date: 13-4-1
 * Time: 上午11:58
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var path = require('path');

var defaultConfig = {
    filter:{
        //包含
        type:0,
        patterns:['js','css']
    },
    regexp:''
}

//copy
function watch(dirFrom, dirTo, config) {
    fs.readdir(dirFrom, function (err, files) {
        if (err) {
            console.error(err);
        }
        //copy
        else {
            var globalVal = globalInit(config);
            //loop
            var each = function (f, p) {
                return function (err, stats) {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        if (stats.isDirectory()) {
                            watch(path.join(dirFrom, f), path.join(dirTo, f), config
                            );
                        }
                        else if (stats.isFile()) {
                            if (config) {
                                //if matched
                                var matched = true;

                                //regexp
                                if (config.regexp) {
                                    var rePattern = new RegExp(config.filter);
                                    matched = rePattern.test(f);
                                    console.log(matched);
                                }
                                //filter
                                if (config.filter) {
                                    matched = filter(f,globalVal.filterRegex,config.filter.type);
                                }

                                //copy
                                matched && fs.createReadStream(p).pipe(fs.createWriteStream(path.join(dirTo, f)));

                                //auto watched
                                if (config.watched) {
                                    matched && fs.watchFile(p, function (curr, prev) {
                                        console.log('the current mtime is: ' + curr.mtime);
                                        console.log('the previous mtime was: ' + prev.mtime);
                                        //sync file
                                        fs.createReadStream(p).pipe(fs.createWriteStream(path.join(dirTo, f)));
                                    })
                                }
                            }
                            else {
                                //copy
                                fs.createReadStream(p).pipe(fs.createWriteStream(path.join(dirTo, f)));

                            }
                        }
                    }
                };
            };
            //create files
            var createFiles = function (files) {
                var i;
                for (i = 0; i < files.length; i++) {
                    var f = files[i];
                    var p = path.join(dirFrom, f);
                    fs.stat(p, each(f, p));
                }
            }

            fs.readdir(dirTo, function (err) {
                if (err) {
                    //non-existent direction
                    fs.mkdir(dirTo, function (err) {
                        if (err) {
                            console.error(err);
                        }
                        else {
                            createFiles(files);
                        }
                    });
                }

                else {
                    createFiles(files);
                }
            })
        }
    })
}

/**
 * 全局变量init
 */
function globalInit(config){
    var filterRegex='';
    if(config.filter){
        //生成filter的正则表达式
        var sep_str = '=';
        filterRegex =  '\.(?' + sep_str + config.filter.patterns.join('|') + ')';
    }
    return{
        filterRegex: filterRegex
    }
}

/**
 *
 * @param filename [String] 格式的名称
 * @param type [0||1] 0代表包含 1代表排除
 * @param filterReg [regex] 传入的正则
 */
function filter(filename, filterReg,type) {
    var matched = true;
    //匹配文件后缀名
    var filePattern = filename.substring(filename.lastIndexOf('.'), filename.length);

    var reg = new RegExp(filterReg);
    //正向预查
    if(type==0){
        matched = reg.exec(filePattern) !== null;
    }
    else if(type==1){
        matched =
            reg.exec(filePattern) === null;
    }

    return matched;
}


module.exports = {
    watch: watch
}

//正则
//watch('d:\nodetest\copyForm', 'd:\nodetest\copyTo', {watched: true, regex: '(.+)\.[js|css|png|jpg|txt]$'});
//过滤测试
watch('/Users/spikelinyu/project/sportal/assets', '/Volumes/assets/suhe/u_sportal_pre/apps/sportal', {watched: true,  filter:{
    //包含
    type:0,
    patterns:['css','js']
}});

/**
 * Note:
 * 2013-4-15
 * -first add
 *
 */