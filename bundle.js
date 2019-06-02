const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverser = require('@babel/traverse').default;
const babel = require('@babel/core');


//转换单个文件，记录单个文件的依赖关系
function parseDependencies(filename) {
    const content = fs.readFileSync(filename, 'utf-8')
    const ast = parser.parse(content, { sourceType: 'module' });
    const dependencies = {};
    //遍历语法树，识别import语句，存储依赖关系
    traverser(ast, {
        ImportDeclaration({ node }) {
            const dirname = path.dirname(filename);
            const newFile = './' + path.join(dirname, node.source.value);
            dependencies[node.source.value] = newFile;
        }
    });

    //将es6转换成es5
    const { code } = babel.transformFromAst(ast, null, {
        presets: ['@babel/preset-env']
    });

    return {
        filename,
        dependencies,
        code
    }
}


//生成文件依赖图谱
function getDenpendenciesGraph(entry, graphObj = {}){
    const entryModule = parseDependencies(entry);
    const { filename, dependencies, code } = entryModule;
    graphObj[filename] = { code, dependencies }
    for (let j in dependencies) {
        //递归查找依赖
        getDenpendenciesGraph(dependencies[j], graphObj);
    }
    return graphObj;
}

//根据文件依赖图谱生成可执行代码
function bundle(entry){
    const graph = JSON.stringify(getDenpendenciesGraph(entry));
    return `
        (function(graph) {
            //require函数的本质是执行一个模块的代码，然后将相应变量挂载到exports对象上
            function require(module) {
                //localRequire的本质是拿到依赖包的exports变量
                function localRequire(relativePath) {
                    return require(graph[module].dependencies[relativePath]);
                }
                var exports = {};
                (function(require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);
                return exports;
            }
            require('${entry}')
        })(${graph})`
}

module.exports= {
    parseDependencies,
    getDenpendenciesGraph,
    bundle
};